import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface CompactIdeaCardProps {
  rank: number;
  idea: {
    id: number;
    title: string;
    description: string;
    votes: number;
    position?: {
      current: number | null;
      previous: number | null;
      change: number | null;
    };
  };
  isVoting?: boolean;
  isVoted?: boolean;
  onVote?: (ideaId: number) => void;
  isLoggedIn?: boolean;
  className?: string;
}

export function CompactIdeaCard({
  rank,
  idea,
  isVoting = false,
  isVoted = false,
  onVote,
  isLoggedIn = false,
  className
}: CompactIdeaCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // Determine trend indicator
  const getTrendIcon = () => {
    if (!idea.position?.change) return <Minus className="h-3 w-3" />;
    if (idea.position.change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (idea.position.change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  // Get rank styling
  const getRankStyling = () => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-500 text-orange-900";
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
    }
  };

  // Get top 3 special styling
  const getTopThreeStyling = () => {
    switch (rank) {
      case 1:
        return {
          container: "border-2 border-yellow-400/60 shadow-lg shadow-yellow-400/20 scale-105",
          gradient: "from-yellow-400/10 to-amber-500/10"
        };
      case 2:
        return {
          container: "border-2 border-gray-400/60 shadow-lg shadow-gray-400/20 scale-[1.03]",
          gradient: "from-gray-300/10 to-gray-400/10"
        };
      case 3:
        return {
          container: "border-2 border-orange-500/60 shadow-lg shadow-orange-500/20 scale-[1.02]",
          gradient: "from-amber-600/10 to-orange-500/10"
        };
      default:
        return {
          container: "",
          gradient: "from-blue-500/5 to-purple-500/5"
        };
    }
  };

  const topThreeStyle = getTopThreeStyling();

  const getRankEmoji = () => {
    switch (rank) {
      case 1: return "🏆";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "";
    }
  };

  return (
    <motion.div
      className={cn(
        "group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300",
        rank <= 3 
          ? topThreeStyle.container
          : "border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-600/50",
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Background gradient on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0",
          rank === 1 ? "from-yellow-400/10 to-amber-500/10" :
          rank === 2 ? "from-gray-300/10 to-gray-400/10" :
          rank === 3 ? "from-amber-600/10 to-orange-500/10" :
          "from-blue-500/5 to-purple-500/5"
        )}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <div className="relative p-4">
        {/* Header with rank and trend */}
        <div className="flex items-center justify-between mb-3">
          {/* Rank badge */}
          <div className="flex items-center gap-2">
            <motion.div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shadow-lg",
                getRankStyling()
              )}
              whileHover={{ scale: 1.1 }}
            >
              {getRankEmoji() || `#${rank}`}
            </motion.div>
            
            {/* Trend indicator */}
            <motion.div
              className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800"
              whileHover={{ scale: 1.1 }}
            >
              {getTrendIcon()}
            </motion.div>
          </div>

          {/* Vote count */}
          <Badge 
            variant="secondary" 
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
          >
            {idea.votes} {t("common.votes", "votos")}
          </Badge>
        </div>

        {/* Content */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 leading-tight">
            {idea.title}
          </h3>
          {idea.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {idea.description}
            </p>
          )}
        </div>

        {/* Vote button */}
        {isLoggedIn && onVote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              size="sm"
              variant={isVoted ? "secondary" : "default"}
              onClick={() => onVote(idea.id)}
              disabled={isVoting || isVoted}
              className={cn(
                "w-full h-8 text-xs font-medium transition-all duration-200",
                isVoted
                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg"
              )}
            >
              {isVoting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isVoted ? (
                <>
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {t("common.voted", "Votado")}
                </>
              ) : (
                <>
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {t("common.vote", "Votar")}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Hover border effect - only for non-top 3 */}
      {rank > 3 && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-transparent"
          animate={{
            borderColor: isHovered 
              ? "rgba(59, 130, 246, 0.3)" 
              : "transparent"
          }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}