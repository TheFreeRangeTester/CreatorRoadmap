import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CloudLightning, Share2, CheckCircle, XCircle, Lightbulb, Clock, ChevronRight, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import LeaderboardInfo from "@/components/leaderboard-info";
import EmptyState from "@/components/empty-state";
import ShareProfile from "@/components/share-profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { IdeaResponse } from "@shared/schema";

function PendingIdeasPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingIdea, setProcessingIdea] = useState<number | null>(null);

  // Fetch pending ideas
  const { data: pendingIdeas, isLoading, refetch } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/pending-ideas"],
    enabled: !!user,
  });

  // Approve idea mutation
  const approveMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      setProcessingIdea(ideaId);
      const response = await apiRequest("PATCH", `/api/ideas/${ideaId}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Idea aprobada",
        description: "La idea ha sido publicada en tu leaderboard.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      // Refrescar la lista de ideas pendientes y aprobadas
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al aprobar la idea",
        description: error.message || "No se pudo aprobar la idea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingIdea(null);
    }
  });

  // Delete idea mutation (rechazar)
  const rejectMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      setProcessingIdea(ideaId);
      await apiRequest("DELETE", `/api/ideas/${ideaId}`);
    },
    onSuccess: () => {
      toast({
        title: "Idea rechazada",
        description: "La idea ha sido eliminada.",
      });
      // Refrescar la lista de ideas pendientes
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al rechazar la idea",
        description: error.message || "No se pudo rechazar la idea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingIdea(null);
    }
  });

  // Handle approve idea
  const handleApprove = (ideaId: number) => {
    approveMutation.mutate(ideaId);
  };

  // Handle reject idea
  const handleReject = (ideaId: number) => {
    rejectMutation.mutate(ideaId);
  };

  if (!user) return null;

  return (
    <Card className="shadow-sm border-gray-200 dark:border-gray-800">
      <CardHeader className="bg-muted/20 dark:bg-gray-800/50 pb-3 border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Ideas Sugeridas
        </CardTitle>
        <CardDescription>
          Ideas que tus seguidores han sugerido
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !pendingIdeas || pendingIdeas.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-muted-foreground text-sm">
              No tienes ideas pendientes para revisar
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] px-4 py-2">
            <div className="space-y-4 pr-4">
              {pendingIdeas.map((idea) => (
                <div key={idea.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                  <div className="mb-1 flex justify-between items-start">
                    <h3 className="font-medium text-base dark:text-white">{idea.title}</h3>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                      <Clock className="h-3 w-3 mr-1" /> Pendiente
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{idea.description}</p>
                  
                  {idea.suggestedByUsername && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Sugerido por: <span className="font-medium">{idea.suggestedByUsername}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
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
                      Rechazar
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
                      Aprobar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<number | null>(null);

  // Fetch ideas
  const { data: ideas, isLoading, isError } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/ideas"],
  });

  // State to track which ideas are being voted on
  const [votingIdeaIds, setVotingIdeaIds] = useState<Set<number>>(new Set());

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      // Add ideaId to the set of ideas being voted on
      setVotingIdeaIds(prev => new Set(prev).add(ideaId));
      try {
        await apiRequest("POST", `/api/ideas/${ideaId}/vote`);
      } finally {
        // Remove ideaId from the set when done (success or error)
        setTimeout(() => {
          setVotingIdeaIds(prev => {
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
      await apiRequest("DELETE", `/api/ideas/${ideaId}`);
    },
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea deleted",
        description: "Your idea has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddIdea = () => {
    setCurrentIdea(null);
    setIsIdeaFormOpen(true);
  };

  const handleEditIdea = (idea: IdeaResponse) => {
    setCurrentIdea(idea);
    setIsIdeaFormOpen(true);
  };

  const handleDeleteIdea = (ideaId: number) => {
    setIdeaToDelete(ideaId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ideaToDelete !== null) {
      deleteMutation.mutate(ideaToDelete);
    }
  };

  const handleVote = (ideaId: number) => {
    voteMutation.mutate(ideaId);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CloudLightning className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-bold text-neutral-800 dark:text-white">
                Idea Leaderboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 px-3 py-1 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <User className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">{user.username}</span>
                  </Badge>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link href="/auth">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900">
                      Log in
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Creator Controls (always visible when logged in) */}
        {user && <CreatorControls onAddIdea={handleAddIdea} />}
        
        {/* Main content for both authenticated and non-authenticated users */}
        <div className="mt-6">
          {/* Two-column layout for authenticated users */}
          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content area - leaderboard (2/3 width on larger screens) */}
              <div className="lg:col-span-2 space-y-6">
                <LeaderboardInfo />
                
                {/* Ideas listing */}
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Failed to load ideas. Please try again.
                  </div>
                ) : ideas && ideas.length > 0 ? (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {ideas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onVote={handleVote}
                        onEdit={user && idea.creatorId === user.id ? handleEditIdea : undefined}
                        onDelete={user && idea.creatorId === user.id ? handleDeleteIdea : undefined}
                        isVoting={votingIdeaIds.has(idea.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState onAddIdea={user ? handleAddIdea : undefined} />
                )}
              </div>
              
              {/* Sidebar for sharing profile and pending ideas (1/3 width on larger screens) */}
              <div className="lg:col-span-1 space-y-6">
                <ShareProfile />
                <PendingIdeasPanel />
              </div>
            </div>
          ) : (
            // For non-authenticated users, show full-width leaderboard
            <div className="space-y-6">
              <LeaderboardInfo />

              {/* Content */}
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Failed to load ideas. Please try again.
                </div>
              ) : ideas && ideas.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {ideas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onVote={handleVote}
                      isVoting={votingIdeaIds.has(idea.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <IdeaForm
        isOpen={isIdeaFormOpen}
        idea={currentIdea}
        onClose={() => setIsIdeaFormOpen(false)}
      />

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
