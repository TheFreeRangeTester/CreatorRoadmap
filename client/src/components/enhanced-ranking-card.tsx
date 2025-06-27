import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import { ChevronUp, Loader2, ThumbsUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface EnhancedRankingCardProps {
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
  isSuccessVote?: boolean;
  onVote?: (ideaId: number) => void;
  isLoggedIn?: boolean;
  votesToNextRank?: number;
  recentVotes24h?: number;
}

export default function EnhancedRankingCard({
  rank,
  idea,
  isVoting = false,
  isVoted = false,
  isSuccessVote = false,
  onVote,
  isLoggedIn = false,
  votesToNextRank = 0,
  recentVotes24h = 0,
}: EnhancedRankingCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [showVotePreview, setShowVotePreview] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Efectos de partículas cuando se vota exitosamente
  useEffect(() => {
    if (isSuccessVote) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2000);
    }
  }, [isSuccessVote]);

  // Determinar el estilo y emoji de medalla según el ranking
  const getMedalInfo = () => {
    switch (rank) {
      case 1:
        return {
          emoji: "🏆",
          gradient: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600",
          shadow: "shadow-yellow-500/50",
          glow: "shadow-2xl shadow-yellow-400/30",
          textColor: "text-yellow-900",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        };
      case 2:
        return {
          emoji: "🥈",
          gradient: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
          shadow: "shadow-gray-400/50",
          glow: "shadow-2xl shadow-gray-400/30",
          textColor: "text-gray-800",
          bgColor: "bg-gray-50 dark:bg-gray-800/20",
        };
      case 3:
        return {
          emoji: "🥉",
          gradient: "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700",
          shadow: "shadow-orange-500/50",
          glow: "shadow-2xl shadow-orange-400/30",
          textColor: "text-orange-900",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
        };
      default:
        return {
          emoji: null,
          gradient: `bg-gradient-to-r ${getColorGradient(rank)}`,
          shadow: "shadow-blue-400/30",
          glow: "shadow-lg shadow-blue-400/20",
          textColor: "text-blue-900",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
        };
    }
  };

  // Gradientes para rankings 4+
  const getColorGradient = (rank: number) => {
    const gradients = [
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-violet-500",
      "from-green-400 to-emerald-500",
      "from-pink-400 to-rose-500",
      "from-cyan-400 to-teal-500",
      "from-indigo-400 to-purple-500",
    ];
    return gradients[(rank - 4) % gradients.length];
  };

  // Determinar tendencia
  const getTrendIcon = () => {
    if (!idea.position) return null;
    const { change } = idea.position;
    
    if (change === null || change === 0) {
      return <Minus className="w-4 h-4 text-gray-500" />;
    } else if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const medalInfo = getMedalInfo();

  const handleVoteClick = () => {
    if (onVote) {
      onVote(idea.id);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isLoggedIn && !isVoted && votesToNextRank > 0) {
      setShowVotePreview(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVotePreview(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: rank * 0.05,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="will-change-transform relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Partículas de éxito */}
      <AnimatePresence>
        {showParticles && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full h-3 w-3 ${
                  [
                    "bg-yellow-400",
                    "bg-blue-400",
                    "bg-green-400",
                    "bg-purple-400",
                    "bg-pink-400",
                    "bg-cyan-400",
                  ][i % 6]
                }`}
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() * 80 - 40)}%`,
                  y: `${50 + (Math.random() * 80 - 40)}%`,
                  scale: [0, 1, 0.7, 0],
                  rotate: 360,
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className={`overflow-hidden border-0 ${medalInfo.shadow} hover:${medalInfo.glow} transition-all duration-500 ${medalInfo.bgColor} rounded-xl`}>
        <div className="flex items-stretch">
          {/* Indicador de posición con medallas */}
          <motion.div 
            className={`flex flex-col items-center justify-center w-20 md:w-24 text-white font-bold relative ${medalInfo.gradient} rounded-l-xl`}
            whileHover={{ scale: 1.05 }}
          >
            {/* Número de ranking */}
            <motion.span 
              className="text-xl md:text-2xl font-black mb-1"
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              #{rank}
            </motion.span>
            
            {/* Medalla para top 3 */}
            {medalInfo.emoji && (
              <motion.span 
                className="text-2xl md:text-3xl"
                animate={isSuccessVote ? { 
                  scale: [1, 1.3, 1], 
                  rotate: [0, 15, -15, 0] 
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {medalInfo.emoji}
              </motion.span>
            )}
            
            {/* Indicador de tendencia */}
            <div className="absolute top-2 right-2">
              {getTrendIcon()}
            </div>
          </motion.div>

          {/* Contenido principal */}
          <div className="flex-1 p-4 md:p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg md:text-xl font-bold dark:text-white line-clamp-2 pr-2">
                {idea.title}
              </h3>
              
              {/* Badges de información */}
              <div className="flex flex-col gap-1 ml-2">
                {recentVotes24h > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  >
                    🔥 {t("common.recentVotesToday", "+{{count}} hoy", { count: recentVotes24h })}
                  </Badge>
                )}
                {showVotePreview && votesToNextRank > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {votesToNextRank} {t("common.votesToNextRank", "votos para subir")}
                  </motion.div>
                )}
              </div>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
              {idea.description}
            </p>

            {/* Información de votación en móvil */}
            <div className="flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium dark:text-white">
                  {idea.votes} votos
                </span>
              </div>
            </div>
          </div>

          {/* Sección de votos - desktop */}
          <div className="hidden md:flex flex-col items-center justify-center px-6 border-l border-gray-100 dark:border-gray-700 min-w-[120px]">
            {isLoggedIn ? (
              isVoted ? (
                <motion.div className="text-center">
                  <Button 
                    disabled
                    className="rounded-full w-14 h-14 text-white bg-green-500 hover:bg-green-500 mb-2"
                    aria-label="Ya votado"
                  >
                    <ThumbsUp className="h-6 w-6" />
                  </Button>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Votado
                  </span>
                </motion.div>
              ) : (
                <motion.div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleVoteClick}
                      disabled={isVoting || isSuccessVote}
                      className={`rounded-full w-14 h-14 text-white transition-all duration-300 ${
                        isSuccessVote 
                          ? "bg-green-500 hover:bg-green-500" 
                          : `${medalInfo.gradient} hover:shadow-lg`
                      } mb-2`}
                      aria-label="Votar"
                    >
                      {isVoting ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : isSuccessVote ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                          transition={{ duration: 0.6 }}
                        >
                          <ThumbsUp className="h-6 w-6" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={isHovered ? { y: -2 } : { y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronUp className="h-6 w-6" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {isSuccessVote ? "¡Votado!" : "Votar"}
                  </span>
                </motion.div>
              )
            ) : (
              <motion.div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`rounded-full w-14 h-14 text-white ${medalInfo.gradient} hover:shadow-lg mb-2`}
                    aria-label={t("common.loginToVote")}
                    onClick={() => {
                      localStorage.setItem('redirectAfterAuth', window.location.href);
                      window.location.href = '/auth';
                    }}
                  >
                    <ChevronUp className="h-6 w-6" />
                  </Button>
                </motion.div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Inicia sesión
                </span>
              </motion.div>
            )}
            
            {/* Contador de votos con animación */}
            <motion.div 
              className="mt-2 text-center"
              animate={isSuccessVote ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="text-2xl font-bold dark:text-white">
                {idea.votes}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {idea.votes === 1 ? "voto" : "votos"}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Botón de votación móvil */}
        <div className="md:hidden p-4 pt-0">
          {isLoggedIn ? (
            isVoted ? (
              <Button 
                disabled
                className="w-full bg-green-500 hover:bg-green-500 text-white"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Ya votaste ({idea.votes} votos)
              </Button>
            ) : (
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleVoteClick}
                  disabled={isVoting || isSuccessVote}
                  className={`w-full text-white transition-all duration-300 ${
                    isSuccessVote 
                      ? "bg-green-500 hover:bg-green-500" 
                      : `${medalInfo.gradient} hover:shadow-lg`
                  }`}
                >
                  {isVoting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Votando...
                    </>
                  ) : isSuccessVote ? (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2 animate-bounce" />
                      ¡Votado! ({idea.votes} votos)
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Votar ({idea.votes} votos)
                    </>
                  )}
                </Button>
              </motion.div>
            )
          ) : (
            <Button
              className={`w-full text-white ${medalInfo.gradient}`}
              onClick={() => {
                localStorage.setItem('redirectAfterAuth', window.location.href);
                window.location.href = '/auth';
              }}
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Inicia sesión para votar ({idea.votes} votos)
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}