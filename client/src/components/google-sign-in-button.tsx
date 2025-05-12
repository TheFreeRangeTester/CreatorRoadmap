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
  size = "default",
  userRole = "audience"  // Por defecto, audiencia
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Sign in with Google using Firebase - redirige al usuario y retorna
      await signInWithGoogle();
      
      // Mostramos un mensaje al usuario
      toast({
        title: "Redirigiendo a Google",
        description: "Te estamos redirigiendo para iniciar sesión con Google...",
        variant: "default",
      });
      
      // No hay más código aquí porque el usuario será redirigido a Google
      // El resultado se manejará cuando el usuario regrese
      
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