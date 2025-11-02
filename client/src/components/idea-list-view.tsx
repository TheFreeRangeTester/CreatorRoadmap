import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  ThumbsUp,
  Loader2,
  User,
  TrendingUp,
  Heart,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

interface IdeaListViewProps {
  idea: IdeaResponse;
  position: number; // 1-based position in the list
  onVote: (ideaId: number) => void;
  onEdit?: (idea: IdeaResponse) => void;
  onDelete?: (ideaId: number) => void;
  onOpenTemplate?: (idea: IdeaResponse) => void;
  isVoting: boolean;
}

export default function IdeaListView({
  idea,
  position,
  onVote,
  onEdit,
  onDelete,
  onOpenTemplate,
  isVoting,
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
        className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        icon: <Plus className="w-3 h-3" />,
        text: t("badges.new", "Nuevo"),
      };
    }

    if (change !== null && change > 0) {
      return {
        className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        icon: <ArrowUp className="w-3 h-3" />,
        text: `+${change}`,
      };
    }

    if (change !== null && change < 0) {
      return {
        className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        icon: <ArrowDown className="w-3 h-3" />,
        text: `${change}`,
      };
    }

    return {
      className: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 hover:bg-white/90 dark:hover:bg-gray-900/90 hover:shadow-lg transition-all duration-300 hover:border-gray-300/60 dark:hover:border-gray-600/60"
    >
      <div className="flex items-start gap-4">
        {/* Position Ranking */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={`text-2xl font-bold ${getRankingStyle(position)} min-w-[2rem] text-center`}>
            #{position}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {idea.title}
              </h3>
              {idea.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {idea.description}
                </p>
              )}
              
              {/* Badges Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Niche Badge */}
                {idea.niche && (
                  <Badge 
                    variant="secondary"
                    className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 border border-primary/20 dark:border-primary/30 text-xs px-2 py-1"
                    data-testid={`niche-badge-list-${idea.id}`}
                  >
                    {t(`ideaForm.niches.${idea.niche}`, idea.niche)}
                  </Badge>
                )}

                {/* Position Change Badge */}
                <Badge 
                  variant="secondary" 
                  className={`${positionIndicator.className} flex items-center gap-1 text-xs px-2 py-1`}
                >
                  {positionIndicator.icon}
                  {positionIndicator.text}
                </Badge>

                {/* Vote Count - More prominent */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 px-3 py-2 rounded-full border border-pink-200/50 dark:border-pink-800/50">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="font-bold text-lg text-gray-900 dark:text-white">{idea.votes}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("ideas.votes")}</span>
                </div>

                {/* Creator indicator for audience users */}
                {!isCreator && (
                  <Badge variant="outline" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {t("ideas.byCreator", "Por creador")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Vote Button */}
              {!isCreator && (
                <Button
                  onClick={handleVote}
                  disabled={hasVoted || isVoting}
                  variant={hasVoted ? "secondary" : "default"}
                  size="sm"
                  className={`transition-all duration-300 ${
                    hasVoted
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  } ${isVoteAnimating ? "scale-110" : ""}`}
                >
                  {isVoting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {hasVoted ? t("ideas.voted", "Votado") : t("ideas.vote", "Votar")}
                    </>
                  )}
                </Button>
              )}

              {/* Template Button (for creators) */}
              {isCreator && onOpenTemplate && (
                <Button
                  onClick={() => onOpenTemplate(idea)}
                  variant="outline"
                  size="sm"
                  className="border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                  data-testid={`button-template-list-${idea.id}`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">{t("ideas.template", "Template")}</span>
                </Button>
              )}

              {/* Edit Button (for creators) */}
              {isCreator && onEdit && (
                <Button
                  onClick={() => onEdit(idea)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">{t("ideas.edit", "Editar")}</span>
                </Button>
              )}

              {/* Delete Button (for creators) */}
              {isCreator && onDelete && (
                <Button
                  onClick={() => onDelete(idea.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">{t("ideas.delete", "Eliminar")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}