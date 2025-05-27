import { Button } from "@/components/ui/button";
import { PlusCircle, Crown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { UserResponse } from "@shared/schema";

interface CreatorControlsProps {
  onAddIdea: () => void;
}

export default function CreatorControls({ onAddIdea }: CreatorControlsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Obtener datos del usuario para saber su estado de suscripción
  const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ["/api/user"],
  });

  // Mutación para activar trial
  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/subscription/start-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start trial');
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

  // Determinar qué botón mostrar basado en el estado del usuario
  const renderSubscriptionButton = () => {
    if (userLoading || !user) return null;

    // Si ya es premium, no mostrar botón
    if (user.subscriptionStatus === 'premium') {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Crown className="w-4 h-4" />
          <span className="font-medium">{t('subscription.badges.premium')}</span>
        </div>
      );
    }

    // Si está en trial, mostrar estado
    if (user.subscriptionStatus === 'trial') {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">{t('subscription.badges.freeTrial')}</span>
          </div>
          <Link to="/subscription">
            <Button size="sm" variant="outline" className="text-xs">
              {t('subscription.trial.upgradeButton')}
            </Button>
          </Link>
        </div>
      );
    }

    // Si no ha usado trial, mostrar botón de activar trial
    if (!user.hasUsedTrial) {
      return (
        <Button
          onClick={handleStartTrial}
          disabled={startTrialMutation.isPending}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        >
          {startTrialMutation.isPending ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t('subscription.trial.activating')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('subscription.trial.activateButton')}
            </>
          )}
        </Button>
      );
    }

    // Si ya usó trial pero no es premium, mostrar botón de upgrade
    return (
      <Link to="/subscription">
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
          <Crown className="w-4 h-4 mr-2" />
          {t('subscription.trial.upgradeButton')}
        </Button>
      </Link>
    );
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 dark:bg-neutral-800">
      <div className="flex flex-col gap-4">
        {/* Header row */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-white">
            {t('dashboard.creatorDashboard', 'Creator Dashboard')}
          </h2>
          <Button
            onClick={onAddIdea}
            className="mt-3 sm:mt-0"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('ideas.addIdea', 'Add New Idea')}
          </Button>
        </div>

        {/* Subscription promotion row */}
        {user && user.subscriptionStatus !== 'premium' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.subscriptionStatus === 'trial' 
                  ? t('subscription.trial.unlockFeatures')
                  : !user.hasUsedTrial 
                    ? t('subscription.trial.unlockFeatures')
                    : t('subscription.trial.unlockFeatures')
                }
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {t('subscription.trial.noCommitment')}
              </p>
            </div>
            <div className="flex-shrink-0">
              {renderSubscriptionButton()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
