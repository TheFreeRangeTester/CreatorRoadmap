import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { UserResponse } from "@shared/schema";
import {
  hasActivePremiumAccess,
  getPremiumAccessStatus,
} from "@shared/premium-utils";

export default function SubscriptionStatusIcon() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Get user data for subscription status
  const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["/api/user"],
  });

  // Mutation to start trial
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? "Failed to start trial");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("subscription.trialActivated"),
        description: t("subscription.trialActivatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("subscription.error"),
        description: error.message ?? t("subscription.startTrialError"),
        variant: "destructive",
      });
    },
  });

  // Mutation to cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? "Failed to cancel subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("subscription.canceledStatus"),
        description: t("subscription.canceledDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("subscription.error"),
        description: error.message ?? t("subscription.cancelError"),
        variant: "destructive",
      });
    },
  });

  if (userLoading || !user) return null;

  const premiumStatus = getPremiumAccessStatus(user);
  const isProUser = hasActivePremiumAccess(user);

  // Determine icon appearance based on subscription status
  const getIconConfig = () => {
    if (premiumStatus.hasAccess && premiumStatus.reason === "premium") {
      return {
        icon: Crown,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        badge: null,
      };
    }

    if (premiumStatus.hasAccess && premiumStatus.reason === "trial") {
      return {
        icon: Sparkles,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-700",
        badge: premiumStatus.daysRemaining,
      };
    }

    if (
      premiumStatus.hasAccess &&
      premiumStatus.reason === "premium_canceled"
    ) {
      return {
        icon: Crown,
        color: "text-orange-500",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-700",
        badge: null,
      };
    }

    if (
      premiumStatus.reason === "trial_expired" ||
      premiumStatus.reason === "premium_expired"
    ) {
      return {
        icon: AlertCircle,
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
        badge: null,
      };
    }

    return {
      icon: Crown,
      color: "text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-700",
      badge: null,
    };
  };

  // Helper functions for each subscription state
  const getActivePremiumContent = () => ({
    title: t("subscription.badges.premium"),
    description: user.subscriptionEndDate
      ? t("subscription.premium.nextRenewal", {
          date: new Date(user.subscriptionEndDate).toLocaleDateString(),
        })
      : t("subscription.premium.active"),
    statusColor: "text-green-600 dark:text-green-400",
    icon: <Crown className="w-5 h-5 text-yellow-500" />,
    action: (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs"
          onClick={() => cancelSubscriptionMutation.mutate()}
          disabled={cancelSubscriptionMutation.isPending}
        >
          {cancelSubscriptionMutation.isPending ? (
            <>
              <div className="w-3 h-3 mr-1 animate-spin rounded-full border border-red-600 border-t-transparent" />
              <span className="truncate">{t("subscription.canceling")}</span>
            </>
          ) : (
            <span className="truncate">{t("subscription.cancel")}</span>
          )}
        </Button>
        <Link to="/subscription" className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setIsOpen(false)}
          >
            <span className="truncate">{t("subscription.manage")}</span>
          </Button>
        </Link>
      </div>
    ),
  });

  const getCanceledActiveContent = () => ({
    title: t("subscription.canceled.active"),
    description: user.subscriptionEndDate
      ? t("subscription.canceled.activeDesc", {
          date: new Date(user.subscriptionEndDate).toLocaleDateString(),
        })
      : t("subscription.canceled.activeDescGeneric"),
    statusColor: "text-orange-600 dark:text-orange-400",
    icon: <Crown className="w-5 h-5 text-orange-500" />,
    action: (
      <Link to="/subscription" className="w-full">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsOpen(false)}
        >
          <Crown className="w-3 h-3 mr-1" />
          <span className="truncate">{t("subscription.reactivate")}</span>
        </Button>
      </Link>
    ),
  });

  const getActiveTrialContent = () => ({
    title: t("subscription.trial.active"),
    description: t("subscription.trial.activeDesc", {
      date: user.trialEndDate
        ? new Date(user.trialEndDate).toLocaleDateString()
        : "",
      days: premiumStatus.daysRemaining ?? 0,
    }),
    statusColor: "text-blue-600 dark:text-blue-400",
    icon: <Sparkles className="w-5 h-5 text-blue-500" />,
    action: (
      <Link to="/subscription" className="w-full">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsOpen(false)}
        >
          <Crown className="w-3 h-3 mr-1" />
          <span className="truncate">
            {t("subscription.trial.upgradeButton")}
          </span>
        </Button>
      </Link>
    ),
  });

  const getExpiredContent = (type: "trial" | "premium") => ({
    title: t(`subscription.${type}.expired`),
    description: t(`subscription.${type}.expiredDesc`),
    statusColor: "text-red-600 dark:text-red-400",
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    action: (
      <Link to="/subscription" className="w-full">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsOpen(false)}
        >
          <Crown className="w-3 h-3 mr-1" />
          <span className="truncate">
            {type === "trial"
              ? t("subscription.subscribe")
              : t("subscription.renew")}
          </span>
        </Button>
      </Link>
    ),
  });

  const getTrialAvailableContent = () => ({
    title: t("subscription.trial.available"),
    description: t("subscription.trial.availableDesc"),
    statusColor: "text-blue-600 dark:text-blue-400",
    icon: <Sparkles className="w-5 h-5 text-blue-500" />,
    action: (
      <Button
        size="sm"
        className="w-full text-xs"
        onClick={() => startTrialMutation.mutate()}
        disabled={startTrialMutation.isPending}
      >
        {startTrialMutation.isPending ? (
          <>
            <div className="w-3 h-3 mr-1 animate-spin rounded-full border border-white border-t-transparent" />
            <span className="truncate">
              {t("subscription.trial.activating")}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3 mr-1" />
            <span className="truncate">
              {t("subscription.trial.activateButton")}
            </span>
          </>
        )}
      </Button>
    ),
  });

  const getDefaultContent = () => ({
    title: t("subscription.premium.activate"),
    description: t("subscription.premium.activateDesc"),
    statusColor: "text-gray-600 dark:text-gray-400",
    icon: <Crown className="w-5 h-5 text-gray-400" />,
    action: (
      <Link to="/subscription" className="w-full">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsOpen(false)}
        >
          <Crown className="w-3 h-3 mr-1" />
          <span className="truncate">{t("subscription.subscribe")}</span>
        </Button>
      </Link>
    ),
  });

  // Get content for the popover based on subscription state
  const getPopoverContent = () => {
    if (premiumStatus.hasAccess && premiumStatus.reason === "premium") {
      return getActivePremiumContent();
    }

    if (
      premiumStatus.hasAccess &&
      premiumStatus.reason === "premium_canceled"
    ) {
      return getCanceledActiveContent();
    }

    if (premiumStatus.hasAccess && premiumStatus.reason === "trial") {
      return getActiveTrialContent();
    }

    if (premiumStatus.reason === "trial_expired") {
      return getExpiredContent("trial");
    }

    if (premiumStatus.reason === "premium_expired") {
      return getExpiredContent("premium");
    }

    if (!user.hasUsedTrial) {
      return getTrialAvailableContent();
    }

    return getDefaultContent();
  };

  const iconConfig = getIconConfig();
  const IconComponent = iconConfig.icon;
  const popoverContent = getPopoverContent();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 rounded-full ${iconConfig.bgColor} ${iconConfig.borderColor} border hover:scale-105 transition-transform`}
        >
          <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
          {iconConfig.badge && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-blue-500 text-white border-white"
            >
              {iconConfig.badge}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="end">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            {popoverContent.icon}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight">
                {popoverContent.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                {popoverContent.description}
              </p>
            </div>
          </div>

          {/* Show features list only for non-premium users */}
          {!isProUser && (
            <div className="grid grid-cols-1 gap-1.5 mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {t("subscription.features.upToIdeas")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {t("subscription.features.csvImport")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {t("subscription.features.noBranding")}
                </span>
              </div>
            </div>
          )}

          <div className="w-full">{popoverContent.action}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
