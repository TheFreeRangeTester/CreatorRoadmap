import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Loader2, CloudLightning, Share2, CheckCircle, XCircle, 
  Lightbulb, Clock, ChevronRight, User, ListFilter 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import LeaderboardInfo from "@/components/leaderboard-info";
import EmptyState from "@/components/empty-state";
import ShareProfile from "@/components/share-profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { IdeaResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

function IdeasTabView({ mode = "published" }: { mode: "published" | "suggested" }) {
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
    isError: isErrorIdeas 
  } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/ideas"],
    enabled: mode === "published",
  });

  // Fetch pending ideas
  const { 
    data: pendingIdeas, 
    isLoading: isLoadingPending, 
    isError: isErrorPending,
    refetch: refetchPending
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
      const response = await apiRequest("PATCH", `/api/ideas/${ideaId}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('ideas.approved'),
        description: t('ideas.approvedSuccess'),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      // Refresh pending and approved ideas lists
      refetchPending();
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error: Error) => {
      toast({
        title: t('ideas.approveError'),
        description: error.message || t('ideas.approveErrorDesc'),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingIdea(null);
    }
  });

  // Reject idea mutation
  const rejectMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      setProcessingIdea(ideaId);
      await apiRequest("DELETE", `/api/ideas/${ideaId}`);
    },
    onSuccess: () => {
      toast({
        title: t('ideas.rejected'),
        description: t('ideas.rejectedSuccess'),
      });
      // Refresh the list of pending ideas
      refetchPending();
    },
    onError: (error: Error) => {
      toast({
        title: t('ideas.rejectError'),
        description: error.message || t('ideas.rejectErrorDesc'),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingIdea(null);
    }
  });

  // Handle functions
  const handleVote = (ideaId: number) => {
    voteMutation.mutate(ideaId);
  };

  const handleDeleteIdea = (ideaId: number) => {
    if (window.confirm(t('ideas.confirmDelete'))) {
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
        {t('ideas.loadError')}
      </div>
    );
  }

  // Render empty state
  if (!displayedIdeas || displayedIdeas.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === "published" 
            ? t('ideas.noPublishedIdeas') 
            : t('ideas.noSuggestedIdeas')}
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          {mode === "published" 
            ? t('ideas.createFirstIdea') 
            : t('ideas.suggestedIdeasWillAppear')}
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
              onEdit={user && idea.creatorId === user.id ? handleEditIdea : undefined}
              onDelete={user && idea.creatorId === user.id ? handleDeleteIdea : undefined}
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
          <div key={idea.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-2 flex justify-between items-start">
              <h3 className="font-medium text-lg dark:text-white">{idea.title}</h3>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                <Clock className="h-3 w-3 mr-1" /> {t('ideas.pending')}
              </Badge>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-3">{idea.description}</p>
            
            {idea.suggestedByUsername && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                {t('ideas.suggestedBy')}: <span className="font-medium">{idea.suggestedByUsername}</span>
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
                {t('ideas.reject')}
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
                {t('ideas.approve')}
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

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t('ideas.deleted', "Idea deleted"),
        description: t('ideas.deletedSuccess', "Your idea has been deleted successfully."),
      });
    },
    onError: (error) => {
      toast({
        title: t('ideas.deleteError', "Delete failed"),
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
              <div className="ml-2">
                <h1 className="text-xl font-bold text-neutral-800 dark:text-white">
                  {t('dashboard.creatorDashboard', 'Idea Leaderboard')}
                </h1>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-300 h-5 rounded-sm">
                    {t('dashboard.creatorView', 'Panel de creador')}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 px-3 py-1 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                      <User className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
                      <span className="font-medium">{user.username}</span>
                    </Badge>
                  </Link>
                  <LanguageToggle />
                  <ThemeToggle />
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    size="sm"
                    className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('common.logout', 'Log out')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <LanguageToggle />
                  <ThemeToggle />
                  <Link href="/auth">
                    <Button size="sm" className="ml-1">
                      {t('common.login', 'Log in')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu */}
            <MobileMenu onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Creator Controls (solo visible para creadores) */}
        {user && user.userRole === 'creator' && <CreatorControls onAddIdea={handleAddIdea} />}
        
        {/* Main content for both authenticated and non-authenticated users */}
        <div className="mt-6">
          {user ? (
            // Two-column layout for authenticated users
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content area (2/3 width on larger screens) */}
              <div className="lg:col-span-2 space-y-6">
                <LeaderboardInfo />
                
                {/* Tabs for ideas view - Only for creators */}
                {user.userRole === 'creator' ? (
                  <Tabs defaultValue="published" className="w-full">
                    <div className="flex justify-between items-center mb-6">
                      <TabsList className="grid grid-cols-2 w-60">
                        <TabsTrigger value="published" className="flex items-center gap-1">
                          <ListFilter className="w-4 h-4" />
                          {t('dashboard.myIdeas', 'Mis Ideas')}
                        </TabsTrigger>
                        <TabsTrigger value="suggested" className="flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          {t('dashboard.suggested', 'Sugeridas')}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="published" className="mt-0 space-y-4">
                      <IdeasTabView mode="published" />
                    </TabsContent>
                    
                    <TabsContent value="suggested" className="mt-0 space-y-4">
                      <IdeasTabView mode="suggested" />
                    </TabsContent>
                  </Tabs>
                ) : (
                  // Para usuarios no creadores, solo mostrar la lista de ideas
                  <div className="mt-0 space-y-4">
                    <IdeasTabView mode="published" />
                  </div>
                )}
              </div>
              
              {/* Sidebar for sharing (1/3 width on larger screens) */}
              <div className="lg:col-span-1 space-y-6">
                <ShareProfile />
              </div>
            </div>
          ) : (
            // For non-authenticated users, show full-width leaderboard
            <div className="space-y-6">
              <LeaderboardInfo />
              
              {/* Ideas listing for non-authenticated users */}
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {t('ideas.loadError')}
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
