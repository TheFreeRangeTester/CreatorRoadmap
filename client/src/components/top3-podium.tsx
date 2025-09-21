import { motion } from "framer-motion";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Top3PodiumProps {
  ideas: IdeaResponse[];
  onVote: (ideaId: number) => void;
  isVoting: { [key: number]: boolean };
  votedIdeas: Set<number>;
  successVote: number | null;
  user: any;
}

export function Top3Podium({ 
  ideas, 
  onVote, 
  isVoting, 
  votedIdeas, 
  successVote, 
  user 
}: Top3PodiumProps) {
  const { t } = useTranslation();
  
  // Get top 3 ideas sorted by votes
  const top3Ideas = ideas.slice(0, 3);
  
  if (top3Ideas.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Section Header */}
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Trophy className="inline-block w-8 h-8 mr-2 text-yellow-500" />
          {t('podium.title', 'Top Ideas')}
        </motion.h2>
        <motion.p 
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {t('podium.subtitle', 'Las ideas más votadas por la comunidad')}
        </motion.p>
      </div>

      {/* Desktop Podium Layout (2-1-3) */}
      <div className="hidden md:grid grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
        {/* Second Place */}
        {top3Ideas[1] && (
          <motion.div
            className="transform translate-y-8"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 32 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <PodiumCard 
              idea={top3Ideas[1]} 
              rank={2} 
              height="h-64"
              onVote={onVote}
              isVoting={isVoting[top3Ideas[1].id]}
              hasVoted={votedIdeas.has(top3Ideas[1].id)}
              showSuccess={successVote === top3Ideas[1].id}
              user={user}
            />
          </motion.div>
        )}
        
        {/* First Place - Tallest and most prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <PodiumCard 
            idea={top3Ideas[0]} 
            rank={1} 
            height="h-80"
            isWinner
            onVote={onVote}
            isVoting={isVoting[top3Ideas[0].id]}
            hasVoted={votedIdeas.has(top3Ideas[0].id)}
            showSuccess={successVote === top3Ideas[0].id}
            user={user}
          />
        </motion.div>
        
        {/* Third Place */}
        {top3Ideas[2] && (
          <motion.div
            className="transform translate-y-12"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 48 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <PodiumCard 
              idea={top3Ideas[2]} 
              rank={3} 
              height="h-56"
              onVote={onVote}
              isVoting={isVoting[top3Ideas[2].id]}
              hasVoted={votedIdeas.has(top3Ideas[2].id)}
              showSuccess={successVote === top3Ideas[2].id}
              user={user}
            />
          </motion.div>
        )}
      </div>

      {/* Mobile Podium Layout (Stacked) */}
      <div className="md:hidden space-y-4">
        {top3Ideas.map((idea, index) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <PodiumCard 
              idea={idea} 
              rank={index + 1} 
              height="h-32"
              isMobile
              isWinner={index === 0}
              onVote={onVote}
              isVoting={isVoting[idea.id]}
              hasVoted={votedIdeas.has(idea.id)}
              showSuccess={successVote === idea.id}
              user={user}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

interface PodiumCardProps {
  idea: IdeaResponse;
  rank: number;
  height: string;
  isWinner?: boolean;
  isMobile?: boolean;
  onVote: (ideaId: number) => void;
  isVoting: boolean;
  hasVoted: boolean;
  showSuccess: boolean;
  user: any;
}

function PodiumCard({ 
  idea, 
  rank, 
  height, 
  isWinner = false, 
  isMobile = false,
  onVote,
  isVoting,
  hasVoted,
  showSuccess,
  user
}: PodiumCardProps) {
  const { t } = useTranslation();

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2: return "from-gray-400/20 to-slate-400/20 border-gray-400/30";
      case 3: return "from-amber-600/20 to-orange-500/20 border-amber-600/30";
      default: return "from-primary/20 to-blue-500/20 border-primary/30";
    }
  };

  const handleVoteClick = () => {
    if (!hasVoted && !isVoting) {
      onVote(idea.id);
    }
  };

  return (
    <motion.div
      whileHover={{ 
        scale: isMobile ? 1.02 : 1.05, 
        y: isMobile ? -2 : -4,
        rotateY: isWinner ? 2 : 0 
      }}
      className="relative"
    >
      {/* Winner Glow Effect */}
      {isWinner && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-2xl blur-sm"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      )}

      {/* Success Particles */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full h-2 w-2 ${
                ["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-purple-400", "bg-pink-400"][i % 5]
              }`}
              initial={{ x: "50%", y: "50%", scale: 0 }}
              animate={{
                x: `${50 + (Math.random() * 60 - 30)}%`,
                y: `${50 + (Math.random() * 60 - 30)}%`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          ))}
        </motion.div>
      )}

      <Card className={cn(
        height,
        "relative overflow-hidden bg-gradient-to-br",
        getRankColor(rank),
        isWinner && "ring-2 ring-yellow-500/40 shadow-2xl",
        isMobile ? "flex items-center p-4" : "p-6",
        "backdrop-blur-sm"
      )}>
        <CardContent className={cn(
          isMobile ? "flex items-center gap-4 p-0 w-full" : "h-full flex flex-col justify-between p-0"
        )}>
          {/* Rank Badge with Animation */}
          <motion.div 
            className={cn("flex items-center gap-2", isMobile ? "" : "mb-4")}
            animate={isWinner ? { 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getRankIcon(rank)}
            <Badge variant="secondary" className="font-bold text-sm">
              #{rank}
            </Badge>
            {isWinner && (
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            )}
          </motion.div>

          {/* Idea Content */}
          <div className={cn(isMobile ? "flex-1" : "flex-1 flex flex-col justify-center")}>
            <h3 className={cn(
              "font-semibold leading-tight mb-2 line-clamp-2",
              isMobile ? "text-sm" : "text-base"
            )}>
              {idea.title}
            </h3>
            <p className={cn(
              "text-muted-foreground line-clamp-3",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {idea.description}
            </p>
          </div>

          {/* Vote Section */}
          <div className={cn(isMobile ? "flex flex-col items-end gap-2" : "mt-4")}>
            <Button
              onClick={handleVoteClick}
              disabled={hasVoted || isVoting || !user}
              size={isMobile ? "sm" : "default"}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isMobile ? "text-xs px-3" : "w-full",
                hasVoted 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-primary hover:bg-primary/90 hover:scale-105"
              )}
            >
              {isVoting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : hasVoted ? (
                t("common.voted", "¡Votado!")
              ) : (
                `${t("common.vote", "Votar")} • ${idea.votes}`
              )}
            </Button>
            
            {isMobile && (
              <div className="text-xs text-muted-foreground">
                {idea.votes} {t("common.votes", "votos")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}