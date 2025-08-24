import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Loader2,
  Lightbulb,
  User,
  ListFilter,
  Gift,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useReactiveStats } from "@/hooks/use-reactive-stats";
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
import { Link } from "wouter";
import { IdeaResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { IdeasTabView } from "@/components/ideas-tab-view";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { IdeaLimitNotice } from "@/components/idea-limit-notice";
import { PointsDisplay } from "@/components/points-display";
import { StoreManagement } from "@/components/store-management";
import { RedemptionManagement } from "@/components/redemption-management";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import logoPng from "@/assets/logo.png";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addVote } = useReactiveStats();
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ideaToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("published");

  // Fetch ideas
  const {
    data: ideas,
    isLoading,
    isError,
  } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/ideas"],
  });

  // Fetch pending ideas count for badge (only for creators)
  const { data: pendingIdeas } = useQuery<IdeaResponse[]>({
    queryKey: ["/api/pending-ideas"],
    enabled: user?.userRole === "creator",
  });

  // State to track which ideas are being voted on
  const [votingIdeaIds, setVotingIdeaIds] = useState<Set<number>>(new Set());

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      // Add ideaId to the set of ideas being voted on
      setVotingIdeaIds((prev) => new Set(prev).add(ideaId));
      try {
        await apiRequest(`/api/ideas/${ideaId}/vote`, { method: "POST" });
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
      console.log("[VOTE] Vote successful, updating reactive stats");
      
      // Update reactive stats immediately for instant UI update
      addVote();
      
      // Also invalidate cache for server sync
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/ideas"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/user/points"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/user/audience-stats"] })
        ]);
        console.log("[CACHE] Cache invalidation completed");
      } catch (error) {
        console.error("[CACHE] Error during cache invalidation:", error);
      }
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
      await apiRequest(`/api/ideas/${ideaId}`, { method: "DELETE" });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-white/90 via-white/85 to-white/90 dark:from-gray-900/90 dark:via-gray-900/85 dark:to-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg sticky top-0 z-10"
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title section - responsive */}
            <motion.div
              className="flex items-center min-w-0 flex-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <img
                  src={logoPng}
                  alt="Logo"
                  className="h-7 sm:h-10 w-auto flex-shrink-0"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-sm animate-pulse"></div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  {t("dashboard.appName", "Fanlist")}
                </h1>
              </div>
            </motion.div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t("common.profile", "Perfil")}
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {t("common.logout")}
                    </Button>
                  </motion.div>
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

            {/* Mobile layout - three sections */}
            <div className="md:hidden flex items-center justify-between w-full">
              {/* Left section - Logo and title */}
              <div className="flex items-center min-w-0 flex-1">
                <img
                  src={logoPng}
                  alt="Logo"
                  className="h-7 w-auto flex-shrink-0"
                />
                <div className="ml-2 min-w-0 flex-1">
                  <h1 className="text-base font-bold text-neutral-800 dark:text-white truncate">
                    {t("dashboard.appName", "Fanlist")}
                  </h1>
                </div>
              </div>

              {/* Center section - Mobile menu */}
              <div className="flex-1 flex justify-center">
                <MobileMenu
                  onLogout={handleLogout}
                  iconColor="text-foreground"
                />
              </div>

              {/* Right section - Toggles */}
              <div className="flex-1 flex justify-end items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-6">
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

                {/* Tabs for ideas view - Only for creators */}
                {user.userRole === "creator" ? (
                  <>
                    <IdeaLimitNotice />
                    <CreatorControls onAddIdea={handleAddIdea} />
                    <LeaderboardInfo />
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                        <TabsList className="hidden md:grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
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
                          <TabsTrigger
                            value="store"
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              {t("dashboard.store", "Tienda de Puntos")}
                            </span>
                            <span className="xs:hidden">
                              {t("dashboard.store", "Tienda")}
                            </span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="redemptions"
                            className="flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              {t("dashboard.redemptions", "Canjes")}
                            </span>
                            <span className="xs:hidden">
                              {t("dashboard.redemptions", "Canjes")}
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

                      <TabsContent value="store" className="mt-0 space-y-4">
                        <StoreManagement />
                      </TabsContent>

                      <TabsContent value="redemptions" className="mt-0 space-y-4">
                        <RedemptionManagement />
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

      {/* Mobile Bottom Navigation - Only for creators */}
      {user?.userRole === "creator" && (
        <MobileBottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingIdeas?.length || 0}
        />
      )}
    </div>
  );
}
