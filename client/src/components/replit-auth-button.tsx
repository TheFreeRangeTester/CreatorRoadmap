import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface ReplitAuthButtonProps {
  variant?: "default" | "outline" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
  isLoading?: boolean;
  returnTo?: string;
}

export function ReplitAuthButton({
  variant = "default",
  size = "default",
  className = "",
  isLoading = false,
  returnTo = "",
}: ReplitAuthButtonProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const handleLogin = () => {
    // Construir la URL de redirección
    const redirectParam = returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : "";
    window.location.href = `/api/login${redirectParam}`;
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("auth.loggingIn", "Iniciando sesión...")}
        </>
      ) : (
        <>
          {t("auth.loginWithReplit", "Iniciar sesión con Replit")}
        </>
      )}
    </Button>
  );
}