import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Youtube,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface IdeaActionTrayProps {
  ideaId: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenScript?: () => void;
  onComplete?: () => void;
  onAnalyzeYouTube?: () => void;
  hasYouTubeData?: boolean;
  hasScript?: boolean;
  variant?: "card" | "list" | "compact";
  className?: string;
}

type ColorKey = "blue" | "gray" | "green" | "red" | "youtube";

const colorStyles: Record<ColorKey, { base: string; hover: string; border: string }> = {
  blue: {
    base: "text-blue-600 dark:text-blue-400",
    hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300",
    border: "border-blue-300 dark:border-blue-600",
  },
  gray: {
    base: "text-gray-500 dark:text-gray-400",
    hover: "hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
  green: {
    base: "text-green-600 dark:text-green-400",
    hover: "hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300",
    border: "border-green-300 dark:border-green-600",
  },
  red: {
    base: "text-red-500 dark:text-red-400",
    hover: "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300",
    border: "border-red-300 dark:border-red-600",
  },
  youtube: {
    base: "text-red-600 dark:text-red-400",
    hover: "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300",
    border: "border-red-300 dark:border-red-600",
  },
};

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color: ColorKey;
  badge?: boolean;
  testId: string;
  variant: "card" | "list" | "compact";
}

function ActionButton({ icon: Icon, label, onClick, color, badge, testId, variant }: ActionButtonProps) {
  const styles = colorStyles[color];
  
  if (variant === "card") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClick}
              className={cn(
                "relative p-2 rounded-md transition-all duration-200",
                styles.base,
                styles.hover
              )}
              aria-label={label}
              data-testid={testId}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        variant="outline"
        size="sm"
        className={cn(
          "relative border-2 font-semibold shadow-sm hover:shadow-md transition-all duration-200",
          styles.base,
          styles.border,
          styles.hover
        )}
        data-testid={testId}
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline ml-1.5">{label}</span>
        {badge && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </Button>
    </motion.div>
  );
}

export function IdeaActionTray({
  ideaId,
  onEdit,
  onDelete,
  onOpenScript,
  onComplete,
  onAnalyzeYouTube,
  hasYouTubeData,
  hasScript,
  variant = "card",
  className,
}: IdeaActionTrayProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        variant === "card" ? "justify-center" : "justify-end flex-wrap",
        className
      )}
    >
      {onAnalyzeYouTube && (
        <ActionButton
          icon={Youtube}
          label={t("ideas.analyze", "Analizar")}
          onClick={onAnalyzeYouTube}
          color="youtube"
          badge={hasYouTubeData}
          testId={`button-youtube-${ideaId}`}
          variant={variant}
        />
      )}
      {onOpenScript && (
        <ActionButton
          icon={FileText}
          label={t("ideas.script", "Guión")}
          onClick={onOpenScript}
          color="blue"
          badge={hasScript}
          testId={`button-script-${ideaId}`}
          variant={variant}
        />
      )}
      {onEdit && (
        <ActionButton
          icon={Pencil}
          label={t("ideas.edit", "Editar")}
          onClick={onEdit}
          color="gray"
          testId={`button-edit-${ideaId}`}
          variant={variant}
        />
      )}
      {onComplete && (
        <ActionButton
          icon={CheckCircle2}
          label={t("ideas.complete", "Completar")}
          onClick={onComplete}
          color="green"
          testId={`button-complete-${ideaId}`}
          variant={variant}
        />
      )}
      {onDelete && (
        <ActionButton
          icon={Trash2}
          label={t("ideas.delete", "Eliminar")}
          onClick={onDelete}
          color="red"
          testId={`button-delete-${ideaId}`}
          variant={variant}
        />
      )}
    </div>
  );
}
