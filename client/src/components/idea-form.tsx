import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Crown } from "lucide-react";
import { insertIdeaSchema, IdeaResponse } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useIdeaQuota } from "@/hooks/useIdeaQuota";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { IdeaLimitNotice } from "./idea-limit-notice";
import { hasActivePremiumAccess } from "@shared/premium-utils";

interface IdeaFormProps {
  isOpen: boolean;
  idea: IdeaResponse | null;
  onClose: () => void;
}

export default function IdeaForm({ isOpen, idea, onClose }: IdeaFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: quota, isLoading: quotaLoading } = useIdeaQuota();
  const isEditing = !!idea;

  // Check if user has premium access
  const hasPremium = user ? hasActivePremiumAccess({
    subscriptionStatus: ((user as any).subscriptionStatus || "free") as "free" | "trial" | "premium" | "canceled",
    trialEndDate: (user as any).trialEndDate || null,
    subscriptionEndDate: (user as any).subscriptionEndDate || null
  }) : false;

  // Check if limit is reached for non-premium users
  const isLimitReached = !isEditing && !hasPremium && quota?.hasReachedLimit;

  // Form definition
  const form = useForm<z.infer<typeof insertIdeaSchema>>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      title: idea?.title || "",
      description: idea?.description || "",
    },
  });

  // Reset form when idea changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: idea?.title || "",
        description: idea?.description || "",
      });
    }
  }, [isOpen, idea, form]);

  // Create idea mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof insertIdeaSchema>) => {
      console.log("Creating idea with values:", values);
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error creating idea:", errorData);
        throw new Error(errorData || "Failed to create idea");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["ideaQuota", user?.id] });
      toast({
        title: t("ideas.created", "Idea created"),
        description: t(
          "ideas.createdDesc",
          "Your idea has been added to the leaderboard."
        ),
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("ideas.createFailed", "Failed to create idea"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update idea mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof insertIdeaSchema>) => {
      console.log("Updating idea with values:", values);
      const res = await fetch(`/api/ideas/${idea?.id}`, {
        method: "PUT",
        headers: {
        credentials: "include",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error updating idea:", errorData);
        throw new Error(errorData || "Failed to update idea");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: t("ideas.updated", "Idea updated"),
        description: t(
          "ideas.updatedDesc",
          "Your idea has been updated successfully."
        ),
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("ideas.updateFailed", "Failed to update idea"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission
  function onSubmit(values: z.infer<typeof insertIdeaSchema>) {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  // Character counter helper
  const description = form.watch("description");
  const charCount = description?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl glass-card text-center p-4 sm:p-6 lg:p-8 w-full max-w-none overflow-hidden">
        <DialogHeader className="text-center">
          <DialogTitle className="font-heading text-base sm:text-lg lg:text-xl mb-2 break-words leading-tight max-w-full overflow-hidden">
            {isEditing
              ? t("ideaForm.editTitle", "Edit idea")
              : t("ideaForm.addTitle", "Add new idea")}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600 dark:text-neutral-300 px-2 sm:px-4 break-words">
            {isEditing
              ? t("ideaForm.editDescription", "Make changes to your idea.")
              : t(
                  "ideaForm.addDescription",
                  "Share your idea with the community. Be clear and concise to get more votes!"
                )}
          </DialogDescription>
        </DialogHeader>

        {/* Show idea limit notice for non-premium users who have reached the limit */}
        {!isEditing && <IdeaLimitNotice />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="text-center">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t("ideaForm.title", "Title")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Cómo crear contenido que realmente enganche"
                      maxLength={100}
                      disabled={isLimitReached}
                      className="rounded-2xl glass-input"
                      {...field}
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
                <FormItem className="text-center">
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t("ideaForm.description", "Description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comparte estrategias, herramientas o consejos específicos que has probado..."
                      maxLength={280}
                      className="resize-none h-24 rounded-2xl glass-input"
                      disabled={isLimitReached}
                      {...field}
                    />
                  </FormControl>
                  <div className="mt-2 text-xs text-neutral-500">
                    {charCount}/280 {t("ideaForm.characters", "characters")}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel", "Cancel")}
              </Button>
              {!isLimitReached && (
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="min-w-[100px]"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("common.saving", "Saving...")}
                    </span>
                  ) : (
                    t("ideaForm.submitIdea", "Save idea")
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
