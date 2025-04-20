import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Lightbulb, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
}

export default function SuggestIdeaDialog({ username, refetch }: SuggestIdeaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Definir esquema de validación
  const formSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder los 100 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "La descripción no puede exceder los 500 caracteres"),
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
      console.log("Enviando sugerencia:", data, "a creador:", username);
      const response = await apiRequest(
        "POST", 
        `/api/creators/${username}/suggest`,
        data
      );
      const result = await response.json();
      console.log("Respuesta de la API:", result);
      return result;
    },
    onSuccess: () => {
      // Cerrar el diálogo
      setIsOpen(false);
      
      // Mostrar mensaje de éxito
      toast({
        title: "Gracias por tu sugerencia",
        description: "Tu idea ha sido enviada al creador para su aprobación.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
      // Resetear el formulario
      form.reset();
      
      // Refrescar la página para mostrar cambios
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar sugerencia",
        description: error.message || "Ocurrió un error al enviar tu sugerencia",
        variant: "destructive",
      });
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Función onSubmit llamada con:", values);
    
    // Verificar que el usuario esté autenticado
    if (!user) {
      toast({
        title: "Necesitas iniciar sesión",
        description: "Debes tener una cuenta para poder sugerir ideas.",
        variant: "destructive",
      });
      setIsOpen(false);
      return;
    }
    
    // Verificar campos vacíos por seguridad adicional
    if (!values.title || !values.description) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos del formulario.",
        variant: "destructive",
      });
      return;
    }
    
    // Enviar la sugerencia a través de la mutación
    suggestMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          className="h-full shadow-sm flex items-center gap-2"
          onClick={(e) => {
            // Prevenir apertura automática para verificar autenticación
            if (!user) {
              e.preventDefault();
              toast({
                title: "Inicia sesión para sugerir ideas",
                description: "Necesitas una cuenta para poder sugerir ideas a este creador.",
                variant: "destructive",
              });
            }
          }}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Sugerir idea</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Sugerir idea a {username}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la idea</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Escribe un título conciso" 
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe con detalle tu idea para el creador"
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
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                disabled={suggestMutation.isPending}
              >
                {suggestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar sugerencia"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}