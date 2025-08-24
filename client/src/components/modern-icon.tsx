import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ModernIconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const variantMap = {
  primary: "text-primary",
  secondary: "text-muted-foreground",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

export function ModernIcon({
  icon: Icon,
  size = "md",
  variant = "primary",
  animated = false,
  className = "",
}: ModernIconProps) {
  const iconClasses = `${sizeMap[size]} ${variantMap[variant]} ${className}`;

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="inline-block"
      >
        <Icon className={iconClasses} />
      </motion.div>
    );
  }

  return <Icon className={iconClasses} />;
}

// Componente para íconos con background circular
interface IconBadgeProps extends ModernIconProps {
  gradient?: string;
  pulse?: boolean;
}

export function IconBadge({
  icon: Icon,
  size = "md",
  gradient = "from-primary to-primary/80",
  pulse = false,
  className = "",
}: IconBadgeProps) {
  const containerSize = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  return (
    <motion.div
      className={`${containerSize[size]} bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center shadow-lg ${className}`}
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className={`${iconSize[size]} text-white`} />
    </motion.div>
  );
}