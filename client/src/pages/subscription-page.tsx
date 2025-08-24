import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Crown,
  Zap,
  Star,
  CreditCard,
  Calendar,
  X,
  ArrowLeft,
} from "lucide-react";
import BillingToggle from "@/components/billing-toggle";
import { apiRequest } from "@/lib/queryClient";
import { UserResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logo.png";
import { hasActivePremiumAccess, getPremiumAccessStatus, getTrialDaysRemaining } from "@shared/premium-utils";
import StripeTestPanel from "@/components/stripe-test-panel";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  // Obtener datos del usuario
  const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["/api/user"],
  });

  // Mutación para crear sesión de checkout
  const createCheckoutMutation = useMutation({
    mutationFn: async (plan: "monthly" | "yearly") => {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
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
        title: t("subscription.error"),
        description: t("subscription.createSessionError"),
        variant: "destructive",
      });
    },
  });

  // Mutación para iniciar trial gratuito
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: t("subscription.trialActivated"),
        description: t("subscription.trialActivatedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("subscription.error"),
        description: t("subscription.startTrialError"),
        variant: "destructive",
      });
    },
  });

  // Mutación para cancelar suscripción
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: t("subscription.subscriptionCancelled"),
        description: t("subscription.subscriptionCancelledDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("subscription.error"),
        description: t("subscription.cancelError"),
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: "monthly" | "yearly") => {
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
      case "premium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            {t("subscription.badges.premium")}
          </Badge>
        );
      case "trial":
        return (
          <Badge variant="secondary">
            <Zap className="w-3 h-3 mr-1" />
            {t("subscription.badges.freeTrial")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{t("subscription.badges.freePlan")}</Badge>
        );
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
        <div className="animate-pulse text-gray-500">
          {t("subscription.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("subscription.navigation.backToDashboard")}
            </Button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoImage}
                  alt="Fanlist Logo"
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Fanlist
                </span>
              </button>
            </div>
            <div className="w-[120px]"></div>{" "}
            {/* Espaciador para mantener el logo centrado */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeIn} className="text-center mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold dark:text-white break-words text-center">
                {t("subscription.title")}
              </h1>
              <div className="flex justify-center">
                {getStatusBadge()}
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 break-words text-center">
              {t("subscription.subtitle")}
            </p>
          </motion.div>

          {/* Current Status Card */}
          {user && (
            <motion.div variants={fadeIn} className="mb-8">
              <Card className="w-full max-w-none overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 break-words">
                    <CreditCard className="w-5 h-5 flex-shrink-0" />
                    <span className="break-words">{t("subscription.currentStatus")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("subscription.status")}
                      </p>
                      <p className="font-semibold">{getStatusBadge()}</p>
                    </div>
                    {user.subscriptionStatus === "trial" && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("subscription.daysRemaining")}
                        </p>
                        <p className="font-semibold text-orange-600">
                          {getTrialDaysLeft()} {t("subscription.days")}
                        </p>
                      </div>
                    )}
                    {user.subscriptionStatus === "premium" &&
                      user.subscriptionPlan && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("subscription.plan")}
                          </p>
                          <p className="font-semibold capitalize">
                            {user.subscriptionPlan}
                          </p>
                        </div>
                      )}
                  </div>

                  {user.subscriptionStatus === "premium" && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={cancelSubscriptionMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t("subscription.cancelSubscription")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trial Section */}
          {user && user.subscriptionStatus === "free" && !user.hasUsedTrial && (
            <motion.div variants={fadeIn} className="mb-8">
              <Card className="border-2 border-dashed border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Zap className="w-5 h-5" />
                    {t("subscription.freeTrial.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("subscription.freeTrial.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleStartTrial}
                    disabled={startTrialMutation.isPending}
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {t("subscription.freeTrial.startButton")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Pricing Plans */}
          {user &&
            (user.subscriptionStatus === "free" ||
              user.subscriptionStatus === "trial") && (
              <motion.div variants={fadeIn}>
                <div className="flex justify-center mb-8">
                  <BillingToggle
                    value={billingPeriod}
                    onChange={setBillingPeriod}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Plan Mensual */}
                  <Card
                    className={
                      billingPeriod === "monthly"
                        ? "border-primary shadow-lg"
                        : ""
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-center">
                        {t("subscription.plans.monthly.title")}
                      </CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">$5</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("subscription.plans.perMonth")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {t("subscription.plans.features.unlimitedIdeas")}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {t("subscription.plans.features.creatorAnalytics")}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {t("subscription.plans.features.pointsStore")}
                          </span>
                        </li>
                      </ul>
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe("monthly")}
                        disabled={createCheckoutMutation.isPending}
                      >
                        {t("subscription.plans.monthly.subscribe")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Plan Anual */}
                  <Card
                    className={
                      billingPeriod === "yearly"
                        ? "border-primary shadow-lg"
                        : ""
                    }
                  >
                    <CardHeader>
                      <div className="text-center mb-2">
                        <Badge className="bg-green-500 text-white">
                          {t("subscription.plans.yearly.saveBadge")}
                        </Badge>
                      </div>
                      <CardTitle className="text-center">
                        {t("subscription.plans.yearly.title")}
                      </CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">$36</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("subscription.plans.perYear")}
                        </span>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {t("subscription.plans.yearly.monthlyPrice")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {t("subscription.plans.features.unlimitedIdeas")}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {t("subscription.plans.features.creatorAnalytics")}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {t("subscription.plans.features.pointsStore")}
                          </span>
                        </li>
                      </ul>
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe("yearly")}
                        disabled={createCheckoutMutation.isPending}
                      >
                        {t("subscription.plans.yearly.subscribe")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

          {/* Premium Features for Premium Users */}
          {user && user.subscriptionStatus === "premium" && (
            <motion.div variants={fadeIn} className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    {t("subscription.premiumFeatures.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>
                        {t("subscription.plans.features.unlimitedIdeas")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>
                        {t("subscription.plans.features.creatorAnalytics")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>
                        {t("subscription.plans.features.pointsStore")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stripe Testing Panel (Development Only) */}
          <StripeTestPanel />
        </motion.div>
      </div>
    </div>
  );
}
