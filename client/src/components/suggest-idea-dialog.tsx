import React, { useState, useEffect } from "react";
import { Lightbulb, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementType } from "@/components/achievement-animation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { z } from "zod";

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

// Esquema de validación para la idea
const ideaSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "La descripción no puede exceder 500 caracteres")
});

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  
  // Estado para el modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
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
    
    // Reiniciar el formulario
    setTitle("");
    setDescription("");
    setErrors({});
    setDebugInfo(null);
    setShowModal(true);
  };
  
  // Validar input
  const validateForm = () => {
    try {
      ideaSchema.parse({ title, description });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  // Manejar cambios en los campos
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) validateForm();
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (errors.description) validateForm();
  };
  
  // Función para manejar el envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado");
    
    // Validar antes de enviar
    if (!validateForm()) {
      console.error("Validación fallida", errors);
      return;
    }
    
    setIsSubmitting(true);
    setDebugInfo("Iniciando envío...");
    
    const data = { title, description };
    
    try {
      setDebugInfo(`Enviando petición a /api/creators/${username}/suggest`);
      
      const response = await fetch(`/api/creators/${username}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const responseText = await response.text();
      setDebugInfo(`Respuesta recibida: ${response.status}, Texto: ${responseText}`);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        setDebugInfo(`Error al parsear JSON: ${e}`);
        throw new Error(`La respuesta no es JSON válido: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || "Error al enviar la idea");
      }
      
      // Éxito
      console.log("Idea sugerida con éxito:", responseData);
      setDebugInfo(`Idea sugerida con éxito: ${JSON.stringify(responseData)}`);
      
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
      await refetch();
      
    } catch (error) {
      console.error("Error al enviar sugerencia:", error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: t('suggestIdea.error'),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Botón directo para debug (solo en desarrollo)
  const handleDebugSubmit = async () => {
    try {
      const testData = { 
        title: "Test idea " + new Date().toISOString(),
        description: "This is a test idea created for debugging purposes " + Math.random()
      };
      
      setDebugInfo(`Enviando petición de prueba con: ${JSON.stringify(testData)}`);
      
      const response = await fetch(`/api/creators/${username}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData),
        credentials: 'include'
      });
      
      const responseText = await response.text();
      setDebugInfo(`Respuesta de prueba: ${response.status}, Texto: ${responseText}`);
      
    } catch (error) {
      setDebugInfo(`Error de prueba: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Mostrar info de debug en la consola
  useEffect(() => {
    if (debugInfo) {
      console.log("[DEBUG] SuggestIdea:", debugInfo);
    }
  }, [debugInfo]);
  
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
            
            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <div className="space-y-4">
                  {/* Campo de título */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      {t('suggestIdea.titleLabel', 'Título')}
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        errors.title ? 'border-red-500' : ''
                      }`}
                      placeholder={t('suggestIdea.titlePlaceholder', 'Escribe un título breve y descriptivo')}
                      disabled={isSubmitting}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>
                  
                  {/* Campo de descripción */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      {t('suggestIdea.descriptionLabel', 'Descripción')}
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        errors.description ? 'border-red-500' : ''
                      }`}
                      rows={4}
                      placeholder={t('suggestIdea.descriptionPlaceholder', 'Describe tu idea con más detalle')}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                  
                  {/* Debug info (solo en desarrollo) */}
                  {debugInfo && (
                    <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                      <p className="font-mono break-all">{typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo)}</p>
                    </div>
                  )}
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
                  {t('suggestIdea.cancel', 'Cancelar')}
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('suggestIdea.sending', 'Enviando...')}
                    </>
                  ) : (
                    t('suggestIdea.submit', 'Enviar')
                  )}
                </Button>
                
                {/* Botón de debug (solo en desarrollo) */}
                {process.env.NODE_ENV !== 'production' && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleDebugSubmit}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Debug
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}