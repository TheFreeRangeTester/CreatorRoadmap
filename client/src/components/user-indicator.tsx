import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserIndicatorProps {
  user: { username: string; id: number } | null;
  variant?: "desktop" | "mobile";
  className?: string;
}

export function UserIndicator({ user, variant = "desktop", className }: UserIndicatorProps) {
  const { t } = useTranslation();

  if (!user) return null;

  const isDesktop = variant === "desktop";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-200",
        isDesktop 
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-3 py-2 hover:shadow-xl hover:scale-105" 
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 py-1",
        className
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "border-2 border-white shadow-sm",
        isDesktop ? "w-8 h-8" : "w-6 h-6"
      )}>
        <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          {user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Text */}
      <div className={cn(
        "font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
        isDesktop ? "text-sm" : "text-xs"
      )}>
        {isDesktop && (
          <>
            {t("common.hello", "Hola")}, <span className="font-semibold">{user.username}</span>
          </>
        )}
        {!isDesktop && user.username}
      </div>
    </motion.div>
  );
}