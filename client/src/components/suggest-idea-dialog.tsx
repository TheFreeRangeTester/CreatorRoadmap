import React, { useState } from 'react';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useAchievements } from '@/hooks/use-achievements';
import { AchievementType } from '@/components/achievement-animation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  // Hooks y estado
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Funciones
  const openModal = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para sugerir ideas",
        variant: "destructive"
      });
      return;
    }
    
    setTitle('');
    setDescription('');
    setError('');
    setIsOpen(true);
  };
  
  const closeModal = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };
  
  // Enviar idea con XHR para máxima compatibilidad
  const submitIdea = () => {
    // Validación
    if (title.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return;
    }
    
    if (description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }
    
    // Comenzar envío
    setError('');
    setIsSubmitting(true);
    
    // Crear objeto XHR para compatibilidad máxima
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/creators/${username}/suggest`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    
    // Manejar respuesta
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('Idea sugerida con éxito:', data);
          
          // Cerrar modal
          setIsOpen(false);
          
          // Mostrar logro
          showAchievement(AchievementType.SUGGESTED_IDEA, 
            `¡Tu idea ha sido enviada a @${username}!`);
          
          // Notificación
          toast({
            title: '¡Gracias por tu idea!',
            description: 'Tu sugerencia ha sido enviada y está pendiente de revisión.',
            className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800',
          });
          
          // Refrescar datos
          refetch();
        } catch (e) {
          console.error('Error al procesar respuesta:', e);
          setError('Error al procesar la respuesta del servidor');
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          console.error('Error del servidor:', errorData);
          setError(errorData.message || 'Error al enviar la idea');
        } catch (e) {
          console.error('Error al procesar error:', e, xhr.responseText);
          setError('Error en la comunicación con el servidor');
        }
        
        toast({
          title: 'Error al enviar idea',
          description: 'Ocurrió un problema al enviar tu idea',
          variant: 'destructive'
        });
      }
      
      setIsSubmitting(false);
    };
    
    // Manejar error de red
    xhr.onerror = function() {
      console.error('Error de red al enviar idea');
      setError('Error de conexión');
      setIsSubmitting(false);
      
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive'
      });
    };
    
    // Datos a enviar
    const data = {
      title: title.trim(),
      description: description.trim()
    };
    
    // Enviar datos
    console.log('Enviando idea:', data);
    xhr.send(JSON.stringify(data));
  };
  
  // Botón para enviar idea de prueba (para depuración)
  const submitTestIdea = () => {
    const testTitle = `Idea de prueba ${new Date().toISOString()}`;
    const testDescription = `Esta es una idea de prueba generada automáticamente para depuración ${Math.random().toString(36).substring(7)}`;
    
    setIsSubmitting(true);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/creators/${username}/suggest`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    
    xhr.onload = function() {
      console.log(`Respuesta de prueba (${xhr.status}):`, xhr.responseText);
      alert(`Respuesta (${xhr.status}): ${xhr.responseText}`);
      setIsSubmitting(false);
    };
    
    xhr.onerror = function() {
      console.error('Error de red en prueba');
      alert('Error de conexión en prueba');
      setIsSubmitting(false);
    };
    
    const testData = { title: testTitle, description: testDescription };
    console.log('Enviando datos de prueba:', testData);
    xhr.send(JSON.stringify(testData));
  };
  
  return (
    <>
      {/* Botón para abrir modal */}
      <Button 
        variant={fullWidth ? "secondary" : "outline"}
        className={fullWidth 
          ? 'w-full shadow-sm flex items-center gap-2' 
          : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'
        }
        onClick={openModal}
      >
        <Lightbulb className="h-4 w-4" />
        <span>Sugerir idea</span>
      </Button>
      
      {/* Modal básico */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo semitransparente */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={closeModal}
          />
          
          {/* Contenido del modal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 z-10">
            {/* Encabezado */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                Sugerir idea para @{username}
              </h3>
              
              <button 
                onClick={closeModal}
                disabled={isSubmitting}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Cuerpo */}
            <div className="p-4">
              <div className="space-y-4">
                {/* Campo título */}
                <div>
                  <label htmlFor="idea-title" className="block text-sm font-medium mb-1">
                    Título
                  </label>
                  <input
                    id="idea-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título breve y descriptivo"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    disabled={isSubmitting}
                  />
                </div>
                
                {/* Campo descripción */}
                <div>
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
                
                {/* Mensaje de error */}
                {error && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
            
            {/* Pie */}
            <div className="flex justify-between p-4 border-t dark:border-gray-700">
              {/* Botón de prueba directo */}
              <Button
                variant="secondary"
                size="sm"
                onClick={submitTestIdea}
                disabled={isSubmitting}
              >
                Test
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={submitIdea}
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
        </div>
      )}
    </>
  );
}