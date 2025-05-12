import { useEffect, useState } from "react";
import { getAuth, getRedirectResult } from "firebase/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function FirebaseAuthHandler() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extract URL parameters to handle redirects after auth
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirectTo") || null;

  useEffect(() => {
    const handleRedirectResult = async () => {
      const auth = getAuth();
      setIsProcessing(true);
      
      try {
        const result = await getRedirectResult(auth);
        
        // No redirect result, this is a normal page load
        if (!result) {
          return;
        }
        
        // User successfully authenticated with Firebase
        const idToken = await result.user.getIdToken();
        
        // Send the token to our backend
        const response = await apiRequest("POST", "/api/auth/google", {
          idToken
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al autenticar con el servidor: ${errorText}`);
        }
        
        // Parse the user data returned from our backend
        const userData = await response.json();
        
        // Update cache with user data
        queryClient.setQueryData(["/api/user"], userData);
        
        toast({
          title: t('auth.googleSignInSuccess'),
          description: t('auth.googleSignInSuccessDesc'),
          variant: "default",
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
        });
        
        // Redirect if needed, otherwise reload to refresh auth state
        if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          window.location.reload();
        }
        
      } catch (error) {
        console.error("Error processing Firebase redirect:", error);
        
        // Only show error if there was actually a redirect result
        const firebaseError = error as any;
        if (firebaseError.code) {
          toast({
            title: t('auth.googleSignInError'),
            description: (error as Error).message || t('auth.googleSignInErrorDesc'),
            variant: "destructive",
          });
        }
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleRedirectResult();
  }, [toast, t, redirectTo]);
  
  return null; // This component doesn't render anything
}