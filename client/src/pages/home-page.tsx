import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CloudLightning, Link as LinkIcon, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
import LeaderboardInfo from "@/components/leaderboard-info";
import EmptyState from "@/components/empty-state";
import PublicLinksManager from "@/components/public-links-manager";
import { Link } from "wouter";
import { IdeaResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CloudLightning className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-bold text-neutral-800">
                Idea Leaderboard
              </h1>
            </div>
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-neutral-600">
                    Hello, {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link href="/auth">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Log in
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Creator Controls (outside of tabs, always visible when logged in) */}
        {user && <CreatorControls onAddIdea={handleAddIdea} />}
        
        {/* Tabs appear for authenticated users */}
        {user ? (
          <Tabs defaultValue="leaderboard" className="mt-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <CloudLightning className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="public-links" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Public Links
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="leaderboard" className="space-y-4">
              {/* Leaderboard Info */}
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
                      onEdit={user && idea.creatorId === user.id ? handleEditIdea : undefined}
                      onDelete={user && idea.creatorId === user.id ? handleDeleteIdea : undefined}
                      isVoting={voteMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState onAddIdea={user ? handleAddIdea : undefined} />
              )}
            </TabsContent>
            
            <TabsContent value="public-links">
              <PublicLinksManager />
            </TabsContent>
          </Tabs>
        ) : (
          // For non-authenticated users, show just the leaderboard
          <div className="mb-8">
            {/* Leaderboard Info */}
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
                    isVoting={voteMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        )}
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
