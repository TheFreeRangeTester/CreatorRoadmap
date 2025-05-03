import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AchievementType } from '../components/achievement-animation';

// Interfaz para la información del logro
interface AchievementState {
  currentAchievement: AchievementType | null;
  showAnimation: boolean;
  stats: UserStats;
}

// Interfaz para las estadísticas de usuario
interface UserStats {
  totalVotes: number;
  suggestedIdeas: number;
  loginStreak: number;
  lastLoginDate: string | null;
  votedTopIdeas: number;
  votedIds: number[];
}

// Crear contexto para los logros
const AchievementsContext = createContext<{
  showAchievement: (type: AchievementType, message?: string) => void;
  hideAchievement: () => void;
  registerVote: (ideaId: number, isTopIdea?: boolean) => void;
  registerSuggestedIdea: () => void;
  registerLogin: () => void;
  stats: UserStats;
  currentAchievement: AchievementType | null;
  showAnimation: boolean;
} | null>(null);

// Clave para almacenar estadísticas en localStorage
const USER_STATS_KEY = 'fanlist_user_stats';

// Proveedor para el contexto de logros
export function AchievementsProvider({ children }: { children: ReactNode }) {
  // Estado para los logros y animaciones
  const [state, setState] = useState<AchievementState>({
    currentAchievement: null,
    showAnimation: false,
    stats: {
      totalVotes: 0,
      suggestedIdeas: 0,
      loginStreak: 0,
      lastLoginDate: null,
      votedTopIdeas: 0,
      votedIds: []
    }
  });

  // Cargar estadísticas del usuario desde localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem(USER_STATS_KEY);
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setState(prev => ({ ...prev, stats: parsedStats }));
      } catch (error) {
        console.error('Error parsing user stats:', error);
      }
    }
  }, []);

  // Guardar estadísticas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(state.stats));
  }, [state.stats]);

  // Mostrar un logro
  const showAchievement = (type: AchievementType, message?: string) => {
    setState(prev => ({
      ...prev,
      currentAchievement: type,
      showAnimation: true,
      message
    }));
  };

  // Ocultar la animación del logro
  const hideAchievement = () => {
    setState(prev => ({
      ...prev,
      showAnimation: false
    }));
  };

  // Registrar un voto y otorgar logros si corresponde
  const registerVote = (ideaId: number, isTopIdea: boolean = false) => {
    setState(prev => {
      const newStats = { ...prev.stats };
      
      // Evitar contar el mismo voto más de una vez
      if (!newStats.votedIds.includes(ideaId)) {
        newStats.totalVotes += 1;
        newStats.votedIds = [...newStats.votedIds, ideaId];
        
        // Si es una idea del top, actualizar contador
        if (isTopIdea) {
          newStats.votedTopIdeas += 1;
        }
        
        // Mostrar logros según los hitos alcanzados
        if (newStats.totalVotes === 1) {
          // Primer voto
          setTimeout(() => showAchievement(AchievementType.FIRST_VOTE), 500);
        } else if (newStats.totalVotes === 5) {
          // Múltiples votos
          setTimeout(() => showAchievement(AchievementType.MULTIPLE_VOTES), 500);
        }
        
        // Logro por votar idea del top
        if (isTopIdea && newStats.votedTopIdeas === 1) {
          setTimeout(() => showAchievement(AchievementType.VOTED_TOP_IDEA), 800);
        }
      }
      
      return { ...prev, stats: newStats };
    });
  };

  // Registrar una sugerencia de idea
  const registerSuggestedIdea = () => {
    setState(prev => {
      const newStats = { ...prev.stats };
      newStats.suggestedIdeas += 1;
      
      // Mostrar logro por sugerir idea
      if (newStats.suggestedIdeas === 1) {
        setTimeout(() => showAchievement(AchievementType.SUGGESTED_IDEA), 500);
      }
      
      return { ...prev, stats: newStats };
    });
  };

  // Registrar un inicio de sesión y actualizar racha
  const registerLogin = () => {
    setState(prev => {
      const newStats = { ...prev.stats };
      const today = new Date().toISOString().split('T')[0];
      
      // Si es la primera vez que inicia sesión o es un día diferente al último
      if (!newStats.lastLoginDate || newStats.lastLoginDate !== today) {
        const lastDate = newStats.lastLoginDate 
          ? new Date(newStats.lastLoginDate) 
          : null;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Comprobar si el último inicio de sesión fue ayer para actualizar racha
        if (lastDate && newStats.lastLoginDate === yesterdayStr) {
          newStats.loginStreak += 1;
          
          // Logro por racha de inicios de sesión
          if (newStats.loginStreak === 3) {
            setTimeout(() => showAchievement(AchievementType.STREAK_VOTES), 500);
          } else if (newStats.loginStreak === 7) {
            setTimeout(() => showAchievement(AchievementType.TOP_SUPPORTER), 500);
          }
        } else if (lastDate && newStats.lastLoginDate !== yesterdayStr) {
          // Reiniciar racha si no inició sesión ayer
          newStats.loginStreak = 1;
        } else {
          // Primer inicio de sesión
          newStats.loginStreak = 1;
        }
        
        newStats.lastLoginDate = today;
      }
      
      return { ...prev, stats: newStats };
    });
  };

  // Valor de contexto para proporcionar a los componentes
  const value = {
    showAchievement,
    hideAchievement,
    registerVote,
    registerSuggestedIdea,
    registerLogin,
    stats: state.stats,
    currentAchievement: state.currentAchievement,
    showAnimation: state.showAnimation
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

// Hook personalizado para usar el contexto de logros
export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements debe usarse dentro de un AchievementsProvider');
  }
  return context;
}