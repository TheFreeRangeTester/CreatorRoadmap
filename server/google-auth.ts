import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert } from "firebase-admin/app";
import { Request, Response } from "express";
import { storage } from "./storage";
import { InsertUser } from "@shared/schema";

// Inicializar Firebase Admin SDK para verificación de tokens
try {
  const firebaseAdminApp = initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // La clave privada viene escapada como string JSON
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
  }, "admin");
} catch (error) {
  console.error("Error inicializando Firebase Admin:", error);
}

// Función para manejar la autenticación de Google
export async function handleGoogleAuth(req: Request, res: Response) {
  try {
    // Extraer el ID token del cuerpo de la solicitud
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: "No se proporcionó un token de ID" });
    }
    
    // Verificar el token con Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Extraer la información del usuario de Google
    const { email, name, picture, uid } = decodedToken;
    
    if (!email) {
      return res.status(400).json({ message: "No se pudo extraer el email del token" });
    }
    
    // Buscar si ya existe un usuario con este email
    let user = await storage.getUserByEmail(email);
    
    // Si no existe, creamos un nuevo usuario
    if (!user) {
      // Generamos un username basado en el email, eliminando caracteres especiales
      let username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      
      // Verificar si este username ya existe, si es así, añadir un sufijo aleatorio
      const userWithSameUsername = await storage.getUserByUsername(username);
      if (userWithSameUsername) {
        username = `${username}${Math.floor(Math.random() * 10000)}`;
      }
      
      // Datos del nuevo usuario
      const newUser: InsertUser = {
        username: username,
        password: "", // No usamos password para usuarios de Google
        googleId: uid,
        email: email,
        profileDescription: `Google user: ${name || username}`,
        logoUrl: picture || null,
        isGoogleUser: true
      };
      
      // Crear el usuario en nuestra base de datos
      user = await storage.createUser(newUser);
    } else if (!user.googleId) {
      // Si el usuario ya existe pero no tiene googleId, actualizamos su perfil
      await storage.updateUserProfile(user.id, {
        googleId: uid,
        logoUrl: user.logoUrl || picture || null,
        isGoogleUser: true
      });
    }
    
    // Iniciar sesión (establecer cookie de sesión)
    req.session.userId = user.id;
    
    // Devolver los datos del usuario
    res.status(200).json({
      id: user.id,
      username: user.username,
      profileDescription: user.profileDescription,
      logoUrl: user.logoUrl
    });
    
  } catch (error) {
    console.error("Error en la autenticación con Google:", error);
    res.status(500).json({ 
      message: "Error en la autenticación con Google", 
      error: (error as Error).message 
    });
  }
}