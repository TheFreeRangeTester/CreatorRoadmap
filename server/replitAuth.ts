import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'replit_session_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  // Transformamos el ID numérico de Replit a string para almacenarlo en nuestra BD
  const replitUserId = claims["sub"];
  
  // Generamos un nombre de usuario válido a partir del email o datos disponibles
  let username = '';
  if (claims["email"]) {
    username = claims["email"].split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  } else {
    username = `user_${replitUserId}`;
  }
  
  // Comprobar si existe un usuario con este replitId
  const existingUser = await storage.getUserByReplitId(replitUserId);
  
  if (existingUser) {
    // Actualizar el usuario existente
    return await storage.updateUserProfile(existingUser.id, {
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      logoUrl: claims["profile_image_url"],
      replitId: replitUserId,
    });
  } else {
    // Verificar si el username ya existe y ajustarlo si es necesario
    let uniqueUsername = username;
    let counter = 1;
    while (await storage.getUserByUsername(uniqueUsername)) {
      uniqueUsername = `${username}${counter}`;
      counter++;
    }
    
    // Crear nuevo usuario
    return await storage.createUser({
      username: uniqueUsername,
      password: "", // No necesitamos contraseña para usuarios de Replit Auth
      email: claims["email"],
      logoUrl: claims["profile_image_url"],
      profileDescription: `${claims["first_name"] || ''} ${claims["last_name"] || ''}`.trim(),
      replitId: replitUserId,
      userRole: "audience", // Por defecto todos los usuarios son 'audience'
    });
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const user: any = {};
      updateUserSession(user, tokens);
      const dbUser = await upsertUser(tokens.claims());
      user.databaseUser = dbUser;
      verified(null, user);
    } catch (error) {
      console.error("Error in verification:", error);
      verified(error as Error);
    }
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Redirección a la que volver después del login
    const redirectTo = req.query.redirect || "/";
    req.session.returnTo = redirectTo;
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      failureRedirect: "/auth?error=authentication_failed",
    })(req, res, (err) => {
      if (err) return next(err);
      const returnTo = (req.session as any).returnTo || "/";
      delete (req.session as any).returnTo;
      res.redirect(returnTo);
    });
  });

  app.get("/api/logout", (req, res) => {
    const returnTo = req.query.redirect || "/";
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}${returnTo}`,
        }).href
      );
    });
  });
  
  // Endpoint para obtener la información del usuario actual
  app.get("/api/auth/user", (req: any, res) => {
    if (!req.isAuthenticated() || !req.user?.databaseUser) {
      return res.status(401).json({ authenticated: false });
    }
    
    // Devolver la información del usuario desde la base de datos
    res.json({
      ...req.user.databaseUser,
      authenticated: true
    });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.isAuthenticated() || !req.user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= req.user.expires_at) {
    return next();
  }

  const refreshToken = req.user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(req.user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};