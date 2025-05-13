import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface ReplitRegisterButtonProps {
  variant?: "default" | "outline" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
  isLoading?: boolean;
  returnTo?: string;
}

export function ReplitRegisterButton({
  variant = "default",
  size = "default",
  className = "",
  isLoading = false,
  returnTo = "",
}: ReplitRegisterButtonProps) {
  const { t } = useTranslation();
  
  const handleSignUp = () => {
    // Construir la URL de redirección
    const redirectParam = returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : "";
    const signupMode = "signup=true";
    const separator = redirectParam ? "&" : "?"; 
    window.location.href = `/api/login${redirectParam}${separator}${signupMode}`;
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignUp}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("auth.registering", "Registrando...")}
        </>
      ) : (
        <>
          {t("auth.registerCta", "Crear cuenta")}
        </>
      )}
    </Button>
  );
}