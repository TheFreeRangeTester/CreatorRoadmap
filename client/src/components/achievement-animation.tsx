import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Heart, ThumbsUp, Award, Crown, Medal, Zap, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

// Tipos de logros que podemos mostrar
export enum AchievementType {
  FIRST_VOTE = 'first_vote',
  TEN_VOTES = 'ten_votes',
  FIFTY_VOTES = 'fifty_votes',
  VOTED_TOP_IDEA = 'voted_top_idea',
  SUGGESTED_IDEA = 'suggested_idea',
  STREAK_VOTES = 'streak_votes'
}

// Interfaces para props y configuración
interface AchievementAnimationProps {
  type: AchievementType;
  show: boolean;
  onComplete?: () => void;
  message?: string;
  points?: number;
}

interface AchievementConfig {
  icon: React.ReactNode;
  title: string;
  defaultMessage: string;
  color: string;
  bgColor: string;
  points: number;
  confetti: boolean;
}

// Configuraciones para cada tipo de logro
const achievementConfigs: Record<AchievementType, AchievementConfig> = {
  [AchievementType.FIRST_VOTE]: {
    icon: <Star className="h-6 w-6" />,
    title: '¡Primer voto!',
    defaultMessage: 'Has emitido tu primer voto. ¡Sigue participando!',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    points: 5,
    confetti: true
  },
  [AchievementType.TEN_VOTES]: {
    icon: <Award className="h-6 w-6" />,
    title: '¡10 Votos!',
    defaultMessage: 'Has emitido 10 votos. ¡Sigues avanzando!',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    points: 10,
    confetti: true
  },
  [AchievementType.FIFTY_VOTES]: {
    icon: <Crown className="h-6 w-6" />,
    title: '¡50 Votos!',
    defaultMessage: '¡Increíble! Has alcanzado 50 votos. Eres increíble.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    points: 50,
    confetti: true
  },
  [AchievementType.VOTED_TOP_IDEA]: {
    icon: <Trophy className="h-6 w-6" />,
    title: '¡Voto al Top!',
    defaultMessage: 'Has votado por una idea que está en el Top 3',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    points: 10,
    confetti: true
  },
  [AchievementType.SUGGESTED_IDEA]: {
    icon: <Zap className="h-6 w-6" />,
    title: '¡Ideas creativas!',
    defaultMessage: 'Tu sugerencia ha sido enviada al creador',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    points: 5,
    confetti: true
  },
  [AchievementType.STREAK_VOTES]: {
    icon: <Flame className="h-6 w-6" />,
    title: '¡En racha!',
    defaultMessage: 'Has votado durante varios días seguidos',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    points: 20,
    confetti: false
  }
};

// Componente principal de animación de logro
export default function AchievementAnimation({ 
  type, 
  show, 
  onComplete, 
  message,
  points
}: AchievementAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = achievementConfigs[type];

  // Manejar animación de confetti
  const triggerConfetti = () => {
    if (config.confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFC107', '#FF9800', '#FF5722']
      });
    }
  };

  // Efecto para manejar la visibilidad y el cierre automático
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      triggerConfetti();
      
      // Cerrar automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      // Llamar al callback onComplete después de que la animación se desvanezca
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            y: [0, -20, 0],
            transition: { 
              duration: 0.5,
              y: {
                duration: 0.5,
                repeat: 1,
                repeatType: "reverse"
              }
            }
          }}
          exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.3 } }}
        >
          <div className={`rounded-xl overflow-hidden shadow-lg ${config.bgColor} border border-white/30 backdrop-blur-md p-4 max-w-xs text-center`}>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 1 }}
              className="inline-block mb-2"
            >
              <div className={`${config.color} bg-white/10 p-3 rounded-full inline-block`}>
                {config.icon}
              </div>
            </motion.div>
            
            <h3 className={`font-bold text-lg mb-1 ${config.color}`}>{config.title}</h3>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {message || config.defaultMessage}
            </p>
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10,
                delay: 0.3 
              }}
              className="text-lg font-bold"
            >
              <span className={`${config.color} flex items-center justify-center gap-1`}>
                <Trophy className="h-4 w-4" /> 
                +{points || config.points} puntos
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}