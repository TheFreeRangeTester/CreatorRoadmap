import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Grid3x3,
  Store,
  Package,
  User,
  Menu,
  X,
  BarChart3,
  Plus,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useReactiveStats } from "@/hooks/use-reactive-stats";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
import VideoTemplateModal from "@/components/video-template-modal";
import { IdeaResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { IdeasTabView } from "@/components/ideas-tab-view";
import { StoreManagement } from "@/components/store-management";
import { RedemptionManagement } from "@/components/redemption-management";
import { UserIndicator } from "@/components/user-indicator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { PointsDisplay } from "@/components/points-display";
import { Link } from "wouter";
import AudienceStats from "@/components/audience-stats";
import { DashboardOverview } from "@/components/dashboard-overview";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { SimpleFAB } from "@/components/floating-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import logoSvg from "@/assets/fanlistlogo.svg";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);
  const [isCreatorActionsOpen, setIsCreatorActionsOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [currentTemplateIdea, setCurrentTemplateIdea] =
    useState<IdeaResponse | null>(null);

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
          queryClient.invalidateQueries({
            queryKey: ["/api/user/audience-stats"],
          }),
        ]);
        console.log("[CACHE] Cache invalidation completed");
      } catch (error) {
        console.error("[CACHE] Error during cache invalidation:", error);
      }
    },
    onError: (error) => {
      toast({
        title: t("vote.error"),
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
        title: t("ideas.deleted"),
        description: t("ideas.deletedSuccess"),
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

  const handleAddIdea = () => {
    setCurrentIdea(null);
    setIsIdeaFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ideaToDelete !== null) {
      deleteMutation.mutate(ideaToDelete);
    }
  };

  const handleOpenTemplate = (idea: IdeaResponse) => {
    setCurrentTemplateIdea(idea);
    setIsTemplateModalOpen(true);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const activeIdeasCount = ideas?.filter(i => i.status !== 'completed').length || 0;
  const totalVotesCount = ideas?.reduce((sum, idea) => sum + idea.votes, 0) || 0;

  const ideasSection = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {user?.userRole === "creator" ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Clean Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-6 mb-6">
            <button
              onClick={() => setActiveTab("published")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "published"
                  ? "text-primary border-primary"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              data-testid="nav-ideas"
            >
              {t("ideas.published", "Ideas")}
            </button>
            <button
              onClick={() => setActiveTab("suggested")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors relative ${
                activeTab === "suggested"
                  ? "text-primary border-primary"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              data-testid="nav-suggested"
            >
              {t("ideas.suggested", "Suggested")}
              {pendingIdeas && pendingIdeas.length > 0 && (
                <span className="absolute -top-1 -right-4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingIdeas.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "store"
                  ? "text-primary border-primary"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              data-testid="nav-store"
            >
              {t("store.title", "Store")}
            </button>
            <button
              onClick={() => setActiveTab("redemptions")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "redemptions"
                  ? "text-primary border-primary"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              data-testid="nav-redemptions"
            >
              {t("redemptions.title", "Redemptions")}
            </button>
          </nav>

          {/* Stats Badges - Only show on Ideas tab */}
          {activeTab === "published" && (
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                <span className="text-primary">📈</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {activeIdeasCount} {t("ideas.activeIdeas", "Ideas Activas")}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                <span className="text-pink-500">❤️</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {totalVotesCount} {t("ideas.totalVotes", "Votos Totales")}
                </span>
              </div>
            </div>
          )}

          <TabsContent value="published" className="mt-0">
            <IdeasTabView
              mode="published"
              onOpenTemplate={handleOpenTemplate}
            />
          </TabsContent>

          <TabsContent value="suggested" className="mt-0">
            <IdeasTabView mode="suggested" />
          </TabsContent>

          <TabsContent value="store" className="mt-0">
            <StoreManagement />
          </TabsContent>

          <TabsContent value="redemptions" className="mt-0">
            <RedemptionManagement />
          </TabsContent>
        </Tabs>
      ) : (
        // Audience view - just show published ideas and their stats
        <div className="space-y-6">
          <IdeasTabView mode="published" />
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            <AudienceStats isVisible={true} />
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700 sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src={logoSvg} alt="Fanlist" className="h-10 w-auto" />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />
              {user?.userRole === "audience" && <PointsDisplay />}
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t("navigation.profile")}
                </Button>
              </Link>
              <UserIndicator user={user} variant="desktop" />
              {user?.userRole === "creator" && (
                <Button
                  onClick={handleAddIdea}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-5"
                  data-testid="header-create-idea"
                >
                  {t("ideas.newIdea", "Nueva Idea")}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {user && <UserIndicator user={user} variant="mobile" />}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 py-4"
            >
              <div className="flex flex-col gap-3">
                {user?.userRole === "audience" && (
                  <div className="px-2">
                    <PointsDisplay />
                  </div>
                )}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>
                <Link href="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t("navigation.profile")}
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t("common.logout")}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8 max-w-6xl mx-auto">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Dialog
              open={isMetricsDialogOpen}
              onOpenChange={setIsMetricsDialogOpen}
            >
              <DialogContent className="lg:hidden max-w-md w-[calc(100%-2rem)] border-none bg-white/95 dark:bg-gray-900/95 p-6 pb-7 rounded-3xl shadow-[0_25px_60px_-20px_rgba(79,70,229,0.45)]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-1 text-left">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t("dashboard.quickMetricsTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                      {t("dashboard.quickMetricsSubtitle")}
                    </DialogDescription>
                  </div>
                  <DashboardOverview variant="modal" />
                </motion.div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isCreatorActionsOpen}
              onOpenChange={setIsCreatorActionsOpen}
            >
              <DialogContent className="lg:hidden max-w-md w-[calc(100%-1.5rem)] border-none bg-white/95 dark:bg-gray-900/95 p-0 rounded-3xl shadow-[0_25px_60px_-20px_rgba(79,70,229,0.45)]">
                <CreatorControls
                  onAddIdea={() => {
                    setIsCreatorActionsOpen(false);
                    handleAddIdea();
                  }}
                />
              </DialogContent>
            </Dialog>

            {ideasSection}
          </div>

          {/* Stats Sidebar - Desktop Only */}
          {user?.userRole === "creator" && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  {t("dashboard.statsTitle", "Estadísticas")}
                </h3>
                <DashboardOverview variant="sidebar" />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {user?.userRole === "creator" && (
        <>
          <MobileBottomNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingCount={pendingIdeas?.length || 0}
          />
          {/* Mobile FAB for creating ideas */}
          <SimpleFAB
            onClick={handleAddIdea}
            icon={<Plus className="w-6 h-6" />}
            label={t("ideas.addIdea")}
            testId="fab-create-idea"
            className="bottom-20"
          />
        </>
      )}

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

      {currentTemplateIdea && (
        <VideoTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          idea={currentTemplateIdea}
        />
      )}
    </div>
  );
}
