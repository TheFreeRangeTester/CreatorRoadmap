import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { db, pool } from "./db";

// Extender la interfaz Session para incluir nuestros campos personalizados
declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
    userRole?: string;
    authRedirect?: string;
    authRole?: string;
    passport?: {
      user?: any;
    };
  }
}

if (!process.env.REPLIT_DOMAINS) {
  console.warn("Advertencia: Variable de entorno REPLIT_DOMAINS no proporcionada. Algunas características pueden no funcionar correctamente.");
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

async function upsertUser(claims: any, role?: string) {
  try {
    // Buscar si el usuario ya existe por su replitId
    const existingUser = await storage.getUserByReplitId(claims["sub"]);
    
    if (existingUser) {
      // Actualizar información del usuario existente
      return await storage.updateUserProfile(existingUser.id, {
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        logoUrl: claims["profile_image_url"], // Usamos logoUrl para la imagen de perfil
      });
    } else {
      // Crear un nuevo usuario
      // Generamos un nombre de usuario a partir del email si está disponible, o del ID de Replit
      const emailUsername = claims["email"] ? claims["email"].split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : null;
      const username = emailUsername || `user${claims["sub"]}`;
      
      // Verificar si ya existe un usuario con ese nombre, agregar sufijo si es necesario
      let finalUsername = username;
      let counter = 1;
      let usernameTaken = true;
      
      while (usernameTaken) {
        const existingUsername = await storage.getUserByUsername(finalUsername);
        if (!existingUsername) {
          usernameTaken = false;
        } else {
          finalUsername = `${username}${counter++}`;
        }
      }
      
      // Validar el rol de usuario
      const userRole = (role === 'creator' ? 'creator' : 'audience') as 'creator' | 'audience';
      
      // Crear el usuario con los datos de Replit
      return await storage.createUser({
        username: finalUsername,
        replitId: claims["sub"],
        email: claims["email"],
        firstName: claims["first_name"],
        lastName: claims["last_name"],
        logoUrl: claims["profile_image_url"],
        userRole: userRole,
        password: null, // No se requiere password con Replit Auth
      });
    }
  } catch (error) {
    console.error("Error en upsertUser:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  // Configure Express for sessions
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  try {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      try {
        const user: any = {};
        updateUserSession(user, tokens);
        
        // Determinar el rol del usuario (podría estar en la URL como parámetro)
        // Si es un nuevo usuario, se usa role para determinar su rol inicial
        // Si es un usuario existente, mantendrá su rol actual
        const role = user.role || "audience";
        
        // Insertar o actualizar el usuario en nuestra base de datos
        const dbUser = await upsertUser(tokens.claims(), role);
        
        // Combinar la información de Replit Auth con nuestro usuario de BD
        user.dbUser = dbUser;
        
        verified(null, user);
      } catch (error) {
        console.error("Error en verificación de usuario:", error);
        verified(error as Error);
      }
    };

    // Determinar si estamos en desarrollo o producción
    // En desarrollo o con NODE_ENV diferente de 'production', usamos auth local
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    console.log(`Configurando auth para entorno: ${isDevelopment ? 'desarrollo' : 'producción'}`);
    
    // Lista de dominios para Replit Auth en producción
    const domains = process.env.REPLIT_DOMAINS 
      ? process.env.REPLIT_DOMAINS.split(",") 
      : [];

    if (isDevelopment) {
      // En desarrollo, configuración simplificada para pruebas locales
      // No hacemos la configuración completa de Replit Auth
      console.log("Usando autenticación simplificada para desarrollo local");
    } else {
      // Configuración real de Replit Auth para producción
      for (const domain of domains) {
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
    }

    // Serializar usuario con ID de Replit y nuestro ID interno
    passport.serializeUser((user: any, cb) => {
      // Si tenemos un usuario de BD, serializamos su ID
      if (user.dbUser && user.dbUser.id) {
        return cb(null, { 
          id: user.dbUser.id, 
          replitId: user.claims.sub,
          // Incluir información para refrescar token si es necesario
          expires_at: user.expires_at,
          refresh_token: user.refresh_token
        });
      }
      
      // Fallback para mantener compatibilidad
      cb(null, user);
    });

    // Deserializar usuario usando nuestro ID interno
    passport.deserializeUser(async (serialized: any, cb) => {
      try {
        // Si tenemos un ID numérico, es nuestro ID interno
        if (typeof serialized === 'object' && serialized.id) {
          const user = await storage.getUser(serialized.id);
          
          if (user) {
            // Añadir información de Replit Auth
            const extendedUser = {
              ...user,
              replitAuthInfo: {
                replitId: serialized.replitId,
                expires_at: serialized.expires_at,
                refresh_token: serialized.refresh_token
              }
            };
            return cb(null, extendedUser);
          }
        }
        
        // Si llegamos aquí, el usuario no se pudo deserializar correctamente
        cb(null, serialized);
      } catch (error) {
        cb(error);
      }
    });

    // Configuramos las rutas de autenticación según el entorno
    if (isDevelopment) {
      // En entorno de desarrollo, usamos rutas simplificadas que redirigen
      // a la interfaz local de autenticación
      
      // Ruta de inicio de sesión simplificada
      app.get("/api/login", (req, res) => {
        const isSignup = req.query.signup === 'true';
        const redirectTo = (req.query.redirect as string) || '/';
        const role = (req.query.role as string) || 'audience';
        
        // Guardar información para después del login
        req.session.returnTo = redirectTo;
        req.session.userRole = role;
        
        // Redirigir a la página local de autenticación
        if (isSignup) {
          res.redirect(`/auth?mode=register&redirect=${encodeURIComponent(redirectTo)}`);
        } else {
          res.redirect(`/auth?redirect=${encodeURIComponent(redirectTo)}`);
        }
      });
      
      // Mantenemos la ruta de API para login con credenciales local
      app.post('/api/auth/login', async (req, res) => {
        try {
          const { username, password } = req.body;
          
          if (!username) {
            return res.status(400).json({ 
              success: false, 
              message: 'El nombre de usuario es requerido' 
            });
          }
          
          // Buscar usuario por nombre de usuario
          const user = await storage.getUserByUsername(username);
          
          if (!user) {
            return res.status(401).json({ 
              success: false, 
              message: 'Credenciales inválidas' 
            });
          }
          
          // En modo desarrollo, permitimos iniciar sesión sin verificar contraseña
          req.login(user, (err) => {
            if (err) {
              console.error("Error durante login:", err);
              return res.status(500).json({ 
                success: false, 
                message: 'Error de autenticación' 
              });
            }
            
            // Redirigir a la página que se especificó originalmente
            const redirectTo = req.session.returnTo || '/';
            delete req.session.returnTo;
            
            console.log(`Usuario autenticado: ${user.username}, redirección a: ${redirectTo}`);
            
            return res.json({ 
              success: true, 
              user: {
                id: user.id,
                username: user.username,
                userRole: user.userRole
              },
              redirectTo
            });
          });
        } catch (error) {
          console.error("Error en login:", error);
          res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
          });
        }
      });
      
      // Ruta para registro de usuarios local
      app.post('/api/auth/register', async (req, res) => {
        try {
          const { username, password, userRole: providedRole, email } = req.body;
          
          if (!username) {
            return res.status(400).json({ 
              success: false, 
              message: 'El nombre de usuario es requerido' 
            });
          }
          
          // Obtener el rol de usuario de la sesión o usar el proporcionado
          const userRole = req.session.userRole || providedRole || 'audience';
          
          // Verificar si el usuario ya existe
          const existingUser = await storage.getUserByUsername(username);
          
          if (existingUser) {
            return res.status(409).json({ 
              success: false, 
              message: 'El nombre de usuario ya está en uso' 
            });
          }
          
          console.log(`Registrando nuevo usuario: ${username} con rol: ${userRole}`);
          
          // Crear nuevo usuario
          const newUser = await storage.createUser({
            username,
            password,
            userRole,
            email
          });
          
          // Iniciar sesión automáticamente después de registro
          req.login(newUser, (err) => {
            if (err) {
              console.error("Error al iniciar sesión después del registro:", err);
              return res.status(500).json({ 
                success: false, 
                message: 'Error al iniciar sesión después del registro' 
              });
            }
            
            // Redirigir a la página que se especificó originalmente
            const redirectTo = req.session.returnTo || '/';
            delete req.session.returnTo;
            
            console.log(`Usuario registrado: ${newUser.username}, redirección a: ${redirectTo}`);
            
            return res.json({ 
              success: true, 
              user: {
                id: newUser.id,
                username: newUser.username,
                userRole: newUser.userRole,
                email: newUser.email
              },
              redirectTo
            });
          });
        } catch (error) {
          console.error("Error en registro:", error);
          res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
          });
        }
      });
      
      // Logout simplificado para desarrollo
      app.get('/api/logout', (req, res) => {
        req.logout(() => {
          res.redirect('/');
        });
      });
    } else {
      // En producción, usamos la autenticación completa con Replit Auth
      
      // Ruta de inicio de sesión con Replit Auth
      app.get("/api/login", (req, res, next) => {
        const isSignup = req.query.signup === 'true';
        const redirect = req.query.redirect as string;
        const role = req.query.role as string;
        
        // Guardar información para después del login
        // @ts-ignore
        req.session.authRedirect = redirect || '/';
        // @ts-ignore
        req.session.authRole = role;
        
        // Determinar prompt en función de si es registro o login
        const promptOption = isSignup ? "login consent" : "login";
        
        passport.authenticate(`replitauth:${req.hostname}`, {
          prompt: promptOption,
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      });

      // Callback después de autenticación con Replit
      app.get("/api/callback", (req, res, next) => {
        // Recuperar la URL a la que redirigir después del login
        // @ts-ignore
        const redirectTo = req.session.authRedirect || '/';
        
        passport.authenticate(`replitauth:${req.hostname}`, {
          successReturnToOrRedirect: redirectTo,
          failureRedirect: "/",
        })(req, res, next);
      });

      // Cierre de sesión con Replit Auth
      app.get("/api/logout", (req, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      });
    }

    // Obtener usuario actual
    app.get('/api/auth/user', (req, res) => {
      if (req.isAuthenticated()) {
        const user = req.user as any;
        
        // Enviar solo la información necesaria, sin tokens ni contraseñas
        return res.json({
          id: user.id,
          username: user.username,
          userRole: user.userRole,
          profileDescription: user.profileDescription,
          logoUrl: user.logoUrl,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          twitterUrl: user.twitterUrl,
          instagramUrl: user.instagramUrl,
          youtubeUrl: user.youtubeUrl,
          tiktokUrl: user.tiktokUrl,
          threadsUrl: user.threadsUrl,
          websiteUrl: user.websiteUrl,
          profileBackground: user.profileBackground,
          authenticated: true
        });
      } else {
        return res.status(401).json({ authenticated: false });
      }
    });
    
  } catch (error) {
    console.error("Error configurando autenticación:", error);
  }
}

// Authentication middleware con soporte para refresh token
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      message: "No autenticado", 
      authenticated: false 
    });
  }
  
  const user = req.user as any;
  
  // Si no tiene información de Replit Auth, es una sesión antigua
  if (!user.replitAuthInfo) {
    return next();
  }
  
  const now = Math.floor(Date.now() / 1000);
  
  // Si el token aún es válido, continuar
  if (user.replitAuthInfo.expires_at && now <= user.replitAuthInfo.expires_at) {
    return next();
  }
  
  // Si el token expiró pero tenemos refresh_token, intentar refrescar
  const refreshToken = user.replitAuthInfo.refresh_token;
  if (refreshToken) {
    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      
      // Actualizar la sesión con el nuevo token
      if (req.session && req.session.passport && req.session.passport.user) {
        const sessionUser = req.session.passport.user;
        if (sessionUser && tokenResponse) {
          const claims = tokenResponse.claims();
          sessionUser.expires_at = claims?.exp;
          sessionUser.refresh_token = tokenResponse.refresh_token || '';
        }
      }
      
      return next();
    } catch (error) {
      console.error("Error al refrescar el token:", error);
      return res.redirect("/api/login");
    }
  }
  
  // Si no se puede refrescar, redirigir a login
  return res.redirect("/api/login");
};