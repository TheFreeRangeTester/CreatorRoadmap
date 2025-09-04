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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useReactiveStats } from "@/hooks/use-reactive-stats";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
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
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50 sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fanlist
              </h1>
              {user && (
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("common.hello", "Hola")}, {user.username}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <LanguageToggle />
              {user?.userRole === "audience" && <PointsDisplay />}
              <Link href="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t("navigation.profile", "Perfil")}
                </Button>
              </Link>
              <UserIndicator user={user} variant="desktop" />
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t("auth.logout", "Salir")}
              </Button>
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
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                    {t("navigation.profile", "Perfil")}
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
                  {t("auth.logout", "Salir")}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {t("dashboard.welcome", "Bienvenido a tu panel de ideas")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {user?.userRole === "creator" ? 
                t("dashboard.creatorDescription", "Gestiona tus ideas y conecta con tu audiencia") :
                t("dashboard.audienceDescription", "Participa votando y sugiriendo ideas")
              }
            </p>
          </motion.div>

          {/* Creator Controls */}
          {user?.userRole === "creator" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50 mb-6"
            >
              <CreatorControls onAddIdea={handleAddIdea} />
            </motion.div>
          )}

          {/* Main Ideas Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                {t("dashboard.topIdeas", "Top Ideas")}
              </h2>
              
              {user?.userRole === "creator" ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl">
                    <TabsTrigger 
                      value="published" 
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-xl transition-all"
                    >
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t("ideas.published", "Publicadas")}</span>
                      <span className="sm:hidden">{t("ideas.published", "Pub.")}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="suggested" 
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-xl transition-all relative"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t("ideas.suggested", "Sugeridas")}</span>
                      <span className="sm:hidden">{t("ideas.suggested", "Sug.")}</span>
                      {pendingIdeas && pendingIdeas.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingIdeas.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="store" 
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-xl transition-all"
                    >
                      <Store className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t("store.title", "Tienda")}</span>
                      <span className="sm:hidden">{t("store.short", "Tienda")}</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="redemptions" 
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-xl transition-all"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t("redemptions.title", "Canjes")}</span>
                      <span className="sm:hidden">{t("redemptions.short", "Canjes")}</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="published" className="mt-6">
                    <IdeasTabView mode="published" />
                  </TabsContent>
                  
                  <TabsContent value="suggested" className="mt-6">
                    <IdeasTabView mode="suggested" />
                  </TabsContent>
                  
                  <TabsContent value="store" className="mt-6">
                    <StoreManagement />
                  </TabsContent>
                  
                  <TabsContent value="redemptions" className="mt-6">
                    <RedemptionManagement />
                  </TabsContent>
                </Tabs>
              ) : (
                // Audience view - just show published ideas and their stats
                <div className="space-y-6">
                  <IdeasTabView mode="published" />
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
                    <AudienceStats />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {isIdeaFormOpen && (
        <IdeaForm
          idea={currentIdea}
          onClose={() => setIsIdeaFormOpen(false)}
          onSuccess={() => {
            setIsIdeaFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
          }}
        />
      )}
      
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}