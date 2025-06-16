import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Crown,
  Sparkles,
  CheckCircle,
  Upload,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { UserResponse } from "@shared/schema";
import { SharingTipsTooltip } from "./sharing-tips-tooltip";
import CSVImportModal from "./csv-import-modal";
import { hasActivePremiumAccess, getPremiumAccessStatus } from "@shared/premium-utils";

interface CreatorControlsProps {
  onAddIdea: () => void;
}

export default function CreatorControls({ onAddIdea }: CreatorControlsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Obtener datos del usuario para saber su estado de suscripción
  const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["/api/user"],
  });

  // Mutación para activar trial
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start trial");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("subscription.trialActivated"),
        description: t("subscription.trialActivatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("subscription.error"),
        description: error.message || t("subscription.startTrialError"),
        variant: "destructive",
      });
    },
  });

  const handleStartTrial = () => {
    startTrialMutation.mutate();
  };

  const handleCSVImportSuccess = (count: number) => {
    queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    toast({
      title: t("csvImport.success.title", "Ideas imported successfully"),
      description: t(
        "csvImport.success.description",
        "{{count}} ideas have been imported to your dashboard",
        { count }
      ),
    });
  };

  const handleCSVImportClick = () => {
    if (!user) return;
    
    const premiumStatus = getPremiumAccessStatus(user);
    
    if (!premiumStatus.hasAccess) {
      let description = "";
      
      switch (premiumStatus.reason) {
        case 'trial_expired':
          description = t(
            "csvImport.trialExpired.description",
            "Your free trial has expired. Upgrade to continue using CSV import."
          );
          break;
        case 'premium_expired':
          description = t(
            "csvImport.premiumExpired.description", 
            "Your premium subscription has expired. Renew to continue using CSV import."
          );
          break;
        default:
          description = t(
            "csvImport.proRequired.description",
            "CSV import is available for Pro users only. Upgrade to access this feature."
          );
      }
      
      toast({
        title: t("csvImport.proRequired.title", "Pro Feature"),
        description,
        variant: "destructive",
      });
      return;
    }
    setCsvImportOpen(true);
  };

  const isProUser = user ? hasActivePremiumAccess(user) : false;

  // Generar contenido del panel de suscripción según el estado
  const renderSubscriptionPanel = () => {
    if (userLoading || !user) return null;

    const premiumStatus = getPremiumAccessStatus(user);

    // Estado 5: Suscripción activa
    if (premiumStatus.hasAccess && premiumStatus.reason === "premium") {
      return {
        showPanel: true,
        title: t("subscription.badges.premium", "Sos miembro Premium"),
        description: user.subscriptionEndDate 
          ? t("subscription.premium.nextRenewal", "Próxima renovación: {{date}}", { 
              date: new Date(user.subscriptionEndDate).toLocaleDateString() 
            })
          : t("subscription.premium.active", "Suscripción activa"),
        bgClass: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        borderClass: "border-green-200 dark:border-green-700",
        icon: <Crown className="w-5 h-5 text-white" />,
        iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
        statusText: t("subscription.badges.premium"),
        statusColor: "text-green-600 dark:text-green-400",
        action: (
          <Link to="/subscription">
            <Button variant="outline" className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300">
              {t("subscription.manage", "Administrar suscripción")}
            </Button>
          </Link>
        )
      };
    }

    // Estado 3: Trial activo
    if (premiumStatus.hasAccess && premiumStatus.reason === "trial") {
      return {
        showPanel: true,
        title: t("subscription.trial.active", "Estás en prueba gratuita"),
        description: t("subscription.trial.activeDesc", "Hasta {{date}} ({{days}} días restantes)", {
          date: user.trialEndDate ? new Date(user.trialEndDate).toLocaleDateString() : "",
          days: premiumStatus.daysRemaining || 0
        }),
        bgClass: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
        borderClass: "border-blue-200 dark:border-blue-700",
        icon: <Sparkles className="w-5 h-5 text-white" />,
        iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
        statusText: `${t("subscription.badges.freeTrial")} (${premiumStatus.daysRemaining} días restantes)`,
        statusColor: "text-blue-600 dark:text-blue-400",
        action: (
          <Link to="/subscription">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
              <Crown className="w-4 h-4 mr-2" />
              {t("subscription.trial.upgradeButton", "Pasar a Premium")}
            </Button>
          </Link>
        )
      };
    }

    // Estado 4: Trial expirado
    if (premiumStatus.reason === "trial_expired") {
      return {
        showPanel: true,
        title: t("subscription.trial.expired", "Tu prueba gratuita expiró"),
        description: t("subscription.trial.expiredDesc", "Suscríbete para seguir disfrutando de las funcionalidades premium"),
        bgClass: "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
        borderClass: "border-red-200 dark:border-red-700",
        icon: <Sparkles className="w-5 h-5 text-white" />,
        iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
        statusText: t("subscription.badges.trialExpired", "Trial Expirado"),
        statusColor: "text-red-600 dark:text-red-400",
        action: (
          <Link to="/subscription">
            <Button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white">
              <Crown className="w-4 h-4 mr-2" />
              {t("subscription.trial.upgradeButton", "Suscribirse")}
            </Button>
          </Link>
        )
      };
    }

    // Estado 7: Premium expirado
    if (premiumStatus.reason === "premium_expired") {
      return {
        showPanel: true,
        title: t("subscription.premium.expired", "Tu suscripción ha expirado"),
        description: t("subscription.premium.expiredDesc", "Renueva tu suscripción para seguir accediendo a las funcionalidades premium"),
        bgClass: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
        borderClass: "border-orange-200 dark:border-orange-700",
        icon: <Crown className="w-5 h-5 text-white" />,
        iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
        statusText: t("subscription.badges.premiumExpired", "Premium Expirado"),
        statusColor: "text-orange-600 dark:text-orange-400",
        action: (
          <Link to="/subscription">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
              <Crown className="w-4 h-4 mr-2" />
              {t("subscription.renew", "Renovar suscripción")}
            </Button>
          </Link>
        )
      };
    }

    // Estado 2: Trial disponible pero no activado
    if (!user.hasUsedTrial) {
      return {
        showPanel: true,
        title: t("subscription.trial.available", "Tenés una prueba gratuita lista para usar"),
        description: t("subscription.trial.availableDesc", "7 días gratis de todas las funcionalidades premium"),
        bgClass: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
        borderClass: "border-blue-200 dark:border-blue-700",
        icon: <Sparkles className="w-5 h-5 text-white" />,
        iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
        statusText: t("subscription.trial.ready", "Trial Disponible"),
        statusColor: "text-blue-600 dark:text-blue-400",
        action: (
          <Button
            onClick={handleStartTrial}
            disabled={startTrialMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            {startTrialMutation.isPending ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("subscription.trial.activating", "Activando...")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("subscription.trial.activateButton", "Activar prueba gratuita")}
              </>
            )}
          </Button>
        )
      };
    }

    // Estado 1: Sin trial ni suscripción activa (ya usó trial)
    return {
      showPanel: true,
      title: t("subscription.premium.activate", "Volver a activar Premium"),
      description: t("subscription.premium.activateDesc", "Accede a todas las funcionalidades premium"),
      bgClass: "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
      borderClass: "border-gray-200 dark:border-gray-700",
      icon: <Crown className="w-5 h-5 text-white" />,
      iconBg: "bg-gradient-to-br from-gray-500 to-slate-600",
      statusText: t("subscription.badges.freePlan", "Plan Gratuito"),
      statusColor: "text-gray-600 dark:text-gray-400",
      action: (
        <Link to="/subscription">
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
            <Crown className="w-4 h-4 mr-2" />
            {t("subscription.subscribe", "Suscribirse")}
          </Button>
        </Link>
      )
    };
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6 dark:bg-neutral-800">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Header row - responsive */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-base sm:text-lg font-medium text-neutral-800 dark:text-white">
            {t("dashboard.creatorDashboard", "Creator Dashboard")}
          </h2>
        </div>

        {/* Botones de gestión de ideas */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAddIdea}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white shadow-lg"
            size="lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            <span className="text-base">
              {t("ideas.addIdea", "Add New Idea")}
            </span>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCSVImportClick}
                  variant="outline"
                  className={`flex-1 sm:flex-none border-primary/20 hover:bg-primary/5 hover:border-primary/40 ${
                    !isProUser ? "opacity-75" : ""
                  }`}
                  size="lg"
                >
                  {!isProUser && <Lock className="w-4 h-4 mr-2" />}
                  <Upload className="w-5 h-5 mr-2" />
                  <span className="text-base">
                    {t("csvImport.button", "Import CSV")}
                  </span>
                  {!isProUser && (
                    <Crown className="w-4 h-4 ml-2 text-amber-500" />
                  )}
                </Button>
              </TooltipTrigger>
              {!isProUser && (
                <TooltipContent>
                  <p>
                    {t(
                      "csvImport.proRequired.tooltip",
                      "Pro exclusive feature"
                    )}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Subscription status panel - shows for all subscription states */}
        {(() => {
          const panelData = renderSubscriptionPanel();
          if (!panelData?.showPanel) return null;

          return (
            <div className={`flex flex-col gap-3 p-4 bg-gradient-to-r ${panelData.bgClass} rounded-lg border ${panelData.borderClass}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 ${panelData.iconBg} rounded-lg`}>
                  {panelData.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {panelData.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {panelData.description}
                  </p>
                  
                  {/* Show features list only for non-premium users */}
                  {!hasActivePremiumAccess(user) && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {t("subscription.features.upToIdeas")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {t("subscription.features.unlimitedVotes")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {t("subscription.features.embedLeaderboard")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {t("subscription.features.noBranding")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {t("subscription.features.csvImport")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                {panelData.action}
              </div>
            </div>
          );
        })()}
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImportSuccess={handleCSVImportSuccess}
      />
    </div>
  );
}
