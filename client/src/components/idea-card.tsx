import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Pencil,
  Trash2,
  ThumbsUp,
  Loader2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

interface IdeaCardProps {
  idea: IdeaResponse;
  onVote: (ideaId: number) => void;
  onEdit?: (idea: IdeaResponse) => void;
  onDelete?: (ideaId: number) => void;
  isVoting: boolean;
}

export default function IdeaCard({
  idea,
  onVote,
  onEdit,
  onDelete,
  isVoting,
}: IdeaCardProps) {
  // Check if user has already voted for this idea
  const [hasVoted, setHasVoted] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  // Función para determinar el gradiente basado en el ID
  const getGradientClass = (id: number) => {
    const gradients = [
      "bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10",
      "bg-gradient-to-r from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10",
      "bg-gradient-to-r from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10",
    ];
    return gradients[id % 3];
  };

  // Verificar si el usuario actual es el creador de la idea
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

  // Estado para controlar las animaciones
  const [isVoteAnimating, setIsVoteAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // When successfully voting, update localStorage with user-specific key
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

        // Activar animaciones
        setIsVoteAnimating(true);
        setShowConfetti(true);

        // Desactivar animaciones después de un tiempo
        setTimeout(() => setIsVoteAnimating(false), 600);
        setTimeout(() => setShowConfetti(false), 1000);
      }
    }
  };

  // Determine position indicator style and icon
  const getPositionIndicator = () => {
    const { current, previous, change } = idea.position;

    // Si no hay posición previa, es una idea nueva
    if (previous === null) {
      return {
        className:
          "bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300",
        icon: <Plus className="w-3 h-3 mr-1" />,
        text: t("badges.new"),
      };
    }

    // Si el cambio es positivo (subió de posición)
    if (change !== null && change > 0) {
      return {
        className:
          "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        icon: <ArrowUp className="w-3 h-3 mr-1" />,
        text: t("badges.up", { change }),
      };
    }

    // Si el cambio es negativo (bajó de posición)
    if (change !== null && change < 0) {
      return {
        className:
          "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        icon: <ArrowDown className="w-3 h-3 mr-1" />,
        text: t("badges.down", { change: Math.abs(change) }),
      };
    }

    // Si no cambió de posición o el cambio es 0
    return {
      className: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
      icon: <Minus className="w-3 h-3 mr-1" />,
      text: t("badges.same"),
    };
  };

  const position = getPositionIndicator();

  // Definición de animaciones
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      y: -3,
      scale: 1.01,
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.2,
      },
    },
    tap: { scale: 0.99 },
  };

  const positionBadgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const iconVariants = {
    hover: { rotate: 10, scale: 1.1 },
    tap: { rotate: 0, scale: 1 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      className="relative"
    >
      {/* Confetti animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full h-2 w-2 opacity-80 ${
                  [
                    "bg-primary",
                    "bg-blue-400",
                    "bg-green-400",
                    "bg-yellow-400",
                    "bg-pink-400",
                  ][i % 5]
                }`}
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() * 60 - 30)}%`,
                  y: `${50 + (Math.random() * 60 - 30)}%`,
                  scale: [0, 1, 0.5],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.2,
                  ease: [0.23, 1, 0.32, 1],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card
        className={`idea-card overflow-hidden dark:bg-gray-800 dark:border-gray-700 ${getGradientClass(
          idea.id
        )} h-full flex flex-col`}
      >
        <CardContent className="p-4 sm:p-6 flex flex-col h-full min-h-[200px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-white leading-tight pr-2 line-clamp-2">
              {idea.title}
            </h3>
            <motion.span
              variants={positionBadgeVariants}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold self-start flex-shrink-0 ${position.className}`}
            >
              {position.icon}
              {position.text}
            </motion.span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-3 flex-grow">
            {idea.description}
          </p>

          {/* Mostrar badge si la idea fue sugerida por otro usuario */}
          {idea.suggestedByUsername && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <User className="h-3 w-3" />
              {t("ideas.suggestedBy")}:{" "}
              <span className="font-medium">{idea.suggestedByUsername}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 mt-auto">
            <div className="flex items-center">
              {/* Solo mostrar el botón de voto cuando NO estamos en el dashboard del creador y no es el creador de la idea */}
              {!onEdit &&
                !onDelete &&
                !isCreator &&
                (user ? (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800 min-w-[80px] text-sm transition-all duration-200 ${
                      hasVoted
                        ? "bg-neutral-100 dark:bg-gray-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                        : "bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/70"
                    }`}
                    onClick={handleVote}
                    disabled={hasVoted || isVoting}
                  >
                    {isVoting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        <span>{t("common.voting")}</span>
                      </span>
                    ) : (
                      <>
                        <motion.div variants={iconVariants}>
                          <ThumbsUp className="w-4 h-4 mr-1" />
                        </motion.div>
                        {hasVoted ? t("common.voted") : t("common.vote")}
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800 min-w-[80px] text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 border border-blue-200 dark:border-blue-700 transition-all duration-200"
                    onClick={() => {
                      // Store the current page for redirect after login
                      localStorage.setItem(
                        "redirectAfterAuth",
                        window.location.href
                      );
                      window.location.href = "/auth";
                    }}
                  >
                    <motion.div variants={iconVariants}>
                      <ThumbsUp className="w-4 h-4 mr-1" />
                    </motion.div>
                    {t("common.loginToVote")}
                  </motion.button>
                ))}
              <motion.span
                className={`${
                  !onEdit && !onDelete ? "ml-2" : ""
                } text-sm font-semibold transition-colors duration-200 ${
                  isVoteAnimating
                    ? "text-primary dark:text-primary-400"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
                animate={
                  isVoteAnimating
                    ? {
                        scale: [1, 1.4, 1.2],
                        y: [0, -10, 0],
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                          duration: 0.6,
                        },
                      }
                    : {}
                }
                key={`${idea.id}-${idea.votes}`} // Para que se anime cuando cambia el número de votos
              >
                {idea.votes}{" "}
                {idea.votes === 1 ? t("badges.vote") : t("badges.votes")}
              </motion.span>
            </div>

            {/* Edit and Delete actions for creators */}
            {(onEdit || onDelete) && (
              <div className="flex space-x-2 justify-end sm:justify-start">
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(idea)}
                    className="p-2 text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="Edit idea"
                  >
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(idea.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 rounded-md hover:bg-neutral-100 dark:hover:bg-gray-700 transition-all duration-200"
                    aria-label="Delete idea"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
