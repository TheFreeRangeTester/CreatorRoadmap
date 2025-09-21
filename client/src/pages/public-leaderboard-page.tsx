import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import {
  Loader2,
  Share2,
  ThumbsUp,
  RefreshCcw,
  UserPlus,
  User,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { IdeaResponse, PublicLinkResponse } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";
import EnhancedRankingCard from "@/components/enhanced-ranking-card";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";
import { Top3Podium } from "@/components/top3-podium";

interface PublicLeaderboardResponse {
  ideas: IdeaResponse[];
  publicLink: PublicLinkResponse;
  creator: {
    username: string;
    logoUrl?: string;
  };
}

export default function PublicLeaderboardPage() {
  const [, params] = useRoute("/public/:token");
  const [, navigate] = useLocation();
  const token = params?.token;
  const [isVoting, setIsVoting] = useState<{ [key: number]: boolean }>({});
  const [successVote, setSuccessVote] = useState<number | null>(null);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, error, refetch } =
    useQuery<PublicLeaderboardResponse>({
      queryKey: [`/api/public/${token}`],
      enabled: !!token,
    });

  console.log("[DEBUG] PublicLeaderboardPage rendered with token:", token);
  console.log("[DEBUG] Data:", data);
  console.log("[DEBUG] Error:", error);

  useEffect(() => {
    if (error) {
      toast({
        title: t("common.error", "Error"),
        description:
          (error as Error).message || t("publicLeaderboard.errorLoading"),
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [error, navigate]);

  if (isLoading || !data) {
    return <LeaderboardSkeleton />;
  }

  const { ideas, publicLink } = data;

  // Función para calcular votos necesarios para subir de posición
  const getVotesToNextRank = (currentRank: number, currentVotes: number) => {
    if (!data?.ideas || currentRank <= 1) return 0;
    
    const sortedIdeas = [...data.ideas].sort((a, b) => b.votes - a.votes);
    const ideaAbove = sortedIdeas[currentRank - 2]; // -2 porque el array es 0-indexed y queremos la idea anterior
    
    if (ideaAbove) {
      return Math.max(0, ideaAbove.votes - currentVotes + 1);
    }
    return 0;
  };

  // Simular votos recientes (esto normalmente vendría del backend)
  const getRecentVotes24h = (ideaId: number) => {
    // Simulación simple basada en el ID para demostración
    return Math.floor(Math.random() * 5);
  };

  const handleVote = async (ideaId: number) => {
    try {
      setIsVoting((prev) => ({ ...prev, [ideaId]: true }));

      const endpoint = `/api/public/${token}/ideas/${ideaId}/vote`;
      console.log(`[FRONTEND] Attempting to vote for idea ${ideaId} on public leaderboard`);
      const response = await apiRequest(endpoint, {
        method: "POST"
      });
      console.log(`[FRONTEND] Public vote request successful`, response);

      // Optimistically update voted ideas
      setVotedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.add(ideaId);
        return newSet;
      });

      // Show success animation
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 3000);

      // Invalidate cache for points and stats to update in real-time
      await queryClient.invalidateQueries({ queryKey: ['/api/user/points'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user/audience-stats'] });

      // Refetch data to update UI with new positions
      const refreshedData = await refetch();

      // Calcular nueva posición después del refetch
      const newIdeaIndex = refreshedData.data?.ideas.findIndex(idea => idea.id === ideaId);
      const newRank = newIdeaIndex !== undefined ? newIdeaIndex + 1 : 0;
      
      toast({
        title: t("common.voteRegistered", "¡Voto registrado!"),
        description: newRank <= 3 
          ? t("common.voteHelpedTopIdea", "¡Tu voto ayudó a esta idea en el top {{rank}}!", { rank: newRank })
          : t("common.voteCountsPosition", "Tu voto cuenta. Esta idea está en la posición #{{rank}}", { rank: newRank }),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
    } catch (error: any) {
      console.error("[ERROR] Vote error details:", error);
      
      // Check if this is a self-voting error
      if (error.error === "self_vote_attempt") {
        toast({
          title: t("creator.cantVoteOwn"),
          description: t("creator.cantVoteOwnDesc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("creator.voteError"),
          description: error.message || t("creator.voteErrorDesc"),
          variant: "destructive",
        });
      }
    } finally {
      setIsVoting((prev) => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: t("publicLeaderboard.title"),
          text: t("publicLeaderboard.description"),
          url: window.location.href,
        })
        .catch((error) => {
          console.error("[ERROR] Error sharing:", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t("common.copySuccess"),
      description: t("common.copyDesc", { url: window.location.href }),
    });
  };

  return (
    <div className="container px-4 mx-auto py-8 dark:bg-gray-950 min-h-screen">
      {/* Header mejorado con efectos visuales */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Trophy className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3 text-yellow-500" />
            Leaderboard
          </motion.h1>
          <motion.p 
            className="text-muted-foreground dark:text-gray-400 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Vota por las mejores ideas y ayuda a darles forma al futuro
          </motion.p>
        </div>
        
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {user && (
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300 dark:border-blue-800/50 px-4 py-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <User className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
              <span className="font-semibold">{user.username}</span>
            </Badge>
          )}
          <Button
            variant="ghost"
            onClick={() => refetch()}
            aria-label="Actualizar leaderboard"
            className="flex items-center dark:text-gray-300 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
          >
            <RefreshCcw className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center gap-2 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </motion.div>
      </motion.div>

      {ideas.length === 0 ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
          <h2 className="text-3xl font-semibold dark:text-white mb-2">
            Aún no hay ideas
          </h2>
          <p className="text-muted-foreground dark:text-gray-400 text-lg">
            Sé el primero en sugerir una idea increíble
          </p>
        </motion.div>
      ) : (
        <>
          {/* Creator Info Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {data.creator.logoUrl && (
                    <motion.img
                      src={data.creator.logoUrl}
                      alt={data.creator.username}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  )}
                  <div className="flex-1">
                    <motion.h2 
                      className="text-2xl font-bold mb-1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      @{data.creator.username}
                    </motion.h2>
                    <motion.p 
                      className="text-muted-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {t("publicLeaderboard.voteForIdeas", "Vota por las ideas que quieres ver realizadas")}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top 3 Podium */}
          <Top3Podium
            ideas={ideas}
            onVote={handleVote}
            isVoting={isVoting}
            votedIdeas={votedIdeas}
            successVote={successVote}
            user={user}
          />

          {/* Rest of Ideas (4th place onwards) */}
          {ideas.length > 3 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t("leaderboard.otherIdeas", "Otras ideas geniales")}
                </h3>
                <p className="text-muted-foreground">
                  {t("leaderboard.otherIdeasDesc", "¡Cada voto cuenta para subir en el ranking!")}
                </p>
              </div>
              
              {ideas.slice(3).map((idea, index) => {
                const rank = index + 4; // Starting from 4th place
                const votesToNext = getVotesToNextRank(rank, idea.votes);
                const recentVotes = getRecentVotes24h(idea.id);
                
                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  >
                    <EnhancedRankingCard
                      rank={rank}
                      idea={idea}
                      isVoting={isVoting[idea.id]}
                      isVoted={votedIdeas.has(idea.id)}
                      isSuccessVote={successVote === idea.id}
                      onVote={handleVote}
                      isLoggedIn={!!user}
                      votesToNextRank={votesToNext}
                      recentVotes24h={recentVotes}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* Sticky Mobile Vote CTA */}
      {user && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 md:hidden z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-2xl shadow-2xl"
            onClick={() => {
              const firstUnvotedIdea = ideas.find(idea => !votedIdeas.has(idea.id));
              if (firstUnvotedIdea) {
                handleVote(firstUnvotedIdea.id);
              }
            }}
          >
            <ThumbsUp className="w-5 h-5 mr-2" />
            {t("mobile.tapToVote", "¡Toca para votar!")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
