import { useEffect } from "react";
import AchievementAnimation, { AchievementType } from "./achievement-animation";
import { useAchievements } from "@/hooks/use-achievements";

// Componente que muestra las animaciones de logros
export default function AchievementsContainer() {
  const achievements = useAchievements();
  const { 
    currentAchievement, 
    showAnimation, 
    hideAchievement, 
    registerLogin,
    message,
    showAchievement
  } = achievements;

  // Registrar inicio de sesión cuando se carga el componente
  useEffect(() => {
    console.log("AchievementsContainer montado");
    registerLogin();
    
    // Limpiar cuando se desmonte el componente
    return () => {
      console.log("AchievementsContainer desmontado");
    };
  }, [registerLogin]);

  // Mostrar estado de la animación para debug
  useEffect(() => {
    if (currentAchievement && showAnimation) {
      console.log(`Mostrando animación para logro: ${currentAchievement}`);
    }
  }, [currentAchievement, showAnimation]);

  // Si no hay logro actual o no se debe mostrar, no renderizar nada
  if (!currentAchievement || !showAnimation) {
    return null;
  }

  return (
    <AchievementAnimation
      type={currentAchievement}
      show={showAnimation}
      onComplete={hideAchievement}
      message={message}
    />
  );
}