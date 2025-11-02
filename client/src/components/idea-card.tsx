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
  Heart,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { ModernIcon, IconBadge } from "@/components/modern-icon";

interface IdeaCardProps {
  idea: IdeaResponse;
  onVote: (ideaId: number) => void;
  onEdit?: (idea: IdeaResponse) => void;
  onDelete?: (ideaId: number) => void;
  onOpenTemplate?: (idea: IdeaResponse) => void;
  isVoting: boolean;
}

export default function IdeaCard({
  idea,
  onVote,
  onEdit,
  onDelete,
  onOpenTemplate,
  isVoting,
}: IdeaCardProps) {
  // Check if user has already voted for this idea
  const [hasVoted, setHasVoted] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  // Simplified background - no more gradients for cleaner look
  const getCardClass = () => {
    return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700";
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

  // Definición de animaciones más sutiles
  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      y: -1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.2,
      },
    },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
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
      scale: 1.02,
      transition: { duration: 0.15 },
    },
    tap: { scale: 0.98 },
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
        className={`idea-card overflow-hidden ${getCardClass()} h-full flex flex-col rounded-md shadow-sm hover:shadow-md transition-all duration-300`}
      >
        <CardContent className="p-6 sm:p-8 flex flex-col h-full min-h-[180px] text-center">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-heading font-semibold text-neutral-800 dark:text-white leading-tight line-clamp-2 contained-text px-2">
              {idea.title}
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed mb-3 sm:mb-4 line-clamp-3 flex-grow contained-text px-2">
            {idea.description}
          </p>

          {/* Mostrar nicho si existe */}
          {idea.niche && (
            <div
              className="mb-3 flex justify-center"
              data-testid={`niche-badge-${idea.id}`}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 border border-primary/20 dark:border-primary/30">
                {t(`ideaForm.niches.${idea.niche}`, idea.niche)}
              </span>
            </div>
          )}

          {/* Mostrar badge si la idea fue sugerida por otro usuario */}
          {idea.suggestedByUsername && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex justify-center">
              <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-none">
                <User className="h-3 w-3" />
                {t("ideas.suggestedBy")}:{" "}
                <span className="font-medium">{idea.suggestedByUsername}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center space-y-3 mt-auto">
            <div className="flex justify-center">
              {/* Solo mostrar el botón de voto cuando NO estamos en el dashboard del creador y no es el creador de la idea */}
              {!onEdit &&
                !onDelete &&
                !isCreator &&
                (user ? (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 dark:focus:ring-offset-gray-800 min-w-[80px] text-xs sm:text-sm font-medium ${
                      hasVoted
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                    onClick={handleVote}
                    disabled={hasVoted || isVoting}
                  >
                    {isVoting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                        <span className="text-primary">
                          {t("common.voting")}
                        </span>
                      </span>
                    ) : (
                      <>
                        <IconBadge
                          icon={hasVoted ? Heart : ThumbsUp}
                          size="sm"
                          gradient={
                            hasVoted
                              ? "from-gray-400 to-gray-500"
                              : "from-primary to-primary/80"
                          }
                          className="mr-2"
                        />
                        <span
                          className={
                            hasVoted
                              ? "text-gray-500"
                              : "text-primary font-semibold"
                          }
                        >
                          {hasVoted ? t("common.voted") : t("common.vote")}
                        </span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 dark:focus:ring-offset-gray-800 min-w-[100px] text-xs sm:text-sm font-medium transition-all duration-200"
                    onClick={() => {
                      // Store the current page for redirect after login
                      localStorage.setItem(
                        "redirectAfterAuth",
                        window.location.href
                      );
                      window.location.href = "/auth";
                    }}
                  >
                    <IconBadge
                      icon={TrendingUp}
                      size="sm"
                      gradient="from-blue-500 to-blue-600"
                      className="mr-2"
                    />
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {t("common.loginToVote")}
                    </span>
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

            {/* Edit, Delete, and Template actions for creators */}
            {(onEdit || onDelete || onOpenTemplate) && (
              <div className="flex space-x-2 justify-center">
                {onOpenTemplate && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onOpenTemplate(idea)}
                    className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    aria-label="Open video template"
                    data-testid={`button-template-${idea.id}`}
                  >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
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

          {/* Badge de posición en la parte inferior */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex justify-center">
              <motion.span
                variants={positionBadgeVariants}
                className={`inline-flex items-center px-2 py-1 rounded-none text-xs font-semibold ${position.className}`}
              >
                {position.icon}
                {position.text}
              </motion.span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
