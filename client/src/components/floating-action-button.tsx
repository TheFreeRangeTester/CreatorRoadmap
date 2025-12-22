import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  testId?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: React.ReactNode;
  className?: string;
}

export function FloatingActionButton({
  actions,
  mainIcon,
  className,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const action = actions[0];
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={action.onClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          "hover:from-blue-700 hover:to-purple-700 hover:shadow-xl",
          "transition-shadow duration-200",
          "md:hidden",
          className
        )}
        data-testid={action.testId || "fab-main"}
        aria-label={action.label}
      >
        {action.icon}
      </motion.button>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 md:hidden", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 items-end"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.5, 
                  x: 20,
                  transition: { delay: (actions.length - index) * 0.03 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg",
                  "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                  "border border-gray-200 dark:border-gray-700",
                  "hover:shadow-xl transition-shadow duration-200"
                )}
                data-testid={action.testId}
                aria-label={action.label}
              >
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <span className={cn("flex-shrink-0", action.color)}>
                  {action.icon}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          "hover:from-blue-700 hover:to-purple-700 hover:shadow-xl",
          "transition-all duration-200"
        )}
        data-testid="fab-toggle"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            mainIcon || <Plus className="w-6 h-6" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

interface SimpleFABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  className?: string;
  testId?: string;
}

export function SimpleFAB({
  onClick,
  icon,
  label,
  className,
  testId,
}: SimpleFABProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg",
        "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
        "hover:from-blue-700 hover:to-purple-700 hover:shadow-xl",
        "transition-shadow duration-200",
        "md:hidden",
        className
      )}
      data-testid={testId || "fab-simple"}
      aria-label={label}
    >
      {icon || <Plus className="w-6 h-6" />}
    </motion.button>
  );
}
