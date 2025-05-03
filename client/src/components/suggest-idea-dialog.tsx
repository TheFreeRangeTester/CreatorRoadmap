import React, { useState } from "react";
import { Lightbulb, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementType } from "@/components/achievement-animation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
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
    // Resetear los valores
    setTitle('');
    setDescription('');
    setTitleError('');
    setDescriptionError('');
  };
  
  // Función para validar el título
  const validateTitle = () => {
    if (title.trim().length < 3) {
      setTitleError(t('suggestIdea.titleMinLength', { defaultValue: "Title must be at least 3 characters" }));
      return false;
    }
    if (title.trim().length > 100) {
      setTitleError(t('suggestIdea.titleMaxLength', { defaultValue: "Title cannot exceed 100 characters" }));
      return false;
    }
    setTitleError('');
    return true;
  };
  
  // Función para validar la descripción
  const validateDescription = () => {
    if (description.trim().length < 10) {
      setDescriptionError(t('suggestIdea.descriptionMinLength', { defaultValue: "Description must be at least 10 characters" }));
      return false;
    }
    if (description.trim().length > 500) {
      setDescriptionError(t('suggestIdea.descriptionMaxLength', { defaultValue: "Description cannot exceed 500 characters" }));
      return false;
    }
    setDescriptionError('');
    return true;
  };
  
  // Función para enviar el formulario
  const handleSubmit = async () => {
    console.log("Intentando enviar idea");
    
    // Validar los campos
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    
    if (!isTitleValid || !isDescriptionValid) {
      return;
    }
    
    // Mostrar estado de carga
    setIsSubmitting(true);
    
    try {
      console.log(`Enviando sugerencia a ${username}`, { title, description });
      
      // Hacer la petición
      const response = await apiRequest(
        'POST',
        `/api/creators/${username}/suggest`,
        { title: title.trim(), description: description.trim() }
      );
      
      console.log("Respuesta de la API:", response);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('suggestIdea.errorDesc', { defaultValue: "Error sending suggestion" }));
      }
      
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
      
    } catch (error) {
      console.error("Error al enviar sugerencia:", error);
      toast({
        title: t('suggestIdea.error'),
        description: (error as Error).message || t('suggestIdea.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            
            {/* Cuerpo */}
            <div className="p-4">
              <div className="space-y-4">
                {/* Campo de título */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    {t('suggestIdea.titleLabel')}
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      titleError ? 'border-red-500' : ''
                    }`}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) validateTitle();
                    }}
                    placeholder={t('suggestIdea.titlePlaceholder')}
                    disabled={isSubmitting}
                  />
                  {titleError && (
                    <p className="mt-1 text-sm text-red-500">{titleError}</p>
                  )}
                </div>
                
                {/* Campo de descripción */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    {t('suggestIdea.descriptionLabel')}
                  </label>
                  <textarea
                    id="description"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      descriptionError ? 'border-red-500' : ''
                    }`}
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (descriptionError) validateDescription();
                    }}
                    placeholder={t('suggestIdea.descriptionPlaceholder')}
                    disabled={isSubmitting}
                  />
                  {descriptionError && (
                    <p className="mt-1 text-sm text-red-500">{descriptionError}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pie */}
            <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
              >
                {t('suggestIdea.cancel')}
              </Button>
              
              <Button
                onClick={handleSubmit}
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
          </div>
        </div>
      )}
    </>
  );
}