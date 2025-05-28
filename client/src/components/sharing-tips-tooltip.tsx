import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

export function SharingTipsTooltip() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const tips = [
    t("dashboard.shareTip1"),
    t("dashboard.shareTip2"),
    t("dashboard.shareTip3"),
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
            <Lightbulb className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white">
              {t("dashboard.sharingTips")}
            </h4>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary text-sm">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
