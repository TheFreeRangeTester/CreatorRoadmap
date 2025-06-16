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
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6 dark:bg-neutral-800">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Header row with subscription status icon */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-base sm:text-lg font-medium text-neutral-800 dark:text-white">
            {t("dashboard.creatorDashboard", "Creator Dashboard")}
          </h2>
          <SubscriptionStatusIcon />
        </div>

        {/* Action buttons */}
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
                      "Pro exclusive feature"
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