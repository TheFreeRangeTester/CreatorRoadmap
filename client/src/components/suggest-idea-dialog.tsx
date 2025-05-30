import React, { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
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
import { apiRequest } from '@/lib/queryClient';

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  // Estados
  const [open, setOpen] = useState(false);
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
  const handleOpenDialog = () => {
    if (!user) {
      toast({
        title: t('suggestIdea.loginRequired'),
        description: t('suggestIdea.loginRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    // Resetear formulario
    setTitle('');
    setDescription('');
    setError('');
    setOpen(true);
  };

  // Manejar cambios en el diálogo
  const handleDialogChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    // Validar título
    if (!title || title.trim().length < 3) {
      setError(t('suggestIdea.titleMinLength'));
      return false;
    }

    if (title.trim().length > 100) {
      setError(t('suggestIdea.titleMaxLength'));
      return false;
    }

    // Validar descripción
    if (!description || description.trim().length < 10) {
      setError(t('suggestIdea.descriptionMinLength'));
      return false;
    }

    if (description.trim().length > 500) {
      setError(t('suggestIdea.descriptionMaxLength'));
      return false;
    }

    // Todo bien
    setError('');
    return true;
  };

  // Enviar sugerencia
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log('Iniciando envío de sugerencia a:', username);
    console.log('Datos a enviar:', { title: title.trim(), description: description.trim() });

    try {
      // Usar fetch directamente para tener más control y ver exactamente qué ocurre
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

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error al enviar sugerencia';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error al parsear respuesta de error:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

      // Cerrar diálogo
      setOpen(false);

      // Mostrar notificación de éxito
      toast({
        title: t('suggestIdea.thankYou', '¡Gracias por tu idea!'),
        description: t('suggestIdea.thankYouDesc', 'Tu idea ha sido enviada al creador para su aprobación.'),
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800',
      });

      // Mostrar logro de sugerencia
      showAchievement(
        AchievementType.SUGGESTED_IDEA, 
        t('suggestIdea.achievementText', '¡Tu idea ha sido enviada a @{{username}}!', { username })
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
        onClick={handleOpenDialog}
      >
        <Lightbulb className="h-4 w-4" />
        <span>{t('suggestIdea.button')}</span>
      </Button>

      {/* Diálogo */}
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {t('suggestIdea.title', { username })}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Mensaje de error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Campo de título */}
            <div className="grid gap-2">
              <Label htmlFor="title">{t('suggestIdea.titleLabel')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('suggestIdea.titlePlaceholder')}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Campo de descripción */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t('suggestIdea.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('suggestIdea.descriptionPlaceholder')}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('suggestIdea.sending')}
                </>
              ) : (
                t('suggestIdea.submit')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}