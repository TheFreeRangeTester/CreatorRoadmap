import React, { useState } from 'react';
import { Lightbulb, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useAchievements } from '@/hooks/use-achievements';
import { AchievementType } from '@/components/achievement-animation';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewSuggestionModalProps {
  username: string;
  onSuggestionSuccess?: () => void;
  buttonStyle?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  fullWidth?: boolean;
}

export function NewSuggestionModal({
  username,
  onSuggestionSuccess,
  buttonStyle = 'default',
  fullWidth = false,
}: NewSuggestionModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();

  // Limpiar el formulario
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setError('');
    setSuccess(false);
  };

  // Abrir modal
  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      // Si se está abriendo
      if (!user) {
        toast({
          title: t('suggestIdea.loginRequired', 'Inicio de sesión requerido'),
          description: t('suggestIdea.loginRequiredDesc', 'Debes iniciar sesión para sugerir ideas'),
          variant: "destructive"
        });
        return;
      }
      resetForm();
    }
    
    // Solo permitir cerrar si no está en proceso de envío
    if (!isSubmitting) {
      setOpen(newOpenState);
    }
  };
  
  // Validar formulario
  const isFormValid = () => {
    if (!title || title.trim().length < 3) {
      setError(t('suggestIdea.titleMinLength', 'El título debe tener al menos 3 caracteres'));
      return false;
    }
    
    if (title.trim().length > 100) {
      setError(t('suggestIdea.titleMaxLength', 'El título no puede tener más de 100 caracteres'));
      return false;
    }
    
    if (!description || description.trim().length < 10) {
      setError(t('suggestIdea.descriptionMinLength', 'La descripción debe tener al menos 10 caracteres'));
      return false;
    }
    
    return true;
  };
  
  // Enviar sugerencia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    setError('');
    console.log(`Enviando sugerencia a ${username}: ${title} - ${description}`);
    
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
      
      console.log(`Respuesta del servidor: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error desconocido al procesar la respuesta'
        }));
        throw new Error(errorData.message || 'Error al enviar sugerencia');
      }
      
      // Mostrar éxito
      setSuccess(true);
      
      // Mostrar notificación
      toast({
        title: t('suggestIdea.thankYou', '¡Gracias por tu idea!'),
        description: t('suggestIdea.thankYouDesc', 'Tu idea ha sido enviada al creador para su aprobación.'),
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800',
      });
      
      // Mostrar logro
      showAchievement(
        AchievementType.SUGGESTED_IDEA,
        t('suggestIdea.achievementText', '¡Tu idea ha sido enviada a @{{username}}!', { username })
      );
      
      // Llamar callback si existe
      if (onSuggestionSuccess) {
        onSuggestionSuccess();
      }
      
      // Cerrar diálogo después de un breve momento
      setTimeout(() => {
        handleOpenChange(false);
        // Resetear form después de cerrar para una mejor experiencia
        setTimeout(resetForm, 300);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error al sugerir idea:', error);
      setError(error.message || t('suggestIdea.errorDesc', 'Ocurrió un error al enviar tu sugerencia'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clases para el botón
  const getButtonClasses = () => {
    let classes = '';
    
    if (fullWidth) {
      classes += 'w-full ';
    }
    
    if (buttonStyle === 'outline') {
      classes += 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm';
    }
    
    return classes.trim();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonStyle} 
          className={getButtonClasses()}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          <span>{t('suggestIdea.button', 'Sugerir idea')}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {t('suggestIdea.title', 'Sugerir idea a {{username}}', { username })}
          </DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="py-6">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium">
                {t('suggestIdea.ideaSent', '¡Tu idea ha sido enviada!')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('suggestIdea.ideaSentDesc', 'El creador la revisará pronto. ¡Gracias por tu contribución!')}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="title">
                  {t('suggestIdea.titleLabel', 'Título')}
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('suggestIdea.titlePlaceholder', 'Escribe un título conciso')}
                  disabled={isSubmitting}
                  className="col-span-3"
                  autoComplete="off"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">
                  {t('suggestIdea.descriptionLabel', 'Descripción')}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('suggestIdea.descriptionPlaceholder', 'Describe con detalle tu idea para el creador')}
                  disabled={isSubmitting}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('suggestIdea.sending', 'Enviando...')}
                  </>
                ) : (
                  t('suggestIdea.submit', 'Enviar sugerencia')
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}