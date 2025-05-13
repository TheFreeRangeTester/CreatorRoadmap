import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useRoute } from "wouter";
import { CloudLightning } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ReplitAuthButton } from "@/components/replit-auth-button";

// Extend schema for validation
const formSchema = insertUserSchema.extend({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional(),
  userRole: z.enum(["creator", "audience"] as const),
});

export default function AuthPage() {
  const { t } = useTranslation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [loginOnly, setLoginOnly] = useState(false);
  const [, params] = useRoute('/creators/:username?');
  const [voteIntent, setVoteIntent] = useState<{ideaId: number, redirect: string} | null>(null);

  // Define forms
  const loginForm = useForm({
    resolver: zodResolver(formSchema.pick({ username: true, password: true })),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<{
    username: string;
    password: string;
    email: string;
    userRole: "audience" | "creator";
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      userRole: isPublicProfile ? "audience" as const : "creator" as const,
    },
  });

  // Check if user was redirected from a public profile
  useEffect(() => {
    // Check URL parameters for login=true
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('login') === 'true') {
      setLoginOnly(true);
    }
    
    if (params?.username) {
      setIsPublicProfile(true);
      registerForm.setValue('userRole', 'audience');
    }
    
    // Check if there's a vote intent in localStorage
    const storedVoteIntent = localStorage.getItem('voteIntent');
    if (storedVoteIntent) {
      const parsedIntent = JSON.parse(storedVoteIntent);
      setVoteIntent(parsedIntent);
    }
  }, [params]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Handle vote intent if exists
      if (voteIntent) {
        const { ideaId, redirect } = voteIntent;
        // Process vote with the server
        fetch(`/api${redirect}/ideas/${ideaId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res => {
            if (res.ok) {
              // Clear vote intent from localStorage
              localStorage.removeItem('voteIntent');
              // Redirect back to the original page
              navigate(redirect);
            }
          })
          .catch(err => {
            console.error("Error processing vote:", err);
          });
      } else {
        // Standard redirect
        navigate(getRedirectDestination());
      }
    }
  }, [user, voteIntent]);

  // Handle form submission
  function onLoginSubmit(values: { username: string; password: string }) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: { 
    username: string; 
    password: string; 
    email?: string;
    userRole: "creator" | "audience";
  }) {
    registerMutation.mutate(values);
  }

  // Determine redirect destination
  function getRedirectDestination() {
    // Check for stored redirect in local storage
    const redirectTo = localStorage.getItem('redirectAfterAuth');
    if (redirectTo) {
      localStorage.removeItem('redirectAfterAuth');
      return redirectTo;
    }
    
    // Check URL parameters for referring creator
    const searchParams = new URLSearchParams(window.location.search);
    const referrer = searchParams.get('referrer');
    if (referrer && referrer.startsWith('/')) {
      return referrer;
    }
    
    // If we came from a creator profile, go back to that profile
    if (params?.username) {
      return `/creators/${params.username}`;
    }
    
    // Default redirects based on role
    if (user?.userRole === 'creator') {
      return '/dashboard';
    }
    
    return '/';
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <CloudLightning className="h-6 w-6" />
            <span className="text-lg font-semibold">Fanlist</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t('auth.hero.title')}</h1>
              <p className="mx-auto max-w-[600px] md:mx-0 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('auth.hero.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="mx-auto w-full max-w-md">
            <div className="flex justify-end w-full">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className={`grid w-full ${loginOnly ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                  {!loginOnly && <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('auth.loginTitle')}</CardTitle>
                      <CardDescription>
                        {loginOnly 
                          ? t('auth.loginSubtitlePublic', 'Inicia sesión para votar en este perfil de creador') 
                          : t('auth.loginSubtitle')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        <ReplitAuthButton 
                          className="w-full" 
                          returnTo={getRedirectDestination()}
                        />
                        
                        <p className="text-center text-sm text-muted-foreground mt-2">
                          {t('auth.replitLoginInfo', 'Inicia sesión de manera segura en tu cuenta')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {!loginOnly && (
                  <TabsContent value="register">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {isPublicProfile 
                            ? t('auth.registerAudienceTitle')
                            : t('auth.registerCreatorTitle')}
                        </CardTitle>
                        <CardDescription>
                          {isPublicProfile 
                            ? t('auth.registerAudienceSubtitle')
                            : t('auth.registerCreatorSubtitle')}
                        </CardDescription>
                        <div className={`mt-3 py-2 px-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md`}>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {isPublicProfile 
                              ? t('auth.registerAudienceDescription')
                              : t('auth.registerCreatorDescription')}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-4">
                          <div className="text-center mb-2">
                            <p className="text-sm">{t('auth.selectRoleReplit', 'Podrás seleccionar tu rol en tu perfil después de iniciar sesión.')}</p>
                          </div>
                          
                          <ReplitAuthButton 
                            className="w-full" 
                            returnTo={getRedirectDestination()}
                          />
                          
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            {t('auth.replitRegisterInfo', 'Crea una cuenta de forma segura')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}