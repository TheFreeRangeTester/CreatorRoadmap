import React, { useState } from 'react';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useAchievements } from '@/hooks/use-achievements';
import { AchievementType } from '@/components/achievement-animation';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  // Estado
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  
  // Abrir diálogo
  const openDialog = () => {
    if (!user) {
      toast({
        title: t('suggestIdea.loginRequired', 'Inicio de sesión requerido'),
        description: t('suggestIdea.loginRequiredDesc', 'Debes iniciar sesión para sugerir ideas'),
        variant: "destructive"
      });
      return;
    }
    
    setTitle('');
    setDescription('');
    setError('');
    setIsOpen(true);
  };
  
  // Cerrar diálogo
  const closeDialog = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };
  
  // Validación de formulario
  const validateForm = () => {
    if (title.trim().length < 3) {
      setError(t('suggestIdea.titleMinLength', 'El título debe tener al menos 3 caracteres'));
      return false;
    }
    
    if (description.trim().length < 10) {
      setError(t('suggestIdea.descriptionMinLength', 'La descripción debe tener al menos 10 caracteres'));
      return false;
    }
    
    setError('');
    return true;
  };
  
  // Enviar idea
  const submitIdea = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/creators/${username}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim()
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('suggestIdea.error', 'Error al enviar sugerencia'));
      }
      
      const data = await response.json();
      
      // Cerrar diálogo
      setIsOpen(false);
      
      // Mostrar notificación
      toast({
        title: t('suggestIdea.thankYou', '¡Gracias por tu idea!'),
        description: t('suggestIdea.thankYouDesc', 'Tu idea ha sido enviada al creador para su aprobación.'),
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800',
      });
      
      // Mostrar logro
      showAchievement(
        AchievementType.SUGGESTED_IDEA, 
        t('suggestIdea.achievementText', '¡Tu idea ha sido enviada a @{{username}}!', { username: username })
      );
      
      // Actualizar datos
      refetch();
      
    } catch (error: any) {
      console.error('Error al sugerir idea:', error);
      setError(error.message || t('suggestIdea.errorDesc', 'Ocurrió un error al enviar tu sugerencia'));
      
      toast({
        title: t('suggestIdea.error', 'Error al enviar sugerencia'),
        description: error.message || t('suggestIdea.errorDesc', 'Ocurrió un error al enviar tu sugerencia'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Botón para abrir el diálogo */}
      <Button 
        variant={fullWidth ? "secondary" : "outline"}
        className={fullWidth 
          ? 'w-full shadow-sm flex items-center gap-2' 
          : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'
        }
        onClick={openDialog}
      >
        <Lightbulb className="h-4 w-4" />
        <span>{t('suggestIdea.button', 'Sugerir idea')}</span>
      </Button>
      
      {/* Diálogo con componentes shadcn */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {t('suggestIdea.title', 'Sugerir idea a {{username}}', { username: username })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="title">{t('suggestIdea.titleLabel', 'Título')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('suggestIdea.titlePlaceholder', 'Escribe un título conciso')}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t('suggestIdea.descriptionLabel', 'Descripción')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('suggestIdea.descriptionPlaceholder', 'Describe con detalle tu idea para el creador')}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              {t('suggestIdea.cancel', 'Cancelar')}
            </Button>
            
            <Button
              onClick={submitIdea}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('suggestIdea.sending', 'Enviando...')}
                </>
              ) : (
                t('suggestIdea.submit', 'Enviar sugerencia')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}