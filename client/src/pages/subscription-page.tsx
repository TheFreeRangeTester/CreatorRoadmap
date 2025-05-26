import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Crown, Zap, Star, CreditCard, Calendar, X } from "lucide-react";
import BillingToggle from "@/components/billing-toggle";
import { apiRequest } from "@/lib/queryClient";
import { UserResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  // Obtener datos del usuario
  const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["/api/user"],
  });

  // Mutación para crear sesión de checkout
  const createCheckoutMutation = useMutation({
    mutationFn: async (plan: 'monthly' | 'yearly') => {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la sesión de pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mutación para iniciar trial gratuito
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/subscription/start-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "¡Trial activado!",
        description: "Tienes 14 días para probar todas las funciones premium.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo activar el trial. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Mutación para cancelar suscripción
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción se cancelará al final del período de facturación.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    createCheckoutMutation.mutate(plan);
  };

  const handleStartTrial = () => {
    startTrialMutation.mutate();
  };

  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate();
  };

  const getStatusBadge = () => {
    if (!user) return null;
    
    switch (user.subscriptionStatus) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'trial':
        return <Badge variant="secondary"><Zap className="w-3 h-3 mr-1" />Trial Gratuito</Badge>;
      default:
        return <Badge variant="outline">Plan Gratuito</Badge>;
    }
  };

  const isTrialExpired = () => {
    if (!user?.trialEndDate) return false;
    return new Date(user.trialEndDate) < new Date();
  };

  const getTrialDaysLeft = () => {
    if (!user?.trialEndDate) return 0;
    const now = new Date();
    const endDate = new Date(user.trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeIn} className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold dark:text-white">Suscripción</h1>
              {getStatusBadge()}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Desbloquea todo el potencial de tu plataforma
            </p>
          </motion.div>

          {/* Current Status Card */}
          {user && (
            <motion.div variants={fadeIn} className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Estado Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                      <p className="font-semibold">{getStatusBadge()}</p>
                    </div>
                    {user.subscriptionStatus === 'trial' && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Días restantes</p>
                        <p className="font-semibold text-orange-600">{getTrialDaysLeft()} días</p>
                      </div>
                    )}
                    {user.subscriptionStatus === 'premium' && user.subscriptionPlan && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                        <p className="font-semibold capitalize">{user.subscriptionPlan}</p>
                      </div>
                    )}
                  </div>

                  {user.subscriptionStatus === 'premium' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelSubscription}
                        disabled={cancelSubscriptionMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Suscripción
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trial Section */}
          {user && user.subscriptionStatus === 'free' && !user.hasUsedTrial && (
            <motion.div variants={fadeIn} className="mb-8">
              <Card className="border-2 border-dashed border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Zap className="w-5 h-5" />
                    Prueba Gratuita de 14 Días
                  </CardTitle>
                  <CardDescription>
                    Experimenta todas las funciones premium sin compromiso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleStartTrial}
                    disabled={startTrialMutation.isPending}
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Comenzar Trial Gratuito
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Pricing Plans */}
          {user && (user.subscriptionStatus === 'free' || (user.subscriptionStatus === 'trial' && getTrialDaysLeft() <= 3)) && (
            <motion.div variants={fadeIn}>
              <div className="flex justify-center mb-8">
                <BillingToggle
                  value={billingPeriod}
                  onChange={setBillingPeriod}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Plan Mensual */}
                <Card className={billingPeriod === 'monthly' ? 'border-primary shadow-lg' : ''}>
                  <CardHeader>
                    <CardTitle className="text-center">Plan Mensual</CardTitle>
                    <div className="text-center">
                      <span className="text-3xl font-bold">$5</span>
                      <span className="text-gray-600 dark:text-gray-400">/mes</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Hasta 50 ideas visibles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Votos ilimitados</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Sin marca de la plataforma</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Analíticas avanzadas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Soporte prioritario</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe('monthly')}
                      disabled={createCheckoutMutation.isPending}
                    >
                      Suscribirse Mensual
                    </Button>
                  </CardContent>
                </Card>

                {/* Plan Anual */}
                <Card className={billingPeriod === 'yearly' ? 'border-primary shadow-lg' : ''}>
                  <CardHeader>
                    <div className="text-center mb-2">
                      <Badge className="bg-green-500 text-white">Ahorra $24/año</Badge>
                    </div>
                    <CardTitle className="text-center">Plan Anual</CardTitle>
                    <div className="text-center">
                      <span className="text-3xl font-bold">$36</span>
                      <span className="text-gray-600 dark:text-gray-400">/año</span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ($3/mes)
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Hasta 50 ideas visibles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Votos ilimitados</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Sin marca de la plataforma</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Analíticas avanzadas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Soporte prioritario</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Exportación CSV</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Dominio personalizado</span>
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe('yearly')}
                      disabled={createCheckoutMutation.isPending}
                    >
                      Suscribirse Anual
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Premium Features for Premium Users */}
          {user && user.subscriptionStatus === 'premium' && (
            <motion.div variants={fadeIn} className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Funciones Premium Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Hasta 50 ideas visibles</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Votos ilimitados</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Sin marca de la plataforma</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Analíticas avanzadas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}