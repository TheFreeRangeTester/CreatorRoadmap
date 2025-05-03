import React, { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementType } from "@/components/achievement-animation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  
  const openSuggestPage = () => {
    if (!user) {
      toast({
        title: t('suggestIdea.loginRequired'),
        description: t('suggestIdea.loginRequiredDesc'),
        variant: "destructive",
      });
      return;
    }
    
    // Guardar los datos del usuario y creador en localStorage
    localStorage.setItem('suggestIdea_username', username);
    
    // Redirigir a una página simple para sugerir ideas
    window.open('/suggest-idea.html', '_blank');
  };
  
  // Escuchamos mensajes del popup
  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Verificar origen (en producción debes restringir esto)
      if (event.data && event.data.type === 'IDEA_SUGGESTED') {
        console.log('Idea sugerida:', event.data.data);
        
        // Mostrar logro
        showAchievement(AchievementType.SUGGESTED_IDEA, 
          t('achievements.suggestedIdea', 'Tu idea ha sido enviada a @' + username));
        
        // Mostrar mensaje de éxito
        toast({
          title: t('suggestIdea.thankYou'),
          description: t('suggestIdea.thankYouDesc'),
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
        });
        
        // Refrescar la página
        refetch();
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [showAchievement, toast, t, username, refetch]);
  
  return (
    <Button 
      variant={fullWidth ? "secondary" : "outline"}
      className={`
        ${fullWidth ? 'w-full shadow-sm flex items-center gap-2' : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'}
      `}
      onClick={openSuggestPage}
    >
      <Lightbulb className="h-4 w-4" />
      <span>{t('suggestIdea.button')}</span>
    </Button>
  );
}