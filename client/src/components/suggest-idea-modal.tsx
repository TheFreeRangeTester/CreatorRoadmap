import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { suggestIdeaSchema } from "@shared/schema";
import { Loader2, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SuggestIdeaModalProps {
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<any>;
}

// Definimos un esquema simplificado para el formulario sin el campo creatorId
// ya que ese campo se añade en el servidor
const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title must be 100 characters or less" }),
  description: z.string().max(280, { message: "Description must be 280 characters or less" }),
});

type FormData = z.infer<typeof formSchema>;

export default function SuggestIdeaModal({ 
  username, 
  open, 
  onOpenChange,
  onSuccess 
}: SuggestIdeaModalProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form validation setup with react-hook-form and zod
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  const suggestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Obtener el creatorId del usuario
      const creatorResponse = await apiRequest(`/api/creators/${username}`);
      const creatorData = await creatorResponse.json();
      
      const suggestionData = {
        ...data,
        creatorId: creatorData.creator.id
      };
      
      console.log(`[FRONTEND] Sending suggestion:`, suggestionData);
      const response = await apiRequest(
        `/api/suggestions/submit`, 
        {
          method: "POST",
          body: JSON.stringify(suggestionData),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.json();
    },
    onSuccess: async () => {
      form.reset();
      
      // Invalidate points cache to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user/points"] });
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
      
      toast({
        title: t('creator.suggestionSuccess'),
        description: t('creator.suggestionSuccessDesc'),
        variant: "default",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      onOpenChange(false);
      await onSuccess();
    },
    onError: (error: any) => {
      console.error('Error al sugerir idea:', error);
      let errorMessage = '';
      
      try {
        // Si el error tiene un responseText, intentamos parsearlo
        if (error.responseText) {
          const errorData = JSON.parse(error.responseText);
          errorMessage = errorData.message || '';
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        errorMessage = t('creator.suggestionErrorDesc');
      }
      
      // Mostrar error en el formulario
      setFormError(errorMessage || t('creator.suggestionErrorDesc', 'Ocurrió un error al enviar tu sugerencia'));
      
      toast({
        title: t('creator.suggestionError', 'Error al enviar sugerencia'),
        description: errorMessage || t('creator.suggestionErrorDesc', 'Ocurrió un error al enviar tu sugerencia'),
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormData) => {
    console.log("Enviando sugerencia:", data);
    setFormError(null); // Limpiar errores anteriores
    suggestMutation.mutate(data);
  };
  
  // Limpiar errores al cerrar el modal
  useEffect(() => {
    if (!open) {
      setFormError(null);
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setFormError(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('suggestIdea.title', { username })}
          </DialogTitle>
          <DialogDescription>
            {t('suggestIdea.description', { defaultValue: "What would you like the creator to publish next?" })}
          </DialogDescription>
        </DialogHeader>
        
        {/* Mostrar mensaje de inicio de sesión si el usuario no está autenticado */}
        {!user ? (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
              <h3 className="text-sm font-semibold mb-2">
                {t('suggestIdea.loginRequired', 'Login required')}
              </h3>
              <p className="text-sm mb-3">
                {t('suggestIdea.loginRequiredDesc', 'You need an account to suggest ideas to this creator.')}
              </p>
              <Link href={`/auth?referrer=/${username}`}>
                <Button variant="default" size="sm" className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800">
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('suggestIdea.goToLoginButton', 'Login or create account')}
                </Button>
              </Link>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                {t('suggestIdea.cancel', 'Cancel')}
              </Button>
              
              <Button
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link to={`/auth?referrer=/${username}`}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('suggestIdea.login', 'Login')}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* General form error message */}
            {formError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
                <p className="text-sm font-medium">{formError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">{t('suggestIdea.titleLabel')}</Label>
              <Input
                id="title"
                placeholder={t('suggestIdea.titlePlaceholder')}
                {...form.register("title")}
                className="w-full"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('suggestIdea.descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('suggestIdea.descriptionPlaceholder')}
                {...form.register("description")}
                className="min-h-[100px]"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                {t('suggestIdea.cancel')}
              </Button>
              
              <Button 
                type="submit" 
                disabled={suggestMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {suggestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('suggestIdea.sending')}
                  </>
                ) : (
                  t('suggestIdea.submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}