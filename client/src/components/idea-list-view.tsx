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
  CheckCircle2,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 ease-out hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-5">
        {/* Position Ranking - Enhanced Visual */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <motion.div
            className={`text-2xl font-extrabold ${getRankingStyle(position)} min-w-[3rem] text-center px-2 py-1 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            #{position}
          </motion.div>
          {position <= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs mt-1 text-yellow-500 dark:text-yellow-400 font-semibold"
            >
              {position === 1 && "🏆"}
              {position === 2 && "🥈"}
              {position === 3 && "🥉"}
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Title and Description */}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-400 transition-colors duration-200">
                {idea.title}
              </h3>
              {idea.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {idea.description}
                </p>
              )}

              {/* Badges Row - Visual List Style with UX improvements */}
              <div className="flex items-center gap-2.5 flex-wrap mt-3">
                {/* Niche Badge - Enhanced Visual with interaction */}
                {idea.niche && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-200 border-2 border-primary/30 dark:border-primary/40 text-xs px-3 py-1.5 font-semibold shadow-sm hover:shadow-md hover:bg-primary/20 dark:hover:bg-primary/35 transition-all duration-200 cursor-default"
                      data-testid={`niche-badge-list-${idea.id}`}
                    >
                      {t(`ideaForm.niches.${idea.niche}`, idea.niche)}
                    </Badge>
                  </motion.div>
                )}
                {/* Position Change Badge - Enhanced Visual with interaction */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Badge
                    variant="secondary"
                    className={`${positionIndicator.className} flex items-center gap-1.5 text-xs px-3 py-1.5 font-semibold border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-default`}
                  >
                    {positionIndicator.icon}
                    {positionIndicator.text}
                  </Badge>
                </motion.div>
                {/* Vote Count - More Prominent with better UX */}
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-100 via-purple-100 to-pink-100 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-pink-900/30 px-3 py-1.5 rounded-none border-2 border-pink-300/60 dark:border-pink-700/60 shadow-sm hover:shadow-md hover:from-pink-200 hover:via-purple-200 hover:to-pink-200 dark:hover:from-pink-900/40 dark:hover:via-purple-900/40 dark:hover:to-pink-900/40 transition-all duration-200 cursor-default"
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Heart
                    className="w-4 h-4 text-pink-600 dark:text-pink-400"
                    fill="currentColor"
                  />
                  <span className="font-bold text-base text-gray-900 dark:text-white">
                    {idea.votes}
                  </span>
                </motion.div>
                {/* Priority Score Badge (Premium only) */}
                {priorityScore !== undefined && (
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-none border-2 shadow-sm transition-all duration-200 cursor-default ${
                      hasYouTubeData 
                        ? "bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-100 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-emerald-900/30 border-emerald-300/60 dark:border-emerald-700/60"
                        : "bg-gradient-to-r from-gray-100 via-slate-100 to-gray-100 dark:from-gray-800/30 dark:via-slate-800/30 dark:to-gray-800/30 border-gray-300/60 dark:border-gray-600/60"
                    }`}
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    title={hasYouTubeData ? t("priority.hybridScore") : t("priority.votesOnly")}
                  >
                    <TrendingUp
                      className={`w-4 h-4 ${hasYouTubeData ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}
                    />
                    <span className="font-bold text-base text-gray-900 dark:text-white">
                      {priorityScore}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Creator indicator for audience users */}
              {!isCreator && (
                <Badge
                  variant="outline"
                  className="text-xs mt-2 w-fit border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
                >
                  <User className="w-3 h-3 mr-1.5" />
                  {t("ideas.byCreator", "Por creador")}
                </Badge>
              )}
            </div>

            {/* Actions - Enhanced UX */}
            <div className="flex-shrink-0 flex flex-row items-center gap-2 mt-4 sm:mt-0">
              {/* Vote Button - Enhanced */}
              {!isCreator && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={handleVote}
                    disabled={hasVoted || isVoting}
                    variant={hasVoted ? "secondary" : "default"}
                    size="sm"
                    className={`transition-all duration-300 font-semibold shadow-sm hover:shadow-md ${
                      hasVoted
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/40 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 hover:shadow-lg"
                    } ${isVoteAnimating ? "scale-110 ring-2 ring-green-400" : ""}`}
                    aria-label={
                      hasVoted
                        ? t("ideas.alreadyVoted", "Ya votaste")
                        : t("ideas.vote", "Votar")
                    }
                  >
                    {isVoting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ThumbsUp
                          className={`h-4 w-4 mr-1.5 ${hasVoted ? "fill-current" : ""}`}
                        />
                        <span className="hidden xs:inline">
                          {hasVoted
                            ? t("ideas.voted", "Votado")
                            : t("ideas.vote", "Votar")}
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Script Button (for creators) - Enhanced */}
              {isCreator && onOpenTemplate && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => onOpenTemplate(idea)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    data-testid={`button-template-list-${idea.id}`}
                    aria-label={t("ideas.openScript")}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">
                      {t("ideas.script")}
                    </span>
                  </Button>
                </motion.div>
              )}

              {/* Edit Button (for creators) - Enhanced */}
              {isCreator && onEdit && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => onEdit(idea)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    aria-label={t("ideas.edit", "Editar")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">
                      {t("ideas.edit", "Editar")}
                    </span>
                  </Button>
                </motion.div>
              )}

              {/* Complete Button (for creators) - Enhanced */}
              {isCreator && onComplete && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => onComplete(idea.id)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-400 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    data-testid={`button-complete-${idea.id}`}
                    aria-label={t("ideas.complete", "Completar")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">
                      {t("ideas.complete", "Completar")}
                    </span>
                  </Button>
                </motion.div>
              )}

              {/* Delete Button (for creators) - Enhanced */}
              {isCreator && onDelete && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => onDelete(idea.id)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 hover:border-red-400 dark:hover:border-red-600 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    data-testid={`button-delete-${idea.id}`}
                    aria-label={t("ideas.delete", "Eliminar")}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1.5">
                      {t("ideas.delete", "Eliminar")}
                    </span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
