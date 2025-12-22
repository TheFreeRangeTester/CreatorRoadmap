import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Lightbulb,
  ListFilter,
  Gift,
  Package,
  Badge as BadgeIcon,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  className?: string;
  onStatsClick?: () => void;
}

export function MobileBottomNavigation({
  activeTab,
  onTabChange,
  pendingCount = 0,
  className,
  onStatsClick,
}: MobileBottomNavigationProps) {
  const { t } = useTranslation();

  const tabs = [
    {
      id: "published",
      icon: Lightbulb,
      label: t("dashboard.published"),
      color: "text-primary",
    },
    {
      id: "suggested",
      icon: ListFilter,
      label: t("dashboard.suggested"),
      color: "text-primary",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: "stats",
      icon: BarChart3,
      label: t("dashboard.stats", "Stats"),
      color: "text-primary",
      isAction: true,
    },
    {
      id: "store",
      icon: Gift,
      label: t("dashboard.store"),
      color: "text-primary",
    },
    {
      id: "redemptions",
      icon: Package,
      label: t("redemptions.short"),
      color: "text-primary",
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700",
        "md:hidden", // Only show on mobile
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isAction && tab.id === "stats" && onStatsClick) {
                  onStatsClick();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                "hover:bg-accent/50 active:scale-95",
                isActive && !tab.isAction && "bg-accent"
              )}
            >
              {/* Badge for notifications */}
              {tab.badge && (
                <div className="absolute -top-1 -right-1 z-10">
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Badge>
                </div>
              )}

              <motion.div
                className="flex flex-col items-center gap-1"
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-colors duration-200",
                    isActive ? tab.color : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium transition-colors duration-200 truncate",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </motion.div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className={cn(
                    "absolute -top-0.5 left-1/2 w-8 h-1 rounded-full",
                    tab.color.replace("text-", "bg-")
                  )}
                  layoutId="activeTab"
                  initial={false}
                  animate={{ x: "-50%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
