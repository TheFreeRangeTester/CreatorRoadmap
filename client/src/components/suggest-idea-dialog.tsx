import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Lightbulb, Loader2, X } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  
  // Para capturar clics fuera del modal
  const modalRef = React.useRef<HTMLDivElement>(null);
  
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
      console.log("[DEBUG] mutationFn ejecutándose con datos:", data);
      
      try {
        console.log("[DEBUG] Realizando solicitud a:", `/api/creators/${username}/suggest`);
        const response = await apiRequest(
          "POST", 
          `/api/creators/${username}/suggest`,
          data
        );
        
        console.log("[DEBUG] Respuesta recibida:", response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("[DEBUG] Error en respuesta:", errorData);
          throw new Error(errorData.message || t('suggestIdea.errorDesc', { defaultValue: "Error sending suggestion" }));
        }
        
        const result = await response.json();
        console.log("[DEBUG] Datos de respuesta:", result);
        return result;
      } catch (err) {
        console.error("[DEBUG] Error en mutationFn:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("[DEBUG] Mutación exitosa:", data);
      
      // Cerrar el modal
      setShowModal(false);
      
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
      console.error("[DEBUG] Error en mutación:", error);
      toast({
        title: t('suggestIdea.error'),
        description: error.message || t('suggestIdea.errorDesc'),
        variant: "destructive",
      });
    }
  });
  
  // Efecto para listener de clicks fuera del modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);
  
  // Effect para manejar la tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showModal]);
  
  // Handler para abrir el modal
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
  
  // Handler para enviar el formulario
  const onSubmit = async () => {
    console.log("[DEBUG] Iniciando envío del formulario");
    const values = form.getValues();
    console.log("[DEBUG] Valores del formulario:", values);
    const isValid = await form.trigger();
    console.log("[DEBUG] ¿Formulario válido?:", isValid);
    
    if (!isValid) {
      console.log("[DEBUG] Formulario inválido, errores:", form.formState.errors);
      toast({
        title: t('suggestIdea.invalidFields'),
        description: t('suggestIdea.invalidFieldsDesc'),
        variant: "destructive",
      });
      return;
    }
    
    console.log("[DEBUG] Enviando mutación con datos:", values);
    try {
      suggestMutation.mutate(values);
      console.log("[DEBUG] Mutación enviada correctamente");
    } catch (error) {
      console.error("[DEBUG] Error al enviar la mutación:", error);
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
      
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-[500px] w-[95%] p-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              {/* Cabecera */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {t('suggestIdea.title', {username})}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowModal(false)}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Contenido */}
              <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={suggestMutation.isPending}
                      onClick={() => setShowModal(false)}
                    >
                      {t('suggestIdea.cancel')}
                    </Button>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}