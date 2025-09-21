import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { UserResponse } from "@shared/schema";
import { SharingTipsTooltip } from "./sharing-tips-tooltip";
import CSVImportModal from "./csv-import-modal";
import SubscriptionStatusIcon from "./subscription-status-icon";
import { hasActivePremiumAccess, getPremiumAccessStatus } from "@shared/premium-utils";

interface CreatorControlsProps {
  onAddIdea: () => void;
}

export default function CreatorControls({ onAddIdea }: CreatorControlsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Get user data for subscription status
  const { data: user } = useQuery<UserResponse>({
    queryKey: ["/api/user"],
  });

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

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        {/* Header row with subscription status icon */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t("dashboard.creatorDashboard", "Panel de Creador")}
          </h2>
          <SubscriptionStatusIcon />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onAddIdea}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
            size="lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            <span className="text-base font-medium">
              {t("ideas.addIdea", "Agregar Nueva Idea")}
            </span>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCSVImportClick}
                  variant="outline"
                  className={`flex-1 sm:flex-none border-2 transition-all duration-200 ${
                    isProUser
                      ? "border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                      : "border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  }`}
                  size="lg"
                >
                  {!isProUser && <Lock className="w-4 h-4 mr-2" />}
                  <Upload className="w-5 h-5 mr-2" />
                  <span className="text-base font-medium">
                    {t("csvImport.button", "Importar CSV")}
                  </span>
                  {!isProUser && (
                    <svg className="w-4 h-4 ml-2 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                    </svg>
                  )}
                </Button>
              </TooltipTrigger>
              {!isProUser && (
                <TooltipContent>
                  <p>
                    {t(
                      "csvImport.proRequired.tooltip",
                      "Función exclusiva Pro"
                    )}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
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