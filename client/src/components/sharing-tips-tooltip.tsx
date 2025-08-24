import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export function SharingTipsTooltip() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const tips = [
    t("dashboard.shareTip1"),
    t("dashboard.shareTip2"),
    t("dashboard.shareTip3"),
  ];

  if (isMobile) {
    return (
      <div className="relative">
        <button
          className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Lightbulb className="h-5 w-5" />
        </button>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
            <Lightbulb className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="w-96 max-w-lg p-4 text-left"
          sideOffset={8}
        >
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
              {t("dashboard.sharingTips")}
            </h4>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary text-sm font-bold mt-0.5 flex-shrink-0">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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
