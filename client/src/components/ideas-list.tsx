import { motion } from "framer-motion";
import { TrendingUp, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface IdeasListProps {
  ideas: IdeaResponse[];
  onVote: (ideaId: number) => void;
  isVoting: { [key: number]: boolean };
  votedIdeas: Set<number>;
  user: any;
  startRank?: number;
}

export function IdeasList({ 
  ideas, 
  onVote, 
  isVoting, 
  votedIdeas, 
  user,
  startRank = 4
}: IdeasListProps) {
  const { t } = useTranslation();
  
  if (ideas.length === 0) {
    return null;
  }

  const handleVoteClick = (ideaId: number) => {
    if (!user) {
      localStorage.setItem("redirectAfterAuth", window.location.pathname);
      window.location.href = "/auth";
      return;
    }
    
    if (!votedIdeas.has(ideaId) && !isVoting[ideaId]) {
      onVote(ideaId);
    }
  };

  const getBorderAccent = (rank: number) => {
    if (rank <= 10) return "border-l-amber-400";
    if (rank <= 20) return "border-l-blue-400";
    return "border-l-gray-300 dark:border-l-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {t("ideas.allIdeas", "Todas las Ideas")}
      </h2>

      <div className="space-y-3">
        {ideas.map((idea, index) => {
          const rank = startRank + index;
          const hasVoted = votedIdeas.has(idea.id);
          const voting = isVoting[idea.id];

          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className={cn(
                "relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",
                "border-l-4 p-4 transition-shadow hover:shadow-md dark:hover:shadow-gray-800/50",
                getBorderAccent(rank)
              )}
              data-testid={`card-idea-list-${idea.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold text-gray-600 dark:text-gray-400 text-sm">
                  #{rank}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {idea.description}
                  </p>
                  {idea.suggestedByUsername && (
                    <Badge
                      variant="outline"
                      className="mt-2 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      data-testid={`suggested-badge-list-${idea.id}`}
                    >
                      <User className="w-3 h-3 mr-1" />
                      {t("ideas.suggestedByAudience")}
                    </Badge>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {idea.votes}
                  </div>

                  <Button
                    onClick={() => handleVoteClick(idea.id)}
                    disabled={hasVoted || voting}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1.5 border-2 font-medium transition-all text-xs px-3",
                      hasVoted 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600 dark:text-green-400" 
                        : "border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    data-testid={`button-vote-list-${idea.id}`}
                  >
                    {voting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : hasVoted ? (
                      t("common.voted", "Votado")
                    ) : (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        {t("common.vote", "Votar")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
