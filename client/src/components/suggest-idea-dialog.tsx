import React, { useState } from "react";
import { Lightbulb, Loader2, X } from "lucide-react";
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
  
  // Estado básico
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Restablecer el formulario
  const resetForm = () => {
    setTitle("");
    setDescription("");
  };
  
  // Abrir modal
  const handleOpen = () => {
    if (!user) {
      toast({
        title: "Iniciar sesión requerido",
        description: "Debes iniciar sesión para sugerir ideas",
        variant: "destructive",
      });
      return;
    }
    resetForm();
    setShowModal(true);
  };
  
  // Cerrar modal
  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
    }
  };
  
  // Manejar el envío
  const handleSubmit = () => {
    // Validación simple
    if (title.trim().length < 3 || description.trim().length < 10) {
      toast({
        title: "Datos incompletos",
        description: "El título debe tener al menos 3 caracteres y la descripción al menos 10.",
        variant: "destructive",
      });
      return;
    }
    
    // Activar estado de envío
    setIsSubmitting(true);
    console.log("Enviando idea:", { title, description });
    
    // Solicitud simple pero directa
    fetch(`/api/creators/${username}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
      credentials: "include"
    })
      .then(response => {
        // Manejo básico de errores
        if (!response.ok) {
          response.text().then(text => {
            console.error("Error del servidor:", text);
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Idea sugerida con éxito:", data);
        
        // Cerrar modal
        setShowModal(false);
        
        // Mostrar logro
        showAchievement(AchievementType.SUGGESTED_IDEA, 
          `Tu idea ha sido enviada a @${username}`);
        
        // Mensaje de éxito
        toast({
          title: "¡Gracias por tu idea!",
          description: "Tu sugerencia ha sido enviada y está pendiente de revisión.",
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
        });
        
        // Recargar datos
        refetch();
      })
      .catch(error => {
        console.error("Error al enviar la idea:", error);
        toast({
          title: "Error al enviar idea",
          description: error.message || "Hubo un problema al enviar tu idea. Inténtalo de nuevo.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  return (
    <>
      {/* Botón para abrir el modal */}
      <Button 
        variant={fullWidth ? "secondary" : "outline"}
        className={fullWidth 
          ? 'w-full shadow-sm flex items-center gap-2' 
          : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'
        }
        onClick={handleOpen}
      >
        <Lightbulb className="h-4 w-4" />
        <span>Sugerir idea</span>
      </Button>
      
      {/* Modal de sugerencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* Contenedor principal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Cabecera */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                Sugerir idea para @{username}
              </h3>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Cuerpo */}
            <div className="p-4">
              {/* Título */}
              <div className="mb-4">
                <label htmlFor="idea-title" className="block text-sm font-medium mb-1">
                  Título
                </label>
                <input
                  id="idea-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título breve y descriptivo"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Descripción */}
              <div className="mb-4">
                <label htmlFor="idea-description" className="block text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  id="idea-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu idea con más detalle"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Pie */}
            <div className="flex justify-end p-4 border-t dark:border-gray-700 gap-2">
              {/* Botón Cancelar */}
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              
              {/* Botón Enviar */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}