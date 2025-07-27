import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, User, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface IdeasTabViewProps {
  mode: "published" | "suggested";
}

export function IdeasTabView({ mode = "published" }: IdeasTabViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [processingIdea, setProcessingIdea] = useState<number | null>(null);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);

  // Fetch published ideas
  const {
    data: ideas,
    isLoading: isLoadingIdeas,
    isError: isErrorIdeas,
  } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/ideas"],
    enabled: mode === "published",
  });

  // Fetch pending ideas
  const {
    data: pendingIdeas,
    isLoading: isLoadingPending,
    isError: isErrorPending,
    refetch: refetchPending,
  } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/pending-ideas"],
    enabled: mode === "suggested" && !!user,
  });

  // State to track which ideas are being voted on
  const [votingIdeaIds, setVotingIdeaIds] = useState<Set<number>>(new Set());

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      // Add ideaId to the set of ideas being voted on
      setVotingIdeaIds((prev) => new Set(prev).add(ideaId));
      try {
        await apiRequest(`/api/ideas/${ideaId}/vote`, {
          method: "POST"
        });
      } finally {
        // Remove ideaId from the set when done (success or error)
        setTimeout(() => {
          setVotingIdeaIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(ideaId);
            return newSet;
          });
        }, 500); // Small delay for better UX
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error) => {
      toast({
        title: "Voting failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      await apiRequest(`/api/ideas/${ideaId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea eliminada",
        description: "La idea ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve idea mutation
  const approveMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      setProcessingIdea(ideaId);
      console.log(`[FRONTEND] Approving idea ${ideaId}`);
      const response = await apiRequest(
        `/api/ideas/${ideaId}/approve`,
        {
          method: "PATCH"
        }
      );
      console.log(`[FRONTEND] Idea ${ideaId} approved successfully`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("ideas.approved"),
        description: t("ideas.approvedSuccess"),
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      // Refresh pending and approved ideas lists
      refetchPending();
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("ideas.approveError"),
        description: error.message || t("ideas.approveErrorDesc"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingIdea(null);
    },
  });

  // Reject idea mutation
  const rejectMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      setProcessingIdea(ideaId);
      console.log(`[FRONTEND] Rejecting idea ${ideaId}`);
      await apiRequest(`/api/ideas/${ideaId}`, {
        method: "DELETE"
      });
      console.log(`[FRONTEND] Idea ${ideaId} rejected successfully`);
    },
    onSuccess: () => {
      toast({
        title: t("ideas.rejected"),
        description: t("ideas.rejectedSuccess"),
      });
      // Refresh the list of pending ideas
      refetchPending();
    },
    onError: (error: Error) => {
      toast({
        title: t("ideas.rejectError"),
        description: error.message || t("ideas.rejectErrorDesc"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingIdea(null);
    },
  });

  // Handle functions
  const handleVote = (ideaId: number) => {
    voteMutation.mutate(ideaId);
  };

  const handleDeleteIdea = (ideaId: number) => {
    if (window.confirm(t("ideas.confirmDelete"))) {
      deleteMutation.mutate(ideaId);
    }
  };

  const handleEditIdea = (idea: IdeaResponse) => {
    setCurrentIdea(idea);
    setIsIdeaFormOpen(true);
  };

  const handleApprove = (ideaId: number) => {
    approveMutation.mutate(ideaId);
  };

  const handleReject = (ideaId: number) => {
    rejectMutation.mutate(ideaId);
  };

  const isLoading = mode === "published" ? isLoadingIdeas : isLoadingPending;
  const isError = mode === "published" ? isErrorIdeas : isErrorPending;
  const displayedIdeas = mode === "published" ? ideas : pendingIdeas;

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {t("ideas.loadError")}
      </div>
    );
  }

  // Render empty state
  if (!displayedIdeas || displayedIdeas.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === "published"
            ? t("ideas.noPublishedIdeas")
            : t("ideas.noSuggestedIdeas")}
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          {mode === "published"
            ? t("ideas.createFirstIdea")
            : t("ideas.suggestedIdeasWillAppear")}
        </p>
      </div>
    );
  }

  // Render published ideas
  if (mode === "published") {
    return (
      <>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {displayedIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onVote={handleVote}
              onEdit={
                user && idea.creatorId === user.id ? handleEditIdea : undefined
              }
              onDelete={
                user && idea.creatorId === user.id
                  ? handleDeleteIdea
                  : undefined
              }
              isVoting={votingIdeaIds.has(idea.id)}
            />
          ))}
        </div>

        {/* Idea Form Modal */}
        <IdeaForm
          isOpen={isIdeaFormOpen}
          idea={currentIdea}
          onClose={() => setIsIdeaFormOpen(false)}
        />
      </>
    );
  }

  // Render suggested ideas
  return (
    <>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {displayedIdeas.map((idea) => (
          <div
            key={idea.id}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2 flex justify-between items-start">
              <h3 className="font-medium text-lg dark:text-white">
                {idea.title}
              </h3>
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              >
                <Clock className="h-3 w-3 mr-1" /> {t("ideas.pending")}
              </Badge>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {idea.description}
            </p>

            {idea.suggestedByUsername && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                {t("ideas.suggestedBy")}:{" "}
                <span className="font-medium">{idea.suggestedByUsername}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
                onClick={() => handleReject(idea.id)}
                disabled={processingIdea === idea.id}
              >
                {processingIdea === idea.id && rejectMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {t("ideas.reject")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-green-200 text-green-600 hover:text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/30"
                onClick={() => handleApprove(idea.id)}
                disabled={processingIdea === idea.id}
              >
                {processingIdea === idea.id && approveMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {t("ideas.approve")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Idea Form Modal */}
      <IdeaForm
        isOpen={isIdeaFormOpen}
        idea={currentIdea}
        onClose={() => setIsIdeaFormOpen(false)}
      />
    </>
  );
}
