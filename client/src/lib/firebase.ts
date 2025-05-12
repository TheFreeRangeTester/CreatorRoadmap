import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  User
} from "firebase/auth";

// Mostrar la configuración actual de Firebase para depuración
console.log("Environment:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Not set",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Set" : "Not set",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "Set" : "Not set"
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configurar correctamente los scopes para el proveedor
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Función para iniciar sesión con Google en popup (modo de respaldo)
export async function signInWithGooglePopup(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign in (popup):", error);
    throw error;
  }
}

// Función para iniciar sesión con Google mediante redirección (modo recomendado)
export async function signInWithGoogle(): Promise<void> {
  try {
    // Este método solo inicia el flujo de redirección
    // El resultado se obtendrá después de que el usuario vuelva a la app
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Error during Google sign in (redirect):", error);
    throw error;
  }
}

// Función para verificar si un usuario está autenticado con Firebase
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Función para cerrar sesión
export async function signOut(): Promise<void> {
  return auth.signOut();
}

export { auth };