import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  className?: string;
  redirectPath?: string;
  onSuccess?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function GoogleSignInButton({
  className = "",
  redirectPath,
  onSuccess,
  variant = "secondary",
  size = "default"
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Add redirectTo parameter for after auth flow
      let redirectParam = '';
      if (redirectPath) {
        // Store redirect URL in query param for after auth process
        redirectParam = `redirectTo=${encodeURIComponent(redirectPath)}`;
      }
      
      // Sign in with Google using Firebase
      try {
        // This will handle both popup and redirect scenarios
        await signInWithGoogle();
        // If using redirect, this function won't return as the page will reload
        // If using popup, the FirebaseAuthHandler will process the result
      } catch (error) {
        // Only handle Firebase errors here - the actual auth will be handled by FirebaseAuthHandler
        const firebaseError = error as any;
        
        if (firebaseError.code === 'auth/unauthorized-domain') {
          // Get current domain for error message
          const currentDomain = window.location.hostname;
          
          // Guardar el error en sessionStorage para mostrar modal informativo
          sessionStorage.setItem("firebase_domain_error", "true");
          
          toast({
            title: t('auth.unauthorizedDomain'),
            description: `${t('auth.unauthorizedDomainDesc')} Es necesario agregar "${currentDomain}" a los dominios autorizados en Firebase Console > Authentication > Settings > Authorized domains.`,
            variant: "destructive",
            duration: 10000, // Mostrar por más tiempo para que el usuario pueda leer
          });
          
          console.error(`Firebase Auth Error: Domain "${currentDomain}" is not authorized. Please add it to the list of authorized domains in Firebase console.`);
          
          // Mostrar un mensaje adicional en la consola para desarrolladores
          console.log(`
=====================================================================
FIREBASE AUTH ERROR: UNAUTHORIZED DOMAIN
=====================================================================
Para solucionar este problema:

1. Ve a la consola de Firebase: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a Authentication > Settings > Authorized domains
4. Agrega el siguiente dominio: "${currentDomain}"

El error ocurre porque Firebase requiere autorizar explícitamente 
todos los dominios desde los que se realizan autenticaciones.
=====================================================================
          `);
        } else if (firebaseError.code !== 'auth/popup-closed-by-user' && 
                  firebaseError.code !== 'auth/cancelled-popup-request') {
          // Don't show errors for user cancellation
          toast({
            title: t('auth.googleSignInError'),
            description: (error as Error).message || t('auth.googleSignInErrorDesc'),
            variant: "destructive",
          });
        }
        
        throw error; // Rethrow to handle in the catch block
      }
    } catch (error) {
      console.error("Error during Google sign in flow:", error);
      // Error already handled in inner try/catch
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      className={`${className} relative`}
      variant={variant}
      size={size}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FcGoogle className="mr-2 h-4 w-4" />
      )}
      {t('auth.signInWithGoogle')}
    </Button>
  );
}