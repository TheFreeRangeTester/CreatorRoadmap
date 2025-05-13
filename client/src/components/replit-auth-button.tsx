import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  isLoading: propIsLoading = false,
  returnTo = "",
}: ReplitAuthButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // En desarrollo mostramos un formulario simple
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  // Estado local para el formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [showForm, setShowForm] = useState(false);
  
  const handleProdLogin = () => {
    // Para producción, redirigir a Replit Auth
    const redirectParam = returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : "";
    window.location.href = `/api/login${redirectParam}`;
  };
  
  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre de usuario",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Llamar directamente a la mutación de login
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          setIsLoading(false);
          toast({
            title: "Éxito",
            description: "Has iniciado sesión correctamente",
          });
        },
        onError: (error) => {
          setIsLoading(false);
          toast({
            title: "Error al iniciar sesión",
            description: error.message || "Verifica tus credenciales",
            variant: "destructive",
          });
        }
      }
    );
  };
  
  if (isDevelopment) {
    if (showForm) {
      return (
        <div className={`space-y-3 ${className}`}>
          <form onSubmit={handleDevLogin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              variant={variant}
              size={size}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.loggingIn", "Iniciando sesión...")}
                </>
              ) : (
                t("auth.login", "Iniciar sesión")
              )}
            </Button>
          </form>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isLoading}
            onClick={() => setShowForm(false)}
          >
            Cancelar
          </Button>
        </div>
      );
    }
    
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowForm(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("auth.loggingIn", "Iniciando sesión...")}
          </>
        ) : (
          t("auth.login", "Iniciar sesión")
        )}
      </Button>
    );
  }
  
  // Para producción, simplemente un botón que redirecciona
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleProdLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("auth.loggingIn", "Iniciando sesión...")}
        </>
      ) : (
        t("auth.loginWithReplit", "Iniciar sesión")
      )}
    </Button>
  );
}