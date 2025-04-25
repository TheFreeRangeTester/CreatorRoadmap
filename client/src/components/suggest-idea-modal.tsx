import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { suggestIdeaSchema } from "@shared/schema";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

type FormData = z.infer<typeof suggestIdeaSchema>;

export default function SuggestIdeaModal({ 
  username, 
  open, 
  onOpenChange,
  onSuccess 
}: SuggestIdeaModalProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Form validation setup with react-hook-form and zod
  const form = useForm<FormData>({
    resolver: zodResolver(suggestIdeaSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  const suggestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest(
        "POST", 
        `/api/creators/${username}/suggest`, 
        data
      );
      return response.json();
    },
    onSuccess: async () => {
      form.reset();
      toast({
        title: t('creator.suggestionSuccess'),
        description: t('creator.suggestionSuccessDesc'),
        variant: "default",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      onOpenChange(false);
      await onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: t('creator.suggestionError'),
        description: error.message || t('creator.suggestionErrorDesc'),
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormData) => {
    suggestMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Sugerir un tema de contenido
          </DialogTitle>
          <DialogDescription>
            ¿Qué te gustaría que el creador publique a continuación?
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Escribe un título claro y conciso"
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente qué contenido te gustaría ver"
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
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              disabled={suggestMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}