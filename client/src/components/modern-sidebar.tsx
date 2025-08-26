import { useState } from "react";
import { motion } from "framer-motion";
import { User, Store, Activity, Grid3x3, ChevronRight, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ModernSidebarProps {
  activeSection: "store" | "activity" | "ideas";
  onSectionChange: (section: "store" | "activity" | "ideas") => void;
  className?: string;
  isAuthenticated?: boolean;
  isOwnProfile?: boolean;
  userPoints?: number;
  onSuggestClick?: () => void;
}

export function ModernSidebar({ 
  activeSection, 
  onSectionChange, 
  className,
  isAuthenticated,
  isOwnProfile,
  userPoints,
  onSuggestClick
}: ModernSidebarProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    {
      id: "ideas" as const,
      icon: Grid3x3,
      label: t("ideas.title", "Ideas"),
      description: t("ideas.description", "Votar por contenido")
    },
    {
      id: "store" as const,
      icon: Store,
      label: t("store.title", "Tienda"),
      description: t("store.description", "Canjear puntos")
    },
    {
      id: "activity" as const,
      icon: Activity,
      label: t("activity.title", "Actividad"),
      description: t("activity.description", "Mis estadísticas")
    }
  ];

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-30 transition-all duration-300",
        isExpanded ? "w-64" : "w-16",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              {t("navigation.title", "Navegación")}
            </motion.h2>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
              )}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Text content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="font-medium text-sm truncate">
                    {item.label}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {item.description}
                  </div>
                </motion.div>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
            </motion.button>
          );
        })}
      </nav>

      {/* Suggest Idea Button */}
      {isAuthenticated && !isOwnProfile && isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2 pb-4"
        >
          <Button
            onClick={onSuggestClick}
            disabled={!userPoints || userPoints < 3}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg border-0 rounded-xl h-11"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{t("suggest.idea", "Sugerir Idea")}</span>
          </Button>
        </motion.div>
      )}

    </motion.div>
  );
}