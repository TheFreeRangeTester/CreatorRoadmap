import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
  isLoading: propIsLoading = false,
  returnTo = "",
}: ReplitRegisterButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { registerMutation } = useAuth();
  
  // En desarrollo mostramos un formulario simple
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  // Estado local para el formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<'creator' | 'audience'>('audience');
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [showForm, setShowForm] = useState(false);
  
  const handleProdSignUp = () => {
    // Para producción, redirigir a Replit Auth
    const redirectParam = returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : "";
    const signupMode = "signup=true";
    const separator = redirectParam ? "&" : "?"; 
    window.location.href = `/api/login${redirectParam}${separator}${signupMode}`;
  };
  
  const handleDevRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre de usuario",
        variant: "destructive",
      });
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Llamar directamente a la mutación de registro
    registerMutation.mutate(
      { 
        username, 
        password, 
        email: email || undefined,
        userRole 
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          toast({
            title: "Éxito",
            description: "Te has registrado correctamente",
          });
        },
        onError: (error) => {
          setIsLoading(false);
          toast({
            title: "Error al registrarse",
            description: error.message || "No se pudo completar el registro",
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
          <form onSubmit={handleDevRegister} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="register-username">Nombre de usuario</Label>
              <Input
                id="register-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Crea un nombre de usuario"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Contraseña</Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crea una contraseña"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email (opcional)</Label>
              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 py-2">
              <Label>Tipo de cuenta</Label>
              <RadioGroup 
                value={userRole} 
                onValueChange={(val) => setUserRole(val as 'creator' | 'audience')}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audience" id="register-audience" />
                  <Label htmlFor="register-audience" className="cursor-pointer">
                    {t("auth.audienceRole", "Audiencia (puedo votar)")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creator" id="register-creator" />
                  <Label htmlFor="register-creator" className="cursor-pointer">
                    {t("auth.creatorRole", "Creador (puedo recibir votos)")}
                  </Label>
                </div>
              </RadioGroup>
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
                  {t("auth.registering", "Registrando...")}
                </>
              ) : (
                t("auth.register", "Registrarse")
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
            {t("auth.registering", "Registrando...")}
          </>
        ) : (
          t("auth.registerCta", "Crear cuenta")
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
      onClick={handleProdSignUp}
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