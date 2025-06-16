import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useIdeaQuota } from "@/hooks/useIdeaQuota";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { hasActivePremiumAccess } from "@shared/premium-utils";

export const IdeaLimitNotice = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: quota, isLoading } = useIdeaQuota();
  const [, navigate] = useLocation();
  
  if (!user || isLoading || !quota) return null;
  
  const hasPremium = hasActivePremiumAccess({
    subscriptionStatus: (user.subscriptionStatus || "free") as "free" | "trial" | "premium" | "canceled",
    trialEndDate: user.trialEndDate || null,
    subscriptionEndDate: user.subscriptionEndDate || null
  });
  
  if (hasPremium || !quota.hasReachedLimit) return null;

  return (
    <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-red-800 dark:text-red-200">
        {t('ideaLimit.title')}
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300">
        <div className="space-y-3">
          <p>{t('ideaLimit.description', { count: quota.count, limit: quota.limit })}</p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            onClick={() => navigate('/subscription')}
          >
            <Crown className="h-4 w-4 mr-2" />
            {t('ideaLimit.upgradeButton')}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};