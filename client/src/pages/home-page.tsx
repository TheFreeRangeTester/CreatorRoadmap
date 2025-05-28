import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Lightbulb,
  Clock,
  User,
  ListFilter,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
import { MobileMenu } from "@/components/mobile-menu";
import LeaderboardInfo from "@/components/leaderboard-info";
import EmptyState from "@/components/empty-state";
import ShareProfile from "@/components/share-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { IdeaResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { IdeasTabView } from "@/components/ideas-tab-view";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<number | null>(null);

  // Fetch ideas
  const {
    data: ideas,
    isLoading,
    isError,
  } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/ideas"],
  });

  // State to track which ideas are being voted on
  const [votingIdeaIds, setVotingIdeaIds] = useState<Set<number>>(new Set());

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      // Add ideaId to the set of ideas being voted on
      setVotingIdeaIds((prev) => new Set(prev).add(ideaId));
      try {
        await apiRequest("POST", `/api/ideas/${ideaId}/vote`);
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
      await apiRequest("DELETE", `/api/ideas/${ideaId}`);
    },
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: t("ideas.deleted", "Idea deleted"),
        description: t(
          "ideas.deletedSuccess",
          "Your idea has been deleted successfully."
        ),
      });
    },
    onError: (error) => {
      toast({
        title: t("ideas.deleteError", "Delete failed"),
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
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title section - responsive */}
            <div className="flex items-center min-w-0 flex-1">
              <img
                src={new URL("@/assets/logo.png", import.meta.url).href}
                alt="Logo"
                className="h-7 sm:h-8 w-auto flex-shrink-0"
              />
              <div className="ml-2 min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-neutral-800 dark:text-white truncate">
                  {t("dashboard.appName", "Fanlist")}
                </h1>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {t("common.profile", "Perfil")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {t("common.logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth">
                    <Button variant="outline" size="sm">
                      {t("common.login")}
                    </Button>
                  </Link>
                  <Link href="/auth?register=true">
                    <Button size="sm">{t("common.register")}</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu - solo burger menu */}
            <div className="md:hidden">
              <MobileMenu onLogout={handleLogout} iconColor="text-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Main content for both authenticated and non-authenticated users */}
        <div className="mt-4 sm:mt-6">
          {user ? (
            // Responsive layout for authenticated users
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Main content area (2/3 width on larger screens) */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {t("dashboard.welcome", "Hola")},{" "}
                      <span className="text-primary">{user.username}</span>
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {t(
                        "dashboard.welcomeSubtitle",
                        "Bienvenido a tu panel de ideas"
                      )}
                    </p>
                  </div>
                </div>

                <LeaderboardInfo />

                {/* Tabs for ideas view - Only for creators */}
                {user.userRole === "creator" ? (
                  <>
                    <CreatorControls onAddIdea={handleAddIdea} />
                    <Tabs defaultValue="published" className="w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                        <TabsList className="grid grid-cols-2 w-full sm:w-60">
                          <TabsTrigger
                            value="published"
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <ListFilter className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              {t("dashboard.myIdeas", "Mis Ideas")}
                            </span>
                            <span className="xs:hidden">
                              {t("dashboard.published", "Ideas")}
                            </span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="suggested"
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              {t("dashboard.suggested", "Sugeridas")}
                            </span>
                            <span className="xs:hidden">
                              {t("dashboard.suggestions", "Sugeridas")}
                            </span>
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
                  </>
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
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  {t("dashboard.welcomeGuest", "Bienvenido a Fanlist")}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {t(
                    "dashboard.welcomeGuestSubtitle",
                    "Descubre y vota por las mejores ideas"
                  )}
                </p>
              </div>

              <LeaderboardInfo />

              {/* Ideas listing for non-authenticated users */}
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {t("ideas.loadError")}
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
