import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, User, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaCard from "@/components/idea-card";
import IdeaListView from "@/components/idea-list-view";
import IdeaForm from "@/components/idea-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface IdeasTabViewProps {
  mode: "published" | "suggested";
  onOpenTemplate?: (idea: IdeaResponse) => void;
}

export function IdeasTabView({ mode = "published", onOpenTemplate }: IdeasTabViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [processingIdea, setProcessingIdea] = useState<number | null>(null);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Fetch published ideas with forced refresh
  const {
    data: ideas,
    isLoading: isLoadingIdeas,
    isError: isErrorIdeas,
    refetch: refetchIdeas,
  } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/ideas"],
    enabled: mode === "published",
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
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

  // Debug logging for pending ideas
  useEffect(() => {
    if (mode === "suggested") {
      console.log(`[DEBUG] Pending ideas query:`, {
        data: pendingIdeas,
        isLoading: isLoadingPending,
        isError: isErrorPending,
        userRole: user?.userRole,
        userId: user?.id,
        username: user?.username
      });
    }
  }, [pendingIdeas, isLoadingPending, isErrorPending, mode, user]);

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
    onSuccess: async () => {
      // Force refetch ideas to get fresh data
      await refetchIdeas();
      // Invalidate user data to update points immediately
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Invalidate user points specifically  
      queryClient.invalidateQueries({ queryKey: ["/api/user/points"] });
      // Invalidate audience stats to update vote count
      queryClient.invalidateQueries({ queryKey: ["/api/user/audience-stats"] });
      // Invalidate point transactions to show new vote reward
      queryClient.invalidateQueries({ queryKey: ["/api/user/point-transactions"] });
    },
    onError: (error: any) => {
      // Check if this is a self-voting error
      if (error.error === "self_vote_attempt") {
        toast({
          title: t("creator.cantVoteOwn"),
          description: t("creator.cantVoteOwnDesc"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("creator.voteError", "Voting failed"),
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      await apiRequest(`/api/ideas/${ideaId}/complete`, {
        method: "PATCH"
      });
    },
    onSuccess: async () => {
      await refetchIdeas();
      toast({
        title: t("ideas.completed"),
        description: t("ideas.completedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("ideas.completeError"),
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
    onSuccess: async () => {
      await refetchIdeas();
      toast({
        title: t("ideas.deleted"),
        description: t("ideas.deletedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("ideas.deleteError"),
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
      
      try {
        const response = await apiRequest(
          `/api/ideas/${ideaId}/approve`,
          {
            method: "PATCH"
          }
        );
        console.log(`[FRONTEND] Response received:`, response);
        console.log(`[FRONTEND] Response status:`, response.status);
        console.log(`[FRONTEND] Response ok:`, response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FRONTEND] Error response:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`[FRONTEND] Idea ${ideaId} approved successfully, result:`, result);
        return result;
      } catch (error) {
        console.error(`[FRONTEND] Approval failed:`, error);
        throw error;
      }
    },
    onSuccess: async () => {
      toast({
        title: t("ideas.approved"),
        description: t("ideas.approvedSuccess"),
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      // Refresh pending and approved ideas lists
      refetchPending();
      await refetchIdeas();
      
      // Invalidate all points-related queries (user who suggested gets 2 points reward)
      queryClient.invalidateQueries({ queryKey: ["/api/user/points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/point-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/audience-stats"] });
    },
    onError: (error: any) => {
      console.error(`[FRONTEND] Approval error:`, error);
      console.error(`[FRONTEND] Error details:`, {
        message: error.message,
        stack: error.stack,
        responseText: error.responseText,
        status: error.status
      });
      
      let errorMessage = '';
      try {
        if (error.responseText) {
          const errorData = JSON.parse(error.responseText);
          errorMessage = errorData.message || '';
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        errorMessage = t("ideas.approveErrorDesc");
      }
      
      toast({
        title: t("ideas.approveError"),
        description: errorMessage || t("ideas.approveErrorDesc"),
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

  const handleCompleteIdea = (ideaId: number) => {
    if (window.confirm(t("ideas.confirmComplete"))) {
      completeMutation.mutate(ideaId);
    }
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
  const allIdeas = mode === "published" ? ideas : pendingIdeas;
  
  // Filter ideas based on completion status (only for published ideas)
  const displayedIdeas = mode === "published" && allIdeas
    ? allIdeas.filter(idea => 
        showCompleted ? idea.status === 'completed' : idea.status !== 'completed'
      )
    : allIdeas;

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

  // Render truly empty state (no ideas at all)
  if (!allIdeas || allIdeas.length === 0) {
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
    // Sort ideas by vote count (descending) - most voted first
    const sortedIdeas = displayedIdeas ? [...displayedIdeas].sort((a, b) => b.votes - a.votes) : [];
    
    return (
      <>
        {/* Filter Toggle - Show when there are ideas */}
        {allIdeas && allIdeas.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setShowCompleted(false)}
              variant={!showCompleted ? "default" : "outline"}
              size="sm"
              className="font-semibold"
            >
              {t("ideas.showActive")}
            </Button>
            <Button
              onClick={() => setShowCompleted(true)}
              variant={showCompleted ? "default" : "outline"}
              size="sm"
              className="font-semibold"
            >
              {t("ideas.showCompleted")}
            </Button>
          </div>
        )}

        {sortedIdeas.length > 0 ? (
          <div className="space-y-4">
            {sortedIdeas.map((idea, index) => (
              <IdeaListView
                key={idea.id}
                idea={idea}
                position={index + 1} // 1-based position
                onVote={handleVote}
                onEdit={
                  user && idea.creatorId === user.id ? handleEditIdea : undefined
                }
                onComplete={
                  user && idea.creatorId === user.id
                    ? handleCompleteIdea
                    : undefined
                }
                onDelete={
                  user && idea.creatorId === user.id
                    ? handleDeleteIdea
                    : undefined
                }
                onOpenTemplate={
                  user && idea.creatorId === user.id ? onOpenTemplate : undefined
                }
                isVoting={votingIdeaIds.has(idea.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {showCompleted
                ? t("ideas.noCompletedIdeas")
                : t("ideas.noActiveIdeas")}
            </p>
            <p className="text-muted-foreground text-sm">
              {showCompleted
                ? t("ideas.noCompletedIdeasDesc")
                : t("ideas.noActiveIdeasDesc")}
            </p>
          </div>
        )}

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
      <div className="space-y-4">
        {displayedIdeas && displayedIdeas.map((idea, index) => (
          <div
            key={idea.id}
            className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 hover:bg-white/90 dark:hover:bg-gray-900/90 hover:shadow-lg transition-all duration-300 hover:border-gray-300/60 dark:hover:border-gray-600/60"
          >
            <div className="flex items-start gap-4">
              {/* Position */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 min-w-[2rem] text-center">
                  #{index + 1}
                </div>
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 text-xs mt-1"
                >
                  <Clock className="h-3 w-3 mr-1" /> {t("ideas.pending", "Pendiente")}
                </Badge>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {idea.title}
                    </h3>
                    {idea.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {idea.description}
                      </p>
                    )}
                    
                    {/* Suggested by info */}
                    {idea.suggestedByUsername && (
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          {t("ideas.suggestedBy")}: {idea.suggestedByUsername}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Button
                      onClick={() => handleReject(idea.id)}
                      disabled={processingIdea === idea.id}
                      variant="outline"
                      size="sm"
                      className="border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
                    >
                      {processingIdea === idea.id && rejectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          {t("ideas.reject", "Rechazar")}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleApprove(idea.id)}
                      disabled={processingIdea === idea.id}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      {processingIdea === idea.id && approveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t("ideas.approve", "Aprobar")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
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
