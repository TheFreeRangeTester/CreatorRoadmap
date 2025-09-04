import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Grid3x3,
  Store,
  Activity,
  User,
  Package,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useReactiveStats } from "@/hooks/use-reactive-stats";
import { queryClient, apiRequest } from "@/lib/queryClient";
import IdeaForm from "@/components/idea-form";
import DeleteConfirmation from "@/components/delete-confirmation";
import CreatorControls from "@/components/creator-controls";
import { MobileMenu } from "@/components/mobile-menu";
import { IdeaResponse } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { IdeasTabView } from "@/components/ideas-tab-view";
import { StoreManagement } from "@/components/store-management";
import { RedemptionManagement } from "@/components/redemption-management";
import { ModernSidebar } from "@/components/modern-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { UserIndicator } from "@/components/user-indicator";
import AudienceStats from "@/components/audience-stats";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addVote } = useReactiveStats();
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ideaToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("published");
  const [activeSection, setActiveSection] = useState<"ideas" | "store" | "activity">("ideas");

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

  const handleSectionChange = (section: "ideas" | "store" | "activity") => {
    setActiveSection(section);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "store":
        return <StoreManagement />;
      case "activity":
        return <AudienceStats />;
      case "ideas":
      default:
        return (
          <div className="space-y-6">
            {/* Creator Controls */}
            {user?.userRole === "creator" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50"
              >
                <CreatorControls onAddIdea={handleAddIdea} />
              </motion.div>
            )}

            {/* Ideas Content */}
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
                    <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
                      <TabsTrigger value="published" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                        <Grid3x3 className="h-4 w-4 mr-2" />
                        {t("ideas.published", "Published")}
                      </TabsTrigger>
                      <TabsTrigger value="suggested" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 relative">
                        <User className="h-4 w-4 mr-2" />
                        {t("ideas.suggested", "Suggested")}
                        {pendingIdeas && pendingIdeas.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {pendingIdeas.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="store" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                        <Store className="h-4 w-4 mr-2" />
                        {t("store.title", "Store")}
                      </TabsTrigger>
                      <TabsTrigger value="redemptions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                        <Package className="h-4 w-4 mr-2" />
                        {t("redemptions.title", "Redemptions")}
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
                  <IdeasTabView mode="published" />
                )}
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ModernSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isAuthenticated={!!user}
          isOwnProfile={true}
          user={user}
        />
      </div>

      {/* Desktop User Indicator */}
      <div className="hidden lg:block fixed top-4 right-4 z-50">
        <UserIndicator user={user} variant="desktop" />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fanlist
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {user && <UserIndicator user={user} variant="mobile" />}
            <MobileMenu 
              username={user?.username}
              isCreatorProfile={true}
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex lg:pt-0 pt-16">
        {/* Content */}
        <div className="flex-1 lg:ml-64 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto"
            >
              {/* Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  {t("common.hello", "Hola")}, {user?.username || "Creator"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t("dashboard.welcome", "Bienvenido a tu panel de ideas")}
                </p>
              </motion.div>

              {/* Main Content */}
              {renderMainContent()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
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