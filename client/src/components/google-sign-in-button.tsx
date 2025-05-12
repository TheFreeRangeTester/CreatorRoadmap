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
  userRole?: "creator" | "audience";  // Nuevo parámetro para rol
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
      
      // Sign in with Google using Firebase
      const googleUser = await signInWithGoogle();
      
      if (!googleUser) {
        // Este mensaje indica que debes añadir el dominio de Replit a tu proyecto de Firebase
        toast({
          title: t('auth.googleSignInError'),
          description: "Error de dominio no autorizado. Por favor, añade el dominio actual a la lista de dominios autorizados en la consola de Firebase (Authentication > Settings > Authorized domains).",
          variant: "destructive",
        });
        return;
      }
      
      // Get the ID token from the Google user
      const idToken = await googleUser.getIdToken();
      
      // Send the token to our backend to verify and login/register
      const response = await apiRequest("POST", "/api/auth/google", {
        idToken
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al autenticar con el servidor: ${errorText}`);
      }
      
      // Parse the user data returned from our backend
      const userData = await response.json();
      
      toast({
        title: t('auth.googleSignInSuccess'),
        description: t('auth.googleSignInSuccessDesc'),
        variant: "default",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
      // Reload to get the user session
      if (redirectPath) {
        window.location.href = redirectPath;
      } else if (onSuccess) {
        onSuccess();
      } else {
        // Trigger a reload to refresh the auth state
        window.location.reload();
      }
      
    } catch (error) {
      console.error("Error during Google sign in:", error);
      
      // Check if it's a firebase error
      const firebaseError = error as any;
      if (firebaseError.code === 'auth/unauthorized-domain') {
        toast({
          title: "Error de dominio no autorizado",
          description: "Este dominio no está autorizado en Firebase. Por favor, añade el dominio actual a la lista de dominios autorizados en la consola de Firebase (Authentication > Settings > Authorized domains).",
          variant: "destructive",
        });
      } else {
        toast({
          title: t('auth.googleSignInError'),
          description: (error as Error).message || t('auth.googleSignInErrorDesc'),
          variant: "destructive",
        });
      }
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