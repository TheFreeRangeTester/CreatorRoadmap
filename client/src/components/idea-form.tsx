import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [showCustomNiche, setShowCustomNiche] = useState(false);

  // Check if user has premium access
  const hasPremium = user
    ? hasActivePremiumAccess({
        subscriptionStatus: ((user as any).subscriptionStatus || "free") as
          | "free"
          | "trial"
          | "premium"
          | "canceled",
        trialEndDate: (user as any).trialEndDate || null,
        subscriptionEndDate: (user as any).subscriptionEndDate || null,
      })
    : false;

  // Check if limit is reached for non-premium users
  const isLimitReached = !isEditing && !hasPremium && quota?.hasReachedLimit;

  // Form definition
  const form = useForm<z.infer<typeof insertIdeaSchema>>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      title: idea?.title || "",
      description: idea?.description || "",
      niche: idea?.niche || "",
    },
  });

  // Reset form when idea changes
  useEffect(() => {
    if (isOpen) {
      const currentNiche = idea?.niche || "";
      const isPredefinedNiche = [
        "unboxing",
        "review",
        "tutorial",
        "vlog",
        "behindTheScenes",
        "qna",
      ].includes(currentNiche);

      form.reset({
        title: idea?.title || "",
        description: idea?.description || "",
        niche: currentNiche,
      });

      setShowCustomNiche(!isPredefinedNiche && currentNiche !== "");
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
        throw new Error(errorData || t("errors.createIdeaFailed"));
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
        throw new Error(errorData || t("errors.updateIdeaFailed"));
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
      <DialogContent className="sm:max-w-[600px] rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-0 w-full max-w-none overflow-hidden">
        <DialogHeader className="text-left px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="font-heading text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
            {isEditing
              ? t("ideaForm.editTitle", "Edit idea")
              : t("ideaForm.addTitle", "Add new idea")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-6 py-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("ideaForm.title", "Title")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("ideaForm.titlePlaceholder")}
                      maxLength={100}
                      disabled={isLimitReached}
                      className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("ideaForm.description", "Description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("ideaForm.descriptionPlaceholder")}
                      maxLength={280}
                      className="resize-none h-28 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      disabled={isLimitReached}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {charCount}/280 {t("ideaForm.characters", "characters")}
                    </span>
                    <span className="text-gray-400">•</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("ideaForm.niche", "Niche")}
                  </FormLabel>
                  <FormControl>
                    {showCustomNiche ? (
                      <Input
                        placeholder={t("ideaForm.customNichePlaceholder")}
                        maxLength={50}
                        disabled={isLimitReached}
                        className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        {...field}
                        onBlur={() => {
                          if (!field.value) setShowCustomNiche(false);
                        }}
                      />
                    ) : (
                      <Select
                        onValueChange={(value) => {
                          if (value === "other") {
                            setShowCustomNiche(true);
                            field.onChange("");
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                        disabled={isLimitReached}
                      >
                        <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-gray-900 dark:text-white">
                          <SelectValue
                            placeholder={t("ideaForm.nichePlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                          <SelectItem
                            value="unboxing"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.unboxing")}
                          </SelectItem>
                          <SelectItem
                            value="review"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.review")}
                          </SelectItem>
                          <SelectItem
                            value="tutorial"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.tutorial")}
                          </SelectItem>
                          <SelectItem
                            value="vlog"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.vlog")}
                          </SelectItem>
                          <SelectItem
                            value="behindTheScenes"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.behindTheScenes")}
                          </SelectItem>
                          <SelectItem
                            value="qna"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.qna")}
                          </SelectItem>
                          <SelectItem
                            value="other"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {t("ideaForm.niches.other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              {!isLimitReached && (
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 sm:flex-none h-12 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
