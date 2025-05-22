import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema, updateProfileSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { emailService } from "./services/emailService";
import { tokenService } from "./services/tokenService";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "idea-leaderboard-secret";
  
  const isProduction = process.env.NODE_ENV === "production";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    name: 'ideas.sid',
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    }
  };
  
  console.log("Session settings configured, environment:", process.env.NODE_ENV);

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      console.log("Intento de registro con datos:", req.body);
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
        userRole: validatedData.userRole || 'audience', // Utilizamos el rol proporcionado o 'audience' por defecto
      });

      // Strip password from response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        console.log("User registered and logged in:", userWithoutPassword);
        console.log("Session ID:", req.sessionID);
        
        // Guardar la sesión explícitamente para asegurar que se almacene
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            return next(err);
          }
          
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Strip password from response
        const { password, ...userWithoutPassword } = user;
        
        console.log("User logged in:", userWithoutPassword);
        console.log("Session ID:", req.sessionID);
        
        // Guardar la sesión explícitamente para asegurar que se almacene
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            return next(err);
          }
          
          // Enviar una respuesta con el usuario
          return res.status(200).json({
            ...userWithoutPassword,
            authenticated: true,
            sessionId: req.sessionID
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Auth check:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", req.session);
    console.log("Cookies:", req.headers.cookie);
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.status(401).json({ 
        message: "Not authenticated",
        authenticated: false 
      });
    }
    
    console.log("User is authenticated:", req.user?.username);
    
    // Strip password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json({
      ...userWithoutPassword,
      authenticated: true
    });
  });
  
  app.patch("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to update profile" });
      }
      
      const validatedData = updateProfileSchema.parse(req.body);
      const userId = req.user!.id;
      
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Actualizar la sesión del usuario
      req.login(updatedUser, (err) => {
        if (err) {
          return next(err);
        }
        
        // Strip password from response
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Esquemas de validación para recuperación de contraseña
  const forgotPasswordSchema = z.object({
    email: z.string().email(),
    lang: z.string().optional().default('en')
  });

  const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6),
    lang: z.string().optional().default('en')
  });

  // Ruta para solicitar recuperación de contraseña
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email, lang } = forgotPasswordSchema.parse(req.body);
      
      // Verificar si el usuario existe
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return res.status(200).json({ 
          message: lang === 'es' ? 'Si el email existe, recibirás un enlace de recuperación' : 'If the email exists, you will receive a recovery link'
        });
      }

      // Generar token y enviarlo por email
      const token = tokenService.generateToken();
      tokenService.storeToken(token, email);
      
      await emailService.sendPasswordResetEmail(email, token, lang);
      
      res.status(200).json({ 
        message: lang === 'es' ? 'Email de recuperación enviado exitosamente' : 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Error in forgot-password:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      res.status(500).json({ 
        message: req.body.lang === 'es' ? 'Error interno del servidor' : 'Internal server error'
      });
    }
  });

  // Ruta para servir el formulario de reset
  app.get("/reset-password/:token", (req, res) => {
    const token = req.params.token;
    const lang = req.query.lang || 'en';
    
    // Validar que el token existe
    const validation = tokenService.validateToken(token);
    if (!validation.valid) {
      const errorMessage = lang === 'es' 
        ? 'Token inválido o expirado' 
        : 'Invalid or expired token';
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc3545;">${errorMessage}</h2>
            <p><a href="/">Volver al inicio</a></p>
          </body>
        </html>
      `);
    }
    
    // Servir el archivo HTML
    res.sendFile('reset-password.html', { root: 'public' });
  });

  // Ruta para procesar el reset de contraseña
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword, lang } = resetPasswordSchema.parse(req.body);
      
      // Validar token
      const validation = tokenService.validateToken(token);
      if (!validation.valid || !validation.email) {
        return res.status(400).json({ 
          message: lang === 'es' ? 'Token inválido o expirado' : 'Invalid or expired token'
        });
      }

      // Buscar usuario por email
      const user = await storage.getUserByEmail(validation.email);
      if (!user) {
        return res.status(404).json({ 
          message: lang === 'es' ? 'Usuario no encontrado' : 'User not found'
        });
      }

      // Hashear nueva contraseña y actualizar
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Eliminar token usado
      tokenService.deleteToken(token);
      
      res.status(200).json({ 
        message: lang === 'es' ? 'Contraseña actualizada exitosamente' : 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error in reset-password:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      res.status(500).json({ 
        message: req.body.lang === 'es' ? 'Error interno del servidor' : 'Internal server error'
      });
    }
  });
}
