import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Para asegurarnos de tener el tipo correcto
type UserRole = 'creator' | 'audience';

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole = "creator" as UserRole, // Por defecto, requerimos rol de creador
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: UserRole;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth?direct=true" />
      </Route>
    );
  }

  // Verificar el rol del usuario
  if (requiredRole === "creator" && user.userRole !== "creator") {
    // Store flag to show error message on landing page
    localStorage.setItem('audienceTriedCreatorAccess', 'true');
    
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
