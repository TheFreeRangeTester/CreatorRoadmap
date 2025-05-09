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
  const [match, params] = useRoute("/:username");
  const [matchPublic] = useRoute("/public/:token");
  
  // Determine the referrer source on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const referrer = searchParams.get('referrer');
    
    if (referrer) {
      setAuthSource(referrer);
    } else if (match && params?.username) {
      // Coming from a creator profile page
      setAuthSource(`/${params.username}`);
    } else if (matchPublic) {
      // Coming from a public token page
      const path = window.location.pathname;
      const pathSegments = path.split('/');
      if (pathSegments.length >= 2) {
        setAuthSource(`/public/${pathSegments[2]}`);
      }
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
    },
  });

  // Get redirect destination based on auth source
  const getRedirectDestination = () => {
    if (authSource) {
      // If coming from a profile page or public link, go back there
      return authSource;
    }
    // Default redirect to dashboard for direct logins
    return "/dashboard";
  };

  // Login form submission
  function onLoginSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        const destination = getRedirectDestination();
        navigate(destination);
      },
    });
  }

  // Register form submission
  function onRegisterSubmit(values: z.infer<typeof formSchema>) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        const destination = getRedirectDestination();
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

          <div className="mt-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('common.login')}</TabsTrigger>
                <TabsTrigger value="register">{t('common.register')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('common.login')}</CardTitle>
                    <CardDescription>
                      {t('auth.loginInfo')}
                    </CardDescription>
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
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('common.register')}</CardTitle>
                    <CardDescription>
                      {t('auth.registerInfo')}
                    </CardDescription>
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
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? t('auth.registerCta') + "..." : t('auth.registerCta')}
                        </Button>
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
