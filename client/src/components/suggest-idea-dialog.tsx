import React, { useState } from "react";
import { Lightbulb, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { AchievementType } from "@/components/achievement-animation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { suggestIdeaSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
  fullWidth?: boolean;
}

type FormData = z.infer<typeof suggestIdeaSchema>;

export default function SuggestIdeaDialog({ username, refetch, fullWidth = false }: SuggestIdeaDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showAchievement } = useAchievements();
  const [showModal, setShowModal] = useState(false);

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
      return response;
    },
    onSuccess: async () => {
      form.reset();
      setShowModal(false);
      showAchievement(AchievementType.SUGGESTED_IDEA, 
        t('achievements.ideaSuggested', { username: `@${username}` }));

      toast({
        title: t('creator.suggestionSuccess'),
        description: t('creator.suggestionSuccessDesc'),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });

      await refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t('creator.suggestionError'),
        description: error.message || t('creator.suggestionErrorDesc'),
        variant: "destructive",
      });
    },
  });

  const handleOpen = () => {
    if (!user) {
      toast({
        title: t('login.required'),
        description: t('login.requiredToSuggest'),
        variant: "destructive",
      });
      return;
    }
    form.reset();
    setShowModal(true);
  };

  const onSubmit = (data: FormData) => {
    suggestMutation.mutate(data);
  };

  return (
    <>
      <Button 
        variant={fullWidth ? "secondary" : "outline"}
        className={fullWidth 
          ? 'w-full shadow-sm flex items-center gap-2' 
          : 'bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm flex items-center gap-2 px-4 py-2'
        }
        onClick={handleOpen}
      >
        <Lightbulb className="h-4 w-4" />
        <span>{t('suggestIdea.button')}</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {t('suggestIdea.title', { username: `@${username}` })}
            </DialogTitle>
            <DialogDescription>
              {t('suggestIdea.description')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('suggestIdea.titleLabel')}</Label>
              <Input
                id="title"
                placeholder={t('suggestIdea.titlePlaceholder')}
                {...form.register("title")}
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
                rows={4}
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
                onClick={() => setShowModal(false)}
                disabled={suggestMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={suggestMutation.isPending}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
              >
                {suggestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.sending')}
                  </>
                ) : (
                  t('common.submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}