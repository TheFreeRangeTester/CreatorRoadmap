import React, { useState, useRef } from 'react';
import { Lightbulb, MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useAchievements } from '@/hooks/use-achievements';
import { AchievementType } from '@/components/achievement-animation';
import { Button } from '@/components/ui/button';

// Props simples
interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

// Versión súper simplificada
const SuggestIdeaDialog = ({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) => {
  // Estado y referencias básicas
  const [popup, setPopup] = useState<Window | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { showAchievement } = useAchievements();
  const randomId = useRef(Math.floor(Math.random() * 1000000));
  
  // Función para manejar mensajes de la ventana emergente
  const handleMessage = (event: MessageEvent) => {
    // Verificar origen (en producción restrictible)
    if (event.data?.type === "IDEA_SUGGESTED" && event.data?.id === randomId.current) {
      console.log("Idea sugerida recibida:", event.data);
      
      // Mostrar notificación
      toast({
        title: "¡Gracias por tu idea!",
        description: "Tu sugerencia ha sido enviada para revisión",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
      
      // Mostrar logro
      showAchievement(AchievementType.SUGGESTED_IDEA, `Tu idea ha sido enviada a @${username}`);
      
      // Refrescar datos
      refetch();
      
      // Cerrar la ventana emergente si aún está abierta
      if (popup && !popup.closed) {
        popup.close();
      }
    }
  };
  
  // Agregar/remover el evento de mensaje
  React.useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Función para abrir la ventana de sugerir idea
  const openSuggestWindow = () => {
    // Verificar si el usuario está autenticado
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Debes iniciar sesión para sugerir ideas",
        variant: "destructive",
      });
      return;
    }
    
    // Crear una URL para la página HTML
    const suggestUrl = new URL('/suggest.html', window.location.origin);
    suggestUrl.searchParams.append('username', username);
    suggestUrl.searchParams.append('id', randomId.current.toString());
    
    // Abrir ventana emergente
    const newPopup = window.open(
      suggestUrl.toString(),
      "SuggestIdea",
      "width=500,height=600,resizable=yes,scrollbars=yes"
    );
    
    // Guardar referencia
    setPopup(newPopup);
    
    // Mostrar mensaje si fue bloqueado
    if (!newPopup || newPopup.closed || typeof newPopup.closed === 'undefined') {
      toast({
        title: "Ventana bloqueada",
        description: "Por favor, permite ventanas emergentes para esta función",
        variant: "destructive",
      });
    }
  };
  
  // Renderización simple de botón
  return (
    <Button
      variant={fullWidth ? "secondary" : "outline"}
      className={fullWidth 
        ? 'w-full shadow-sm flex items-center gap-2' 
        : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'
      }
      onClick={openSuggestWindow}
    >
      <Lightbulb className="h-4 w-4" />
      <span>Sugerir idea</span>
    </Button>
  );
};

export default SuggestIdeaDialog;