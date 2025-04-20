import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { insertIdeaSchema, IdeaResponse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { z } from "zod";

interface IdeaFormProps {
  isOpen: boolean;
  idea: IdeaResponse | null;
  onClose: () => void;
}

export default function IdeaForm({ isOpen, idea, onClose }: IdeaFormProps) {
  const { toast } = useToast();
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
      const res = await apiRequest("POST", "/api/ideas", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea created",
        description: "Your idea has been added to the leaderboard.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update idea mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof insertIdeaSchema>) => {
      const res = await apiRequest("PUT", `/api/ideas/${idea?.id}`, values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea updated",
        description: "Your idea has been updated successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update idea",
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
          <DialogTitle>{isEditing ? "Edit idea" : "Add new idea"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Make changes to your idea."
              : "Share your idea with the community. Be clear and concise to get more votes!"}
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a catchy title (required)" 
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your idea in 280 characters or less" 
                      maxLength={280} 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <div className="mt-1 text-xs text-neutral-500 text-right">
                    {charCount}/280 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="min-w-[100px]"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : "Save idea"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
