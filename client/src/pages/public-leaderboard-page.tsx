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
import { apiRequest } from "@/lib/queryClient";
import { IdeaResponse, PublicLinkResponse } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";
import EnhancedRankingCard from "@/components/enhanced-ranking-card";
import { motion, AnimatePresence } from "framer-motion";

interface PublicLeaderboardResponse {
  ideas: IdeaResponse[];
  publicLink: PublicLinkResponse;
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
      const response = await apiRequest("POST", endpoint);

      // Optimistically update voted ideas
      setVotedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.add(ideaId);
        return newSet;
      });

      // Show success animation
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 3000);

      // Refetch data to update UI with new positions
      await refetch();

      // Calcular nueva posición potencial
      const ideaIndex = data?.ideas.findIndex(idea => idea.id === ideaId);
      const currentRank = ideaIndex !== undefined ? ideaIndex + 1 : 0;
      
      toast({
        title: "¡Voto registrado!",
        description: currentRank <= 3 
          ? `¡Tu voto ayudó a esta idea en el top ${currentRank}!`
          : `Tu voto cuenta. Esta idea está en la posición #${currentRank}`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
    } catch (error) {
      console.error("[ERROR] Vote error details:", error);
      toast({
        title: t("creator.voteError"),
        description: (error as Error).message || t("creator.voteErrorDesc"),
        variant: "destructive",
      });
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
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {ideas.map((idea, index) => {
            const rank = index + 1;
            const votesToNext = getVotesToNextRank(rank, idea.votes);
            const recentVotes = getRecentVotes24h(idea.id);
            
            return (
              <EnhancedRankingCard
                key={idea.id}
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
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
