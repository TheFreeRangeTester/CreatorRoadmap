import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Top3CardsProps {
  ideas: IdeaResponse[];
  onVote: (ideaId: number) => void;
  isVoting: { [key: number]: boolean };
  votedIdeas: Set<number>;
  user: any;
}

export function Top3Cards({ 
  ideas, 
  onVote, 
  isVoting, 
  votedIdeas, 
  user 
}: Top3CardsProps) {
  const { t } = useTranslation();
  
  const top3Ideas = ideas.slice(0, 3);
  
  if (top3Ideas.length === 0) {
    return null;
  }

  const getBorderColor = (rank: number) => {
    switch(rank) {
      case 1: return "from-yellow-400 via-amber-400 to-yellow-500";
      case 2: return "from-blue-400 via-cyan-400 to-blue-500";
      case 3: return "from-orange-400 via-amber-500 to-orange-500";
      default: return "from-gray-300 to-gray-400";
    }
  };

  const getBadgeColor = (rank: number) => {
    switch(rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900";
      case 2: return "bg-gradient-to-r from-blue-400 to-cyan-500 text-blue-900";
      case 3: return "bg-gradient-to-r from-orange-400 to-amber-500 text-orange-900";
      default: return "bg-gray-200 text-gray-700";
    }
  };

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

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Top 3 Ideas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3Ideas.map((idea, index) => {
          const rank = index + 1;
          const hasVoted = votedIdeas.has(idea.id);
          const voting = isVoting[idea.id];

          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative"
              data-testid={`card-idea-${idea.id}`}
            >
              <div className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-br p-[2px]",
                getBorderColor(rank)
              )}>
                <div className="h-full w-full rounded-xl bg-white dark:bg-gray-900" />
              </div>

              <div className="relative p-5 h-full flex flex-col min-h-[200px]">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold",
                    getBadgeColor(rank)
                  )}>
                    <Trophy className="w-3 h-3" />
                    #{rank}
                  </div>

                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {idea.votes}
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-2 line-clamp-2">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  {idea.suggestedBy && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("ideas.by", "Por")} {idea.suggestedBy}
                    </span>
                  )}
                  <Button
                    onClick={() => handleVoteClick(idea.id)}
                    disabled={hasVoted || voting}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "ml-auto flex items-center gap-1.5 border-2 font-medium transition-all",
                      hasVoted 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600 dark:text-green-400" 
                        : "border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    data-testid={`button-vote-${idea.id}`}
                  >
                    {voting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : hasVoted ? (
                      t("common.voted", "Votado")
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
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
