import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import {
  ChevronUp,
  Loader2,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
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
    niche?: string | null;
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
  isTopThree?: boolean;
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
  isTopThree = false,
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
          gradient:
            "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600",
          shadow: isTopThree
            ? "shadow-2xl shadow-yellow-500/70"
            : "shadow-yellow-500/50",
          glow: isTopThree
            ? "shadow-2xl shadow-yellow-400/60 ring-4 ring-yellow-400/30"
            : "shadow-2xl shadow-yellow-400/30",
          textColor: "text-yellow-900",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          border: isTopThree ? "border-4 border-yellow-400/60" : "",
        };
      case 2:
        return {
          emoji: "🥈",
          gradient: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
          shadow: isTopThree
            ? "shadow-2xl shadow-gray-500/70"
            : "shadow-gray-400/50",
          glow: isTopThree
            ? "shadow-2xl shadow-gray-400/60 ring-4 ring-gray-400/30"
            : "shadow-2xl shadow-gray-400/30",
          textColor: "text-gray-800",
          bgColor: "bg-gray-50 dark:bg-gray-800/20",
          border: isTopThree ? "border-4 border-gray-400/60" : "",
        };
      case 3:
        return {
          emoji: "🥉",
          gradient:
            "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700",
          shadow: isTopThree
            ? "shadow-2xl shadow-orange-500/70"
            : "shadow-orange-500/50",
          glow: isTopThree
            ? "shadow-2xl shadow-orange-400/60 ring-4 ring-orange-400/30"
            : "shadow-2xl shadow-orange-400/30",
          textColor: "text-orange-900",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          border: isTopThree ? "border-4 border-orange-400/60" : "",
        };
      default:
        return {
          emoji: null,
          gradient: `bg-gradient-to-r ${getColorGradient(rank)}`,
          shadow: "shadow-blue-400/30",
          glow: "shadow-lg shadow-blue-400/20",
          textColor: "text-blue-900",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          border: "",
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

  // Determinar tendencia con mejor visibilidad
  const getTrendIcon = () => {
    if (!idea.position) return null;
    const { change } = idea.position;

    if (change === null || change === 0) {
      return (
        <div className="bg-gray-500/20 rounded-full p-1.5">
          <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
      );
    } else if (change > 0) {
      return (
        <div className="bg-green-500/20 rounded-full p-1.5">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
      );
    } else {
      return (
        <div className="bg-red-500/20 rounded-full p-1.5">
          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
      );
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
      whileHover={{
        scale: isTopThree ? 1.05 : 1.02,
        y: isTopThree ? -4 : -2,
        rotateY: isTopThree ? 2 : 0,
      }}
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

      <Card
        className={`overflow-hidden ${medalInfo.border || "border-0"} ${medalInfo.shadow} hover:${medalInfo.glow} transition-all duration-500 ${medalInfo.bgColor} rounded-md glass-card ${
          isTopThree ? "transform-gpu relative animate-pulse-subtle" : ""
        } ${isTopThree ? "before:absolute before:inset-0 before:rounded-md before:p-1 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-white/20 before:-z-10" : ""}`}
      >
        <div className="flex flex-col">
          {/* Contenido principal centrado */}
          <div className={`flex-1 ${isTopThree ? "p-8" : "p-6"} text-center`}>
            {/* Indicador de posición con medallas en la parte superior */}
            <motion.div
              className={`inline-flex items-center justify-center ${
                isTopThree
                  ? "w-20 h-20 md:w-24 md:h-24"
                  : "w-16 h-16 md:w-18 md:h-18"
              } text-white font-bold relative ${medalInfo.gradient} rounded-full mb-4 mx-auto ${
                isTopThree
                  ? "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
                  : ""
              }`}
              whileHover={{
                scale: isTopThree ? 1.15 : 1.1,
                rotate: isTopThree ? [0, -5, 5, 0] : 0,
                transition: { duration: 0.3 },
              }}
              animate={
                isTopThree && isHovered
                  ? {
                      boxShadow: [
                        "0 0 20px rgba(255, 255, 255, 0.3)",
                        "0 0 40px rgba(255, 255, 255, 0.5)",
                        "0 0 20px rgba(255, 255, 255, 0.3)",
                      ],
                    }
                  : {}
              }
            >
              {/* Número de ranking */}
              <motion.span
                className={`${isTopThree ? "text-xl md:text-2xl" : "text-lg md:text-xl"} font-black`}
                animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                #{rank}
              </motion.span>

              {/* Medalla para top 3 - positioned absolutely */}
              {medalInfo.emoji && (
                <motion.span
                  className={`absolute -top-2 -right-2 ${isTopThree ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}
                  animate={
                    isSuccessVote
                      ? {
                          scale: [1, 1.3, 1],
                          rotate: [0, 15, -15, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                >
                  {medalInfo.emoji}
                </motion.span>
              )}
            </motion.div>

            {/* Badges de información en la parte superior */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              {/* Badge de nicho */}
              {idea.niche && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/20"
                >
                  {t(`ideaForm.niches.${idea.niche}`, idea.niche)}
                </Badge>
              )}

              {recentVotes24h > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                >
                  🔥{" "}
                  {t("common.recentVotesToday", "+{{count}} hoy", {
                    count: recentVotes24h,
                  })}
                </Badge>
              )}

              {/* Badge de cambio de posición */}
              {getTrendIcon()}

              {showVotePreview && votesToNextRank > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
                >
                  {votesToNextRank} {t("common.votesToNextRank")}
                </motion.div>
              )}
            </div>

            {/* Título centrado */}
            <h3
              className={`${
                isTopThree ? "text-base md:text-lg" : "text-sm md:text-base"
              } font-heading font-bold dark:text-white line-clamp-2 mb-3 contained-text leading-tight`}
            >
              {idea.title}
            </h3>

            {/* Descripción centrada */}
            <p
              className={`${
                isTopThree ? "text-sm md:text-base" : "text-xs md:text-sm"
              } text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed contained-text`}
            >
              {idea.description}
            </p>

            {/* Información de votación centrada */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <ThumbsUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium dark:text-white">
                {idea.votes} {t("common.votes")}
              </span>
            </div>

            {/* Botón de voto centrado */}
            {isLoggedIn ? (
              isVoted ? (
                <motion.div className="mb-4">
                  <Button
                    disabled
                    className="rounded-full w-12 h-12 text-white bg-green-500 hover:bg-green-500"
                    aria-label={t("common.voted", "Ya votado")}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleVoteClick}
                      disabled={isVoting || isSuccessVote}
                      className={`rounded-full w-12 h-12 text-white transition-all duration-300 ${
                        isSuccessVote
                          ? "bg-green-500 hover:bg-green-500"
                          : `${medalInfo.gradient} hover:shadow-lg`
                      }`}
                      aria-label={t("common.vote", "Votar")}
                    >
                      {isVoting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isSuccessVote ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                          transition={{ duration: 0.6 }}
                        >
                          <ThumbsUp className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={isHovered ? { y: -2 } : { y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronUp className="h-5 w-5" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )
            ) : (
              <motion.div className="mb-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`rounded-full w-12 h-12 text-white ${medalInfo.gradient} hover:shadow-lg`}
                    aria-label={t(
                      "common.loginToVote",
                      "Inicia sesión para votar"
                    )}
                    onClick={() => {
                      localStorage.setItem(
                        "redirectAfterAuth",
                        window.location.href
                      );
                      window.location.href = "/auth";
                    }}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
