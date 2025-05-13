import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";

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

export async function setupAuth(app: Express) {
  // Configure Express for sessions
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple session serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Configuración simplificada para desarrollo
  // En producción, esto se reemplazaría con integración completa con Replit Auth
  app.get("/api/login", (req, res) => {
    // Determinar si es modo registro o inicio de sesión
    const isSignup = req.query.signup === 'true';
    
    // En desarrollo, redirigimos a la página de autenticación
    if (isSignup) {
      res.redirect('/auth?mode=register');
    } else {
      res.redirect('/auth');
    }
  });

  // Ruta simplificada para login manual - Se reemplazaría con Replit Auth en producción
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Buscar usuario por nombre de usuario
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Error de autenticación' 
          });
        }
        
        return res.json({ 
          success: true, 
          user: {
            id: user.id,
            username: user.username,
            userRole: user.userRole
          }
        });
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error en el servidor' 
      });
    }
  });

  // Ruta para registro de usuarios
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, userRole } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'El nombre de usuario ya está en uso' 
        });
      }
      
      // Crear nuevo usuario
      const newUser = await storage.createUser({
        username,
        password,
        userRole: userRole || 'audience',
      });
      
      // Iniciar sesión automáticamente después de registro
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Error al iniciar sesión después del registro' 
          });
        }
        
        return res.json({ 
          success: true, 
          user: {
            id: newUser.id,
            username: newUser.username,
            userRole: newUser.userRole
          }
        });
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error en el servidor' 
      });
    }
  });

  // Logout route
  app.get('/api/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  // Obtener usuario actual
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        ...user,
        authenticated: true
      });
    } else {
      return res.status(401).json({ authenticated: false });
    }
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ authenticated: false });
};