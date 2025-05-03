import { useEffect } from "react";
import AchievementAnimation from "./achievement-animation";
import { useAchievements } from "@/hooks/use-achievements";

// Componente que muestra las animaciones de logros
export default function AchievementsContainer() {
  const { 
    currentAchievement, 
    showAnimation, 
    hideAchievement, 
    registerLogin 
  } = useAchievements();

  // Registrar inicio de sesión cuando se carga el componente
  useEffect(() => {
    registerLogin();
  }, [registerLogin]);

  // Si no hay logro actual o no se debe mostrar, no renderizar nada
  if (!currentAchievement || !showAnimation) {
    return null;
  }

  return (
    <AchievementAnimation
      type={currentAchievement}
      show={showAnimation}
      onComplete={hideAchievement}
    />
  );
}