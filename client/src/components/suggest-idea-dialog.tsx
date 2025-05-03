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
  
  // Estado para el modal inline
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Función para abrir el modal
  const handleOpenModal = () => {
    if (!user) {
      toast({
        title: t('suggestIdea.loginRequired'),
        description: t('suggestIdea.loginRequiredDesc'),
        variant: "destructive",
      });
      return;
    }
    
    setShowModal(true);
  };
  
  // Función para manejar el envío del formulario directamente con fetch
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Obtenemos los valores del formulario directamente del evento
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    // Validación básica
    if (title.trim().length < 3 || description.trim().length < 10) {
      toast({
        title: t('suggestIdea.invalidFields'),
        description: t('suggestIdea.invalidFieldsDesc'),
        variant: "destructive",
      });
      return;
    }
    
    // Mostrar estado de carga
    setIsSubmitting(true);
    
    // Convertimos a JSON para la API
    const data = { title, description };
    
    // Usar fetch directamente para mejor compatibilidad y depuración
    fetch(`/api/creators/${username}/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include' // Para cookies de sesión
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || t('suggestIdea.errorDesc'));
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
          t('achievements.suggestedIdea', `Tu idea ha sido enviada a @${username}`));
        
        // Mostrar mensaje de éxito
        toast({
          title: t('suggestIdea.thankYou'),
          description: t('suggestIdea.thankYouDesc'),
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
        });
        
        // Refrescar ideas
        refetch();
      })
      .catch(error => {
        console.error("Error al enviar sugerencia:", error);
        toast({
          title: t('suggestIdea.error'),
          description: error.message || t('suggestIdea.errorDesc'),
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  return (
    <>
      <Button 
        variant={fullWidth ? "secondary" : "outline"}
        className={`
          ${fullWidth ? 'w-full shadow-sm flex items-center gap-2' : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'}
        `}
        onClick={handleOpenModal}
      >
        <Lightbulb className="h-4 w-4" />
        <span>{t('suggestIdea.button')}</span>
      </Button>
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo oscuro */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => !isSubmitting && setShowModal(false)}
          ></div>
          
          {/* Modal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 z-10">
            {/* Encabezado */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                {t('suggestIdea.title', {username})}
              </h2>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Formulario HTML normal */}
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <div className="space-y-4">
                  {/* Campo de título */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      {t('suggestIdea.titleLabel')}
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder={t('suggestIdea.titlePlaceholder')}
                      minLength={3}
                      maxLength={100}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Campo de descripción */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      {t('suggestIdea.descriptionLabel')}
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      rows={4}
                      placeholder={t('suggestIdea.descriptionPlaceholder')}
                      minLength={10}
                      maxLength={500}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              
              {/* Pie */}
              <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => !isSubmitting && setShowModal(false)}
                  disabled={isSubmitting}
                >
                  {t('suggestIdea.cancel')}
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('suggestIdea.sending')}
                    </>
                  ) : (
                    t('suggestIdea.submit')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}