import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  User 
} from "firebase/auth";

// Log environment for debugging
console.log("Environment:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Not set",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Set" : "Not set",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "Set" : "Not set"
});

// Firebase configuration for the project
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

// Add login hint and select account to force account selection
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: ''
});

// Try with redirect if popup fails
export async function signInWithGoogle(): Promise<User | null> {
  try {
    // First try popup
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign in with popup:", error);
    
    const firebaseError = error as any;
    // If it's a popup blocked error or other technical issue, try redirect
    if (firebaseError.code === 'auth/popup-blocked' || 
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request') {
      try {
        console.log("Trying with redirect instead...");
        await signInWithRedirect(auth, googleProvider);
        // This won't actually return as the page will redirect
        return null;
      } catch (redirectError) {
        console.error("Error during Google sign in with redirect:", redirectError);
        throw redirectError;
      }
    }
    
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