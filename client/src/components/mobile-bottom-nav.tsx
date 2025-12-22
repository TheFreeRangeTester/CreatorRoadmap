import { motion } from "framer-motion";
import { User, Store, Activity, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface MobileBottomNavProps {
  activeSection: "store" | "activity" | "ideas";
  onSectionChange: (section: "store" | "activity" | "ideas") => void;
  className?: string;
}

export function MobileBottomNav({ activeSection, onSectionChange, className }: MobileBottomNavProps) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: "ideas" as const,
      icon: Grid3x3,
      label: t("ideas.short", "Ideas")
    },
    {
      id: "store" as const,
      icon: Store,
      label: t("store.short", "Tienda")
    },
    {
      id: "activity" as const,
      icon: Activity,
      label: t("activity.short", "Actividad")
    }
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 z-50 safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-0 flex-1 mx-1 relative",
                isActive
                  ? "text-primary"
                  : "text-gray-500 dark:text-gray-400"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon container */}
              <motion.div
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 relative z-10",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : "bg-gray-100 dark:bg-gray-800"
                )}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              {/* Label */}
              <motion.span
                className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200 relative z-10",
                  isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"
                )}
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
              >
                {item.label}
              </motion.span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}