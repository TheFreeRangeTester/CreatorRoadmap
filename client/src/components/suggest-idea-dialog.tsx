import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Lightbulb, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementType } from "@/components/achievement-animation";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  
  // Definir esquema de validación
  const formSchema = z.object({
    title: z.string()
      .min(3, t('suggestIdea.titleMinLength', { defaultValue: "Title must be at least 3 characters" }))
      .max(100, t('suggestIdea.titleMaxLength', { defaultValue: "Title cannot exceed 100 characters" })),
    description: z.string()
      .min(10, t('suggestIdea.descriptionMinLength', { defaultValue: "Description must be at least 10 characters" }))
      .max(500, t('suggestIdea.descriptionMaxLength', { defaultValue: "Description cannot exceed 500 characters" })),
  });
  
  // Crear formulario con react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  });
  
  // Mutation para enviar la sugerencia
  const suggestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest(
        "POST", 
        `/api/creators/${username}/suggest`,
        data
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('suggestIdea.errorDesc', { defaultValue: "Error sending suggestion" }));
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Cerrar el diálogo
      setOpen(false);
      
      // Mostrar logro por sugerir una idea
      showAchievement(AchievementType.SUGGESTED_IDEA, 
        t('achievements.suggestedIdea', 'Tu idea ha sido enviada a @' + username));
      
      // Mostrar mensaje de éxito
      toast({
        title: t('suggestIdea.thankYou'),
        description: t('suggestIdea.thankYouDesc'),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
      // Resetear el formulario
      form.reset();
      
      // Refrescar la página para mostrar cambios
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t('suggestIdea.error'),
        description: error.message || t('suggestIdea.errorDesc'),
        variant: "destructive",
      });
    }
  });
  
  // Handler para abrir el diálogo
  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t('suggestIdea.loginRequired'),
        description: t('suggestIdea.loginRequiredDesc'),
        variant: "destructive",
      });
      return;
    }
    
    setOpen(true);
  };
  
  // Handler para enviar el formulario
  const onSubmit = async () => {
    const values = form.getValues();
    const isValid = await form.trigger();
    
    if (!isValid) {
      toast({
        title: t('suggestIdea.invalidFields'),
        description: t('suggestIdea.invalidFieldsDesc'),
        variant: "destructive",
      });
      return;
    }
    
    suggestMutation.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant={fullWidth ? "secondary" : "outline"}
        className={`
          ${fullWidth ? 'w-full shadow-sm flex items-center gap-2' : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'}
        `}
        onClick={handleOpenDialog}
      >
        <Lightbulb className="h-4 w-4" />
        <span>{t('suggestIdea.button')}</span>
      </Button>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            {t('suggestIdea.title', {username})}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suggestIdea.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('suggestIdea.titlePlaceholder')}
                      {...field} 
                      className="dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suggestIdea.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('suggestIdea.descriptionPlaceholder')}
                      {...field}
                      rows={4}
                      className="resize-none dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={suggestMutation.isPending}>
                  {t('suggestIdea.cancel')}
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                disabled={suggestMutation.isPending}
                onClick={onSubmit}
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}