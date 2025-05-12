import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole = "creator", // Por defecto, requerimos rol de creador
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: "creator" | "audience";
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
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso restringido</h2>
          <p className="mb-4">Esta sección es exclusiva para creadores de contenido.</p>
          <Redirect to="/" />
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
