import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
  const [, navigate] = useLocation();
  
  // Get current user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<UserResponse | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        console.log("Fetching user data from /api/user...");
        const res = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
          },
          credentials: "include"
        });
        
        console.log("Response status:", res.status);
        
        // Not authenticated
        if (res.status === 401) {
          console.log("User not authenticated");
          return null;
        }
        
        // Other errors
        if (!res.ok) {
          console.error(`Error fetching user: ${res.status}: ${res.statusText}`);
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        // Success
        const userData = await res.json();
        console.log("User data received:", userData);
        return userData;
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

  // Handle login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(credentials),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Login failed");
      }
      
      return res.json() as Promise<UserResponse>;
    },
    onSuccess: (userData) => {
      // Update cache with user data
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidate and refetch user data to ensure it's fresh
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      refetchUser();
      
      // Check if there's a redirect URL stored from before login
      const redirectAfterAuth = localStorage.getItem('redirectAfterAuth');
      const currentPath = window.location.pathname;
      
      // Only redirect audience users away from creator-only areas
      const isAccessingCreatorOnlyArea = currentPath === '/auth' && 
        (window.location.search.includes('direct=true') || 
         localStorage.getItem('attemptingCreatorLogin') === 'true');
      
      if (isAccessingCreatorOnlyArea && userData.userRole === 'audience') {
        // Clear the flag
        localStorage.removeItem('attemptingCreatorLogin');
        
        // Store flag for landing page to show error
        localStorage.setItem('audienceTriedCreatorAccess', 'true');
        
        // Show immediate error message without blocking
        toast({
          title: i18n.t("auth.notCreatorAccount", "No es una cuenta de creador"),
          description: i18n.t("auth.notCreatorAccountDesc", "No es una cuenta de creador. Por favor registrate como creador si querés usar las funciones de Fanlist para creadores."),
          variant: "destructive",
          duration: 8000,
        });

        // Perform logout in background without page reload
        fetch("/api/logout", {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          },
          credentials: "same-origin"
        }).then(() => {
          // Clear user from cache smoothly
          queryClient.setQueryData(["/api/user"], null);
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          
          // Navigate smoothly to landing page using React navigation
          setTimeout(() => {
            navigate('/');
          }, 100);
        }).catch((error) => {
          console.error("Auto-logout failed:", error);
        });
        
        return; // Don't show success message or redirect
      }
      
      // Show success message for valid logins
      toast({
        title: i18n.t("auth.loginSuccess", "Login successful"),
        description: i18n.t("auth.welcomeBack", "Welcome back, {{username}}!", { username: userData.username }),
      });
      
      // Handle post-login redirection
      if (redirectAfterAuth) {
        // Clear the stored redirect URL
        localStorage.removeItem('redirectAfterAuth');
        // Redirect to the stored URL (usually a creator profile)
        window.location.href = redirectAfterAuth;
      }
      
      // Log login success for debugging
      console.log("Login successful, user data:", userData);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle registration
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(userData),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Registration failed");
      }
      
      return res.json() as Promise<UserResponse>;
    },
    onSuccess: (userData) => {
      // Update cache with user data
      queryClient.setQueryData(["/api/user"], userData);
      
      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.username}!`,
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

  // Handle logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "same-origin"
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Invalidate to force refetch any user-dependent queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Show success message
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
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
      queryClient.setQueryData(["/api/user"], userData);
      
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
