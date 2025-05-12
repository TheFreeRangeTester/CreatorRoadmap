import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  } = useQuery<UserResponse | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        
        // Not authenticated
        if (res.status === 401) {
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

  // Handle login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Login failed");
      }
      
      return res.json() as Promise<UserResponse>;
    },
    onSuccess: (userData) => {
      // Update cache with user data
      queryClient.setQueryData(["/api/user"], userData);
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
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
      const res = await apiRequest("POST", "/api/register", userData);
      
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
      const res = await apiRequest("POST", "/api/logout");
      
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
      const res = await apiRequest("PATCH", "/api/user/role", { userRole: "creator" });
      
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
