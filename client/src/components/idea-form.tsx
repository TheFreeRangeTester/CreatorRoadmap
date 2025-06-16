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
  const isEditing = !!idea;

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
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(values),
        credentials: "same-origin",
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
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(values),
        credentials: "same-origin",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("ideaForm.editTitle", "Edit idea")
              : t("ideaForm.addTitle", "Add new idea")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("ideaForm.editDescription", "Make changes to your idea.")
              : t(
                  "ideaForm.addDescription",
                  "Share your idea with the community. Be clear and concise to get more votes!"
                )}
          </DialogDescription>
        </DialogHeader>

        {/* El modal ya tiene su propio botón de cierre integrado */}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ideaForm.title", "Title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "ideaForm.titlePlaceholder",
                        "Enter a catchy title (required)"
                      )}
                      maxLength={100}
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
                <FormItem>
                  <FormLabel>
                    {t("ideaForm.description", "Description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "ideaForm.descriptionPlaceholder",
                        "Describe your idea in 280 characters or less"
                      )}
                      maxLength={280}
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <div className="mt-1 text-xs text-neutral-500 text-right">
                    {charCount}/280 {t("ideaForm.characters", "characters")}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel", "Cancel")}
              </Button>
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
