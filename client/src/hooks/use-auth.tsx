import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import i18n from "../i18n";

// Define the structure of our user object
type UserResponse = {
  id: number;
  username: string;
  userRole: 'creator' | 'audience';  // Agregamos el campo de rol
  profileDescription?: string | null;
  logoUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  threadsUrl?: string | null;
  websiteUrl?: string | null;
  profileBackground?: string;
};

// Define the auth context type with all the data and functions we'll provide
type AuthContextType = {
  user: UserResponse | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<UserResponse, Error, InsertUser>;
  updateRoleMutation: UseMutationResult<UserResponse, Error, void>; // Nueva función para actualizar el rol
};

// Define what data we need for login
type LoginData = Pick<InsertUser, "username" | "password">;

// Create the context with a null default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to make using auth easier
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Provider component that wraps your app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<UserResponse | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          },
          credentials: "same-origin"
        });
        
        // Not authenticated
        if (res.status === 401) {
          console.log("User not authenticated");
          return null;
        }
        
        // Other errors
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        // Success
        return res.json();
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
      }
    },
    // Don't retry if we get an error
    retry: false,
    // Keep the data fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle login - local auth for development, redirects to Replit Auth in production
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // En desarrollo usamos autenticación local
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "same-origin"
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(errorData || "Failed to login");
        }
        
        const data = await res.json();
        console.log("Login response:", data);
        
        // No redirigir automáticamente, manejar en la UI
        return data.user as UserResponse;
      } else {
        // En producción redireccionamos a Replit Auth
        window.location.href = "/api/login";
        return new Promise<UserResponse>(() => {});
      }
    },
    onSuccess: (userData) => {
      console.log("Login successful, user data:", userData);
      
      // Actualizar caché con datos del usuario
      queryClient.setQueryData(["/api/auth/user"], userData);
      
      // Forzar refetch después para asegurarnos que los datos están actualizados
      setTimeout(() => {
        refetchUser();
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle registration - local auth for development, redirects to Replit Auth in production
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      // En desarrollo usamos registro local
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
          credentials: "same-origin"
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(errorData || "Failed to register");
        }
        
        const data = await res.json();
        console.log("Register response:", data);
        
        // No redirigir automáticamente, manejar en la UI
        return data.user as UserResponse;
      } else {
        // En producción redireccionamos a Replit Auth
        window.location.href = "/api/login?signup=true";
        return new Promise<UserResponse>(() => {});
      }
    },
    onSuccess: (userData) => {
      console.log("Registration successful, user data:", userData);
      
      // Actualizar caché con datos del usuario
      queryClient.setQueryData(["/api/auth/user"], userData);
      
      // Forzar refetch después para asegurarnos que los datos están actualizados
      setTimeout(() => {
        refetchUser();
      }, 100);
      
      // Mostrar mensaje de éxito
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle logout - redirects to Replit Auth logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Con Replit Auth, no necesitamos hacer un POST
      // Simplemente redirigimos a la ruta de cierre de sesión
      window.location.href = "/api/logout";
      
      // Esta promise nunca se resolverá porque redireccionamos
      return new Promise<void>(() => {});
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle role update (audience -> creator)
  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ userRole: "creator" }),
        credentials: "same-origin"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Failed to update role");
      }
      
      return res.json() as Promise<UserResponse>;
    },
    onSuccess: (userData) => {
      // Update cache with updated user data
      queryClient.setQueryData(["/api/auth/user"], userData);
      
      // Show success message
      toast({
        title: "¡Felicidades!",
        description: "Tu cuenta ha sido actualizada a creador de contenido.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar rol",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create the auth value object
  const value = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
    updateRoleMutation,
  };

  // Provide the auth context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
