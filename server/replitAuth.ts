import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";

if (!process.env.REPLIT_DOMAINS) {
  console.warn("Environment variable REPLIT_DOMAINS not provided - using hostname from request");
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

// Session setup
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    tableName: "sessions",
    createTableIfMissing: true,
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "development-session-secret",
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
  const replitId = claims["sub"];
  // Comprobamos si el usuario ya existe
  let user = await storage.getUserByReplitId(replitId);
  
  // Si no existe, creamos un nuevo usuario
  if (!user) {
    // A los nuevos usuarios se les asigna un username aleatorio temporal
    const tempUsername = `user_${replitId.substring(0, 8)}`;
    user = await storage.createUser({
      username: tempUsername,
      replitId: replitId,
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      email: claims["email"],
      userRole: 'audience', // Por defecto, rol de audiencia
    });
  } else {
    // Actualizamos la información del usuario si ha cambiado
    if (claims["first_name"] !== user.firstName || 
        claims["last_name"] !== user.lastName || 
        claims["email"] !== user.email) {
      user = await storage.updateUserProfile(user.id, {
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        email: claims["email"],
      });
    }
  }
  
  return user;
}

export async function setupAuth(app: Express) {
  // Configure Express for sessions
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    // Registramos/actualizamos al usuario en nuestra base de datos
    const dbUser = await upsertUser(tokens.claims());
    // Combinamos la información de la sesión con los datos de la BD
    const combinedUser = { ...user, ...dbUser };
    verified(null, combinedUser);
  };

  // Estrategia para manejar múltiples dominios
  const setupStrategy = (domain: string) => {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        client: new client.Client({
          issuer: config.issuer,
          client_id: process.env.REPL_ID!,
          redirect_uris: [`https://${domain}/api/callback`],
          response_types: ['code'],
        }),
        scope: "openid email profile offline_access",
        usePKCE: false,
      },
      verify,
    );
    passport.use(strategy);
  };

  // Si tenemos REPLIT_DOMAINS, configuramos estrategia para cada dominio
  if (process.env.REPLIT_DOMAINS) {
    for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
      setupStrategy(domain.trim());
    }
  }
  
  // Si no hay dominios configurados, manejamos el dominio dinámicamente
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Configura el inicio de sesión
  app.get("/api/login", (req, res, next) => {
    // Usa el dominio de la solicitud si no hay REPLIT_DOMAINS
    const domain = req.get('host') || '';
    
    // Comprueba si hay una estrategia para este dominio, si no, usa una genérica
    const strategyName = passport.Authenticator.prototype._strategy(`replitauth:${domain}`) 
      ? `replitauth:${domain}` 
      : Object.keys(passport._strategies).find(s => s.startsWith('replitauth:'));
    
    if (!strategyName) {
      // Si no hay ninguna estrategia configurada, crea una para este dominio
      setupStrategy(domain);
    }
    
    passport.authenticate(strategyName || `replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  // Callback después de la autenticación
  app.get("/api/callback", (req, res, next) => {
    const domain = req.get('host') || '';
    const strategyName = passport.Authenticator.prototype._strategy(`replitauth:${domain}`) 
      ? `replitauth:${domain}` 
      : Object.keys(passport._strategies).find(s => s.startsWith('replitauth:'));
      
    passport.authenticate(strategyName || `replitauth:${domain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/auth",
    })(req, res, next);
  });

  // Cierre de sesión
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.get('host')}`,
        }).href
      );
    });
  });

  // Obtener usuario actual
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ authenticated: false });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const client = new client.Client({
      issuer: config.issuer,
      client_id: process.env.REPL_ID!,
      redirect_uris: [`https://${req.get('host')}/api/callback`],
      response_types: ['code'],
    });
    const tokenSet = await client.refresh(refreshToken);
    updateUserSession(user, tokenSet);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};