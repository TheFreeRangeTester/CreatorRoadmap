import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useRoute } from "wouter";
import { CloudLightning, HelpCircle } from "lucide-react";
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
import GoogleSignInButton from "@/components/google-sign-in-button";
import { Separator } from "@/components/ui/separator";
import FirebaseSetupGuide from "@/components/firebase-setup-guide";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";

// Extend schema for validation
const formSchema = insertUserSchema.extend({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [authSource, setAuthSource] = useState<string | null>(null);
  const [isPublicProfile, setIsPublicProfile] = useState<boolean>(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);
  const [match, params] = useRoute("/:username");
  const [matchPublic] = useRoute("/public/:token");
  
  // Determine the referrer source on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const referrer = searchParams.get('referrer');
    const directAccess = searchParams.get('direct') === 'true';
    
    // Si hay un parámetro 'direct=true', es acceso directo desde la landing page
    if (directAccess) {
      setIsPublicProfile(false);
      setAuthSource('/dashboard');
      return;
    }
    
    if (referrer) {
      setAuthSource(referrer);
      // Check if coming from a creator or public profile
      setIsPublicProfile(!!referrer.match(/^\/([\w-]+|public\/[\w-]+)/));
    } else if (match && params?.username) {
      // Coming from a creator profile page
      setAuthSource(`/${params.username}`);
      setIsPublicProfile(true);
    } else if (matchPublic) {
      // Coming from a public token page
      const path = window.location.pathname;
      const pathSegments = path.split('/');
      if (pathSegments.length >= 2) {
        setAuthSource(`/public/${pathSegments[2]}`);
        setIsPublicProfile(true);
      }
    } else {
      // Si no hay referrer ni match, es acceso directo desde la landing page
      setIsPublicProfile(false);
      setAuthSource('/dashboard');
    }
  }, [match, params, matchPublic]);

  // Login form
  const loginForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      userRole: isPublicProfile ? "audience" : "creator", // Si viene del perfil público, rol audiencia por defecto
    },
  });

  // Get redirect destination based on auth source and user role
  const getRedirectDestination = (userRole?: string) => {
    // Si hay un authSource (viene de un perfil o link público), prioritario
    if (authSource) {
      return authSource;
    }
    
    // Para acceso directo, dirigir según el rol
    if (userRole === "audience") {
      // Los miembros de audiencia van a la landing page
      return "/";
    } else {
      // Los creadores van al dashboard
      return "/dashboard";
    }
  };

  // Login form submission
  function onLoginSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values, {
      onSuccess: (user) => {
        const destination = getRedirectDestination(user.userRole);
        navigate(destination);
      },
    });
  }

  // Register form submission
  function onRegisterSubmit(values: z.infer<typeof formSchema>) {
    registerMutation.mutate(values, {
      onSuccess: (user) => {
        const destination = getRedirectDestination(user.userRole);
        navigate(destination);
      },
    });
  }
  
  // If user is already logged in, redirect appropriately
  if (user) {
    const destination = getRedirectDestination();
    // Using setTimeout to avoid React warning about state updates during render
    setTimeout(() => navigate(destination), 0);
    // Render a loading state while redirect is happening
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <div className="flex justify-end w-full mb-4 gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <CloudLightning className="h-10 w-10 text-primary" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('auth.welcome')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('auth.loginInfo')}
            </p>
          </div>
          
          {/* Firebase Setup Guide Dialog */}
          <FirebaseSetupGuide open={isSetupGuideOpen} onOpenChange={setIsSetupGuideOpen} />

          <div className="mt-8">
            {/* Always show login/register options with tabs */}
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isPublicProfile 
                          ? "Iniciar sesión para votar" 
                          : "Iniciar sesión como creador"}
                      </CardTitle>
                      <CardDescription>
                        {isPublicProfile 
                          ? "Accede a tu cuenta para votar ideas y enviar sugerencias."
                          : "Accede a tu cuenta para gestionar tus ideas y ver estadísticas."}
                      </CardDescription>
                      <div className={`mt-3 py-2 px-3 ${isPublicProfile 
                        ? "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800" 
                        : "bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800"} rounded-md`}>
                        <p className={`text-xs ${isPublicProfile 
                          ? "text-green-700 dark:text-green-300" 
                          : "text-blue-700 dark:text-blue-300"}`}>
                          {isPublicProfile 
                            ? "Accede con tu cuenta para votar ideas y enviar sugerencias a este creador."
                            : "Esta opción es para creadores de contenido que quieren gestionar un leaderboard de ideas."}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form
                          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('common.username')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('common.username')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('common.password')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="******"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? t('auth.loginCta') + "..." : t('auth.loginCta')}
                          </Button>
                          
                          <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                              <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                {t('auth.orContinueWith')}
                              </span>
                            </div>
                          </div>
                          
                          <GoogleSignInButton 
                            className="w-full" 
                            redirectPath={getRedirectDestination()} 
                            onSuccess={() => {
                              navigate(getRedirectDestination());
                            }}
                          />
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isPublicProfile 
                          ? "Registrarse para participar" 
                          : "Registrarse como creador"}
                      </CardTitle>
                      <CardDescription>
                        {isPublicProfile 
                          ? "Crea una cuenta para votar ideas y enviar sugerencias a tus creadores favoritos."
                          : "Crea una cuenta para gestionar tu propio leaderboard de ideas."}
                      </CardDescription>
                      <div className={`mt-3 py-2 px-3 ${isPublicProfile 
                        ? "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800" 
                        : "bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800"} rounded-md`}>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {isPublicProfile 
                            ? "Al registrarte como audiencia, podrás votar ideas y sugerir contenido a tus creadores favoritos."
                            : "Crea tu cuenta de creador con nombre de usuario y contraseña. Esta cuenta te permitirá crear tu propio leaderboard de ideas y gestionar las sugerencias de tu audiencia."}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form
                          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('common.username')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('common.username')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('common.password')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="******"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="userRole"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Tipo de cuenta</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="creator" id="creator" />
                                      <Label htmlFor="creator">Creador de contenido</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="audience" id="audience" />
                                      <Label htmlFor="audience">Miembro de audiencia</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormDescription>
                                  Los creadores pueden gestionar ideas y su perfil. La audiencia puede votar y sugerir.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? t('auth.registerCta') + "..." : t('auth.registerCta')}
                          </Button>
                          
                          <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                              <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                {t('auth.orContinueWith')}
                              </span>
                            </div>
                          </div>
                          
                          <GoogleSignInButton 
                            className="w-full" 
                            redirectPath={getRedirectDestination()} 
                            onSuccess={() => {
                              navigate(getRedirectDestination());
                            }}
                          />
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            
          </div>
        </div>
      </div>
      
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary to-primary-700">
          <div className="flex flex-col justify-center h-full px-12 text-white">
            <h1 className="text-4xl font-bold mb-4">
              Share your ideas with the world
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Create, vote, and track the most popular ideas in your community. See which ideas rise to the top and help shape the future.
            </p>
            <ul className="space-y-3 text-lg">
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Submit creative ideas
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Vote for your favorites
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Track changes in position
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Build a community around ideas
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
