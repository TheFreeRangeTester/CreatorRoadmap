import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  ThumbsUp,
  Loader2,
  User,
  TrendingUp,
  Heart,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { IdeaActionTray } from "@/components/idea-action-tray";

interface IdeaListViewProps {
  idea: IdeaResponse;
  position: number; // 1-based position in the list
  onVote: (ideaId: number) => void;
  onEdit?: (idea: IdeaResponse) => void;
  onDelete?: (ideaId: number) => void;
  onComplete?: (ideaId: number) => void;
  onOpenTemplate?: (idea: IdeaResponse) => void;
  isVoting: boolean;
  priorityScore?: number;
  hasYouTubeData?: boolean;
}

export default function IdeaListView({
  idea,
  position,
  onVote,
  onEdit,
  onDelete,
  onComplete,
  onOpenTemplate,
  isVoting,
  priorityScore,
  hasYouTubeData,
}: IdeaListViewProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isVoteAnimating, setIsVoteAnimating] = useState(false);

  const isCreator = user?.id === idea.creatorId;

  // Load voting state from localStorage (user-specific)
  useEffect(() => {
    if (user) {
      const userKey = `votedIdeas_${user.id}`;
      const votedIdeas = JSON.parse(localStorage.getItem(userKey) || "[]");
      setHasVoted(votedIdeas.includes(idea.id));
    } else {
      setHasVoted(false);
    }
  }, [idea.id, user]);

  const handleVote = () => {
    if (!hasVoted && !isVoting) {
      onVote(idea.id);

      // Optimistically update UI only for authenticated users
      if (user) {
        const userKey = `votedIdeas_${user.id}`;
        const votedIdeas = JSON.parse(localStorage.getItem(userKey) || "[]");
        votedIdeas.push(idea.id);
        localStorage.setItem(userKey, JSON.stringify(votedIdeas));
        setHasVoted(true);

        // Activar animación
        setIsVoteAnimating(true);
        setTimeout(() => setIsVoteAnimating(false), 600);
      }
    }
  };

  // Get position indicator
  const getPositionIndicator = () => {
    const { current, previous, change } = idea.position;

    if (previous === null) {
      return {
        className:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        icon: <Plus className="w-3 h-3" />,
        text: t("badges.new", "Nuevo"),
      };
    }

    if (change !== null && change > 0) {
      return {
        className:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        icon: <ArrowUp className="w-3 h-3" />,
        text: `+${change}`,
      };
    }

    if (change !== null && change < 0) {
      return {
        className:
          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        icon: <ArrowDown className="w-3 h-3" />,
        text: `${change}`,
      };
    }

    return {
      className:
        "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
      icon: <TrendingUp className="w-3 h-3" />,
      text: t("badges.stable", "="),
    };
  };

  const positionIndicator = getPositionIndicator();

  // Get ranking color based on position
  const getRankingStyle = (pos: number) => {
    if (pos === 1) return "text-yellow-600 dark:text-yellow-400 font-bold"; // Gold
    if (pos === 2) return "text-gray-500 dark:text-gray-400 font-bold"; // Silver
    if (pos === 3) return "text-amber-600 dark:text-amber-500 font-bold"; // Bronze
    if (pos <= 10) return "text-blue-600 dark:text-blue-400 font-semibold"; // Top 10
    return "text-gray-500 dark:text-gray-400"; // Rest
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg transition-all duration-200"
    >
      {/* Top Row: Position, Niche, Votes, Priority, Status */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {/* Position Badge */}
        <div className="flex items-center gap-1 text-primary font-bold text-sm">
          <span>⭐</span>
          <span>#{position}</span>
        </div>
        
        {/* Niche Badge */}
        {idea.niche && (
          <Badge
            variant="secondary"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 text-xs px-2.5 py-1 font-medium rounded-full"
            data-testid={`niche-badge-list-${idea.id}`}
          >
            {t(`ideaForm.niches.${idea.niche}`, idea.niche)}
          </Badge>
        )}
        
        {/* Vote Count */}
        <div className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-900/20 px-2.5 py-1 rounded-full text-sm">
          <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {idea.votes} {t("badges.votes", "votos")}
          </span>
        </div>
        
        {/* Priority Score Badge (Premium only) */}
        {priorityScore !== undefined && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${
              hasYouTubeData 
                ? "bg-emerald-50 dark:bg-emerald-900/20"
                : "bg-gray-50 dark:bg-gray-800/50"
            }`}
            title={hasYouTubeData ? t("priority.hybridScore") : t("priority.votesOnly")}
          >
            <TrendingUp
              className={`w-3.5 h-3.5 ${hasYouTubeData ? "text-emerald-500" : "text-gray-400"}`}
            />
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {priorityScore}
            </span>
          </div>
        )}
        
        {/* Analyzed Badge */}
        {hasYouTubeData && (
          <Badge
            variant="secondary"
            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 text-xs px-2.5 py-1 font-medium rounded-full"
            data-testid={`youtube-badge-${idea.id}`}
          >
            <Youtube className="w-3 h-3 mr-1" />
            {t("ideas.analyzed", "Analizado")}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1.5">
        {idea.title}
      </h3>
      
      {/* Description */}
      {idea.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {idea.description}
        </p>
      )}

      {/* Actions Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Creator Actions */}
        {isCreator && (
          <IdeaActionTray
            ideaId={idea.id}
            onOpenScript={onOpenTemplate ? () => onOpenTemplate(idea) : undefined}
            onEdit={onEdit ? () => onEdit(idea) : undefined}
            onComplete={onComplete ? () => onComplete(idea.id) : undefined}
            onDelete={onDelete ? () => onDelete(idea.id) : undefined}
            hasYouTubeData={hasYouTubeData}
            variant="list"
          />
        )}
        
        {/* Vote Button for non-creators */}
        {!isCreator && (
          <Button
            onClick={handleVote}
            disabled={hasVoted || isVoting}
            variant="outline"
            size="sm"
            className={`rounded-full font-medium transition-all ${
              hasVoted
                ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                : "border-primary text-primary hover:bg-primary/10"
            }`}
          >
            {isVoting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ThumbsUp className={`h-4 w-4 mr-1.5 ${hasVoted ? "fill-current" : ""}`} />
                {hasVoted ? t("ideas.voted", "Votado") : t("ideas.vote", "Votar")}
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
