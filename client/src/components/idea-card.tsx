import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Minus, Plus, Pencil, Trash2, ThumbsUp, Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface IdeaCardProps {
  idea: IdeaResponse;
  onVote: (ideaId: number) => void;
  onEdit?: (idea: IdeaResponse) => void;
  onDelete?: (ideaId: number) => void;
  isVoting: boolean;
}

export default function IdeaCard({ idea, onVote, onEdit, onDelete, isVoting }: IdeaCardProps) {
  // Check if user has already voted for this idea
  const [hasVoted, setHasVoted] = useState(false);
  const { t } = useTranslation();
  
  // Load voting state from localStorage
  useEffect(() => {
    const votedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
    setHasVoted(votedIdeas.includes(idea.id));
    
    // If we receive an API error that says the user has already voted,
    // make sure we update our localStorage and UI accordingly
    const checkVoteStatus = async () => {
      try {
        const apiUrl = `/api/creators/${idea.creatorUsername}/ideas/${idea.id}/vote?check_only=true`;
        await fetch(apiUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // If we got here without error, user hasn't voted yet
      } catch (error) {
        // Check if error message indicates user already voted
        const errorMsg = error.toString();
        if (errorMsg.includes("already voted") || 
            errorMsg.includes("Ya has votado")) {
          // Update localStorage and state
          if (!votedIdeas.includes(idea.id)) {
            votedIdeas.push(idea.id);
            localStorage.setItem("votedIdeas", JSON.stringify(votedIdeas));
            setHasVoted(true);
          }
        }
      }
    };
    
    // Only run check if we're showing voting UI (not in creator dashboard)
    if (!onEdit && !onDelete) {
      checkVoteStatus();
    }
  }, [idea.id, idea.creatorUsername, onEdit, onDelete]);

  // Estado para controlar las animaciones
  const [isVoteAnimating, setIsVoteAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // When successfully voting, update localStorage
  const handleVote = () => {
    if (!hasVoted && !isVoting) {
      onVote(idea.id);
      
      // Optimistically update UI
      const votedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
      votedIdeas.push(idea.id);
      localStorage.setItem("votedIdeas", JSON.stringify(votedIdeas));
      setHasVoted(true);
      
      // Activar animaciones
      setIsVoteAnimating(true);
      setShowConfetti(true);
      
      // Desactivar animaciones después de un tiempo
      setTimeout(() => setIsVoteAnimating(false), 600);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  };

  // Determine position indicator style and icon
  const getPositionIndicator = () => {
    const { current, previous, change } = idea.position;
    
    // Si no hay posición previa, es una idea nueva
    if (previous === null) {
      return {
        className: "bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300",
        icon: <Plus className="w-3 h-3 mr-1" />,
        text: t('ideaPosition.new'),
      };
    } 
    
    // Si el cambio es positivo (subió de posición)
    if (change !== null && change > 0) {
      return {
        className: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        icon: <ArrowUp className="w-3 h-3 mr-1" />,
        text: t('badges.up') + ' ' + change.toString(),
      };
    } 
    
    // Si el cambio es negativo (bajó de posición)
    if (change !== null && change < 0) {
      return {
        className: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        icon: <ArrowDown className="w-3 h-3 mr-1" />,
        text: t('badges.down') + ' ' + Math.abs(change).toString(),
      };
    } 
    
    // Si no cambió de posición o el cambio es 0
    return {
      className: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
      icon: <Minus className="w-3 h-3 mr-1" />,
      text: t('ideaPosition.same'),
    };
  };

  const position = getPositionIndicator();

  // Definición de animaciones
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10
      }
    },
    tap: { scale: 0.98 }
  };

  const positionBadgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.1, duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const iconVariants = {
    hover: { rotate: 10, scale: 1.1 },
    tap: { rotate: 0, scale: 1 }
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
                  ['bg-primary', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400'][i % 5]
                }`}
                initial={{ 
                  x: "50%", 
                  y: "50%",
                  scale: 0
                }}
                animate={{ 
                  x: `${50 + (Math.random() * 60 - 30)}%`, 
                  y: `${50 + (Math.random() * 60 - 30)}%`,
                  scale: [0, 1, 0.5],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.2,
                  ease: [0.23, 1, 0.32, 1]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="idea-card overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">{idea.title}</h3>
            <motion.span 
              variants={positionBadgeVariants}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${position.className}`}
            >
              {position.icon}
              {position.text}
            </motion.span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">{idea.description}</p>
          
          {/* Mostrar badge si la idea fue sugerida por otro usuario */}
          <AnimatePresence>
            {idea.suggestedByUsername && (
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {t('ideaPosition.suggestedBy', { username: idea.suggestedByUsername })}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Solo mostrar el botón de voto cuando NO estamos en el dashboard del creador */}
              {!onEdit && !onDelete && (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex items-center px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800 min-w-[70px] ${
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
                      <span>{t('ideaPosition.voting')}</span>
                    </span>
                  ) : (
                    <>
                      <motion.div variants={iconVariants}>
                        <ThumbsUp className="w-4 h-4 mr-1" />
                      </motion.div>
                      {hasVoted ? t('ideaPosition.voted') : t('ideaPosition.vote')}
                    </>
                  )}
                </motion.button>
              )}
              <motion.span 
                className={`${!onEdit && !onDelete ? 'ml-2' : ''} text-sm font-semibold ${isVoteAnimating ? 'text-primary dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'}`}
                animate={isVoteAnimating ? 
                  { 
                    scale: [1, 1.4, 1.2],
                    y: [0, -10, 0],
                    transition: { 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 10,
                      duration: 0.6
                    }
                  } : {}
                }
                key={`${idea.id}-${idea.votes}`} // Para que se anime cuando cambia el número de votos
              >
                {idea.votes} {idea.votes === 1 ? t('badges.vote') : t('badges.votes')}
              </motion.span>
            </div>
            
            {/* Edit and Delete actions for creators */}
            {(onEdit || onDelete) && (
              <div className="flex space-x-1">
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(idea)}
                    className="p-1 text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300"
                    aria-label="Edit idea"
                  >
                    <Pencil className="w-5 h-5" />
                  </motion.button>
                )}
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(idea.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                    aria-label="Delete idea"
                  >
                    <Trash2 className="w-5 h-5" />
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
