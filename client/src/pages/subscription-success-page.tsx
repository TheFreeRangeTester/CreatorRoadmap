import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, ArrowRight, Star } from "lucide-react";
import confetti from "canvas-confetti";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SubscriptionSuccessPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Refrescar datos del usuario
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  useEffect(() => {
    // Invalidar queries para refreshar datos del usuario
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    
    // Lanzar confetti para celebrar
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Fanlist</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-md w-full"
        >
          <Card className="text-center shadow-xl border-green-200 dark:border-green-800">
            <CardHeader className="pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
                {t("subscription.paymentSuccess.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>{t("subscription.paymentSuccess.subtitle")}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("subscription.paymentSuccess.description")}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  {t("subscription.paymentSuccess.featuresUnlocked")}
                </h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• {t("subscription.plans.features.visibleIdeas")}</li>
                  <li>• {t("subscription.plans.features.unlimitedIdeas")}</li>
                  <li>• {t("subscription.plans.features.creatorAnalytics")}</li>
                  <li>• {t("subscription.plans.features.pointsStore")}</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {t("subscription.paymentSuccess.goToDashboard")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/subscription")}
                  className="w-full"
                >
                  {t("subscription.paymentSuccess.viewSubscription")}
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("subscription.paymentSuccess.confirmationEmail")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}