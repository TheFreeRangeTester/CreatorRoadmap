import { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { AchievementType } from '@/components/achievement-animation';

// Interfaz para las estadísticas del usuario
interface UserStats {
  totalVotes: number;
  suggestedIdeas: number;
  loginStreak: number;
  lastLoginDate: string | null;
  votedTopIdeas: number;
  votedIds: number[];
}

// Interfaz para el estado de los logros
interface AchievementState {
  currentAchievement: AchievementType | null;
  showAnimation: boolean;
  stats: UserStats;
}

// Interfaz para el contexto
interface AchievementsContextType {
  currentAchievement: AchievementType | null;
  showAnimation: boolean;
  stats: UserStats;
  showAchievement: (type: AchievementType, message?: string) => void;
  hideAchievement: () => void;
  registerVote: (ideaId: number) => void;
  registerLogin: () => void;
}

// Crear el contexto
const AchievementsContext = createContext<AchievementsContextType | null>(null);

// Proveedor de contexto
export function AchievementsProvider({ children }: { children: ReactNode }) {
  // Estado inicial con las estadísticas cargadas desde localStorage
  const [state, setState] = useState<AchievementState>(() => {
    // Intentar cargar las estadísticas desde localStorage
    const savedStats = localStorage.getItem('userStats');
    const initialStats: UserStats = savedStats 
      ? JSON.parse(savedStats)
      : {
          totalVotes: 0,
          suggestedIdeas: 0,
          loginStreak: 0,
          lastLoginDate: null,
          votedTopIdeas: 0,
          votedIds: []
        };
    
    return {
      currentAchievement: null,
      showAnimation: false,
      stats: initialStats
    };
  });

  // Función para mostrar un logro
  const showAchievement = useCallback((type: AchievementType, message?: string) => {
    setState(prev => ({
      ...prev,
      currentAchievement: type,
      showAnimation: true,
      message
    }));
  }, []);

  // Función para ocultar la animación
  const hideAchievement = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAnimation: false
    }));
  }, []);

  // Registrar un voto
  const registerVote = useCallback((ideaId: number) => {
    setState(prev => {
      // Verificar si ya ha votado por esta idea
      if (prev.stats.votedIds.includes(ideaId)) {
        return prev;
      }

      // Actualizar estadísticas
      const newStats: UserStats = {
        ...prev.stats,
        totalVotes: prev.stats.totalVotes + 1,
        votedIds: [...prev.stats.votedIds, ideaId]
      };

      // Guardar en localStorage
      localStorage.setItem('userStats', JSON.stringify(newStats));

      return {
        ...prev,
        stats: newStats
      };
    });
  }, []);

  // Registrar inicio de sesión (para mantener el streak)
  const registerLogin = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    setState(prev => {
      // Si ya inició sesión hoy, no hacer nada
      if (prev.stats.lastLoginDate === today) {
        return prev;
      }

      // Calcular si el inicio de sesión es consecutivo
      let newStreak = prev.stats.loginStreak;
      const lastLogin = prev.stats.lastLoginDate;
      
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Verificar si el último inicio de sesión fue ayer
        if (lastDate.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)) {
          newStreak += 1;
          
          // Si alcanza un streak de 3 días, mostrar el logro
          if (newStreak === 3) {
            setTimeout(() => {
              showAchievement(AchievementType.STREAK_VOTES, 
                '¡Has iniciado sesión durante 3 días consecutivos!');
            }, 1000);
          }
        } else if (lastDate.toISOString().slice(0, 10) !== today) {
          // Si no fue ayer y no es hoy, reiniciar el streak
          newStreak = 1;
        }
      } else {
        // Primer inicio de sesión
        newStreak = 1;
      }

      const newStats: UserStats = {
        ...prev.stats,
        loginStreak: newStreak,
        lastLoginDate: today
      };

      // Guardar en localStorage
      localStorage.setItem('userStats', JSON.stringify(newStats));

      return {
        ...prev,
        stats: newStats
      };
    });
  }, [showAchievement]);

  // Valores del contexto
  const contextValue: AchievementsContextType = {
    currentAchievement: state.currentAchievement,
    showAnimation: state.showAnimation,
    stats: state.stats,
    showAchievement,
    hideAchievement,
    registerVote,
    registerLogin
  };

  return (
    <AchievementsContext.Provider value={contextValue}>
      {children}
    </AchievementsContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements debe ser usado dentro de un AchievementsProvider');
  }
  return context;
}