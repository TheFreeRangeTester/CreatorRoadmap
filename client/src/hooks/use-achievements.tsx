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
  totalPoints: number; // Nuevo campo para almacenar los puntos totales
  unlockedAchievements: AchievementType[]; // Array de logros desbloqueados
}

// Interfaz para el contexto
interface AchievementsContextValue {
  currentAchievement: AchievementType | null;
  showAnimation: boolean;
  stats: UserStats;
  message?: string;
  showAchievement: (type: AchievementType, message?: string) => void;
  hideAchievement: () => void;
  registerVote: (ideaId: number) => void;
  registerLogin: () => void;
  resetAchievements: () => void; // Nueva función para resetear logros
}

// Crear el contexto
const AchievementsContext = createContext<AchievementsContextValue | undefined>(undefined);

// Proveedor de contexto
export const AchievementsProvider = ({ children }: { children: ReactNode }) => {
  // Estados para gestionar los logros
  const [currentAchievement, setCurrentAchievement] = useState<AchievementType | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  
  // Cargar estadísticas desde localStorage
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedStats = localStorage.getItem('userStats');
        return savedStats 
          ? JSON.parse(savedStats)
          : {
              totalVotes: 0,
              suggestedIdeas: 0,
              loginStreak: 0,
              lastLoginDate: null,
              votedTopIdeas: 0,
              votedIds: [],
              totalPoints: 0,
              unlockedAchievements: []
            };
      } catch (error) {
        console.error("Error loading stats from localStorage:", error);
        return {
          totalVotes: 0,
          suggestedIdeas: 0,
          loginStreak: 0,
          lastLoginDate: null,
          votedTopIdeas: 0,
          votedIds: [],
          totalPoints: 0,
          unlockedAchievements: []
        };
      }
    }
    
    return {
      totalVotes: 0,
      suggestedIdeas: 0,
      loginStreak: 0,
      lastLoginDate: null,
      votedTopIdeas: 0,
      votedIds: [],
      totalPoints: 0,
      unlockedAchievements: []
    };
  });

  // Función para mostrar un logro
  const showAchievement = useCallback((type: AchievementType, msg?: string) => {
    console.log(`Mostrando logro: ${type} - mensaje: ${msg}`);
    
    // Definir los puntos asociados con cada tipo de logro
    const achievementPoints: {[key in AchievementType]: number} = {
      [AchievementType.FIRST_VOTE]: 5,
      [AchievementType.TEN_VOTES]: 10,
      [AchievementType.FIFTY_VOTES]: 50,
      [AchievementType.VOTED_TOP_IDEA]: 15,
      [AchievementType.SUGGESTED_IDEA]: 20,
      [AchievementType.STREAK_VOTES]: 25
    };
    
    // Actualizar las estadísticas para incluir los puntos y el logro desbloqueado
    setStats(prev => {
      // Si el logro ya está desbloqueado, no sumar puntos nuevamente
      if (prev.unlockedAchievements?.includes(type)) {
        return prev;
      }
      
      const pointsToAdd = achievementPoints[type] || 0;
      const updatedAchievements = [...(prev.unlockedAchievements || []), type];
      const totalPoints = (prev.totalPoints || 0) + pointsToAdd;
      
      const newStats: UserStats = {
        ...prev,
        totalPoints,
        unlockedAchievements: updatedAchievements
      };
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userStats', JSON.stringify(newStats));
      }
      
      return newStats;
    });
    
    setCurrentAchievement(type);
    setMessage(msg);
    setShowAnimation(true);
  }, []);

  // Función para ocultar la animación
  const hideAchievement = useCallback(() => {
    console.log("Ocultando animación de logro");
    setShowAnimation(false);
  }, []);

  // Registrar un voto
  const registerVote = useCallback((ideaId: number) => {
    console.log(`Registrando voto para idea ${ideaId}`);
    
    setStats(prev => {
      // Verificar si ya ha votado por esta idea
      if (prev.votedIds.includes(ideaId)) {
        return prev;
      }

      // Actualizar estadísticas
      const totalVotes = prev.totalVotes + 1;
      const newStats: UserStats = {
        ...prev,
        totalVotes,
        votedIds: [...prev.votedIds, ideaId]
      };

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userStats', JSON.stringify(newStats));
      }
      
      // Comprobar si hemos alcanzado algún hito
      // Primer voto
      if (totalVotes === 1) {
        setTimeout(() => {
          showAchievement(AchievementType.FIRST_VOTE, 
            '¡Has emitido tu primer voto! +5 puntos');
        }, 500);
      }
      // 10 votos
      else if (totalVotes === 10) {
        setTimeout(() => {
          showAchievement(AchievementType.TEN_VOTES, 
            '¡Has alcanzado 10 votos! +10 puntos');
        }, 500);
      }
      // 50 votos
      else if (totalVotes === 50) {
        setTimeout(() => {
          showAchievement(AchievementType.FIFTY_VOTES, 
            '¡Increíble! Has alcanzado 50 votos. +50 puntos');
        }, 500);
      }

      return newStats;
    });
  }, [showAchievement]);

  // Registrar inicio de sesión (para mantener el streak)
  const registerLogin = useCallback(() => {
    console.log("Registrando inicio de sesión");
    
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    setStats(prev => {
      // Si ya inició sesión hoy, no hacer nada
      if (prev.lastLoginDate === today) {
        return prev;
      }

      // Calcular si el inicio de sesión es consecutivo
      let newStreak = prev.loginStreak;
      const lastLogin = prev.lastLoginDate;
      
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
        ...prev,
        loginStreak: newStreak,
        lastLoginDate: today
      };

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userStats', JSON.stringify(newStats));
      }

      return newStats;
    });
  }, [showAchievement]);
  
  // Función para resetear todos los logros y estadísticas
  const resetAchievements = useCallback(() => {
    console.log("Reseteando todos los logros y estadísticas");
    
    // Estadísticas por defecto
    const defaultStats: UserStats = {
      totalVotes: 0,
      suggestedIdeas: 0,
      loginStreak: 0,
      lastLoginDate: null,
      votedTopIdeas: 0,
      votedIds: [],
      totalPoints: 0,
      unlockedAchievements: []
    };
    
    // Actualizar estado
    setStats(defaultStats);
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userStats');
      localStorage.removeItem('votedIdeas');
    }
    
    return defaultStats;
  }, []);

  const value = {
    currentAchievement,
    showAnimation,
    stats,
    message,
    showAchievement,
    hideAchievement,
    registerVote,
    registerLogin,
    resetAchievements
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  
  if (!context) {
    throw new Error('useAchievements debe ser usado dentro de un AchievementsProvider');
  }
  
  return context;
};