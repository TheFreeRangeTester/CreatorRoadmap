import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { IdeaResponse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2,
  Share2,
  ExternalLink,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ModernSidebar } from "@/components/modern-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { CompactIdeaCard } from "@/components/compact-idea-card";
import SuggestIdeaModal from "@/components/suggest-idea-modal";
import AudienceStats from "@/components/audience-stats";
import { PublicStore } from "@/components/public-store";
import { UserIndicator } from "@/components/user-indicator";
import { MobileMenu } from "@/components/mobile-menu";
import { Top3Podium } from "@/components/top3-podium";
import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";

interface CreatorPublicPageResponse {
  ideas: IdeaResponse[];
  creator: {
    id: number;
    username: string;
    profileDescription?: string | null;
    logoUrl?: string | null;
    twitterUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    tiktokUrl?: string | null;
    threadsUrl?: string | null;
    websiteUrl?: string | null;
    profileBackground?: string;
  };
}

export default function ModernPublicProfile() {
  const params = useParams();
  const [, navigate] = useLocation();
  const username = params?.username;
  const [activeSection, setActiveSection] = useState<"store" | "activity" | "ideas">("ideas");
  const [isVoting, setIsVoting] = useState<{ [key: number]: boolean }>({});
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, error, refetch } =
    useQuery<CreatorPublicPageResponse>({
      queryKey: [`/api/creators/${username}`],
      enabled: !!username,
    });

  // Check if current user is the profile owner
  const isOwnProfile = user?.username === username;

  // Query user points for this specific creator
  const { data: userPoints } = useQuery<{ totalPoints: number }>({
    queryKey: [`/api/user/points/${data?.creator?.id}`],
    enabled: !!user && !isOwnProfile && !!data?.creator?.id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t("common.error"),
        description: (error as Error).message || t("errors.loadingCreatorPage"),
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [error, navigate, toast]);

  // Load voted ideas from localStorage only for authenticated users
  useEffect(() => {
    if (user) {
      const userKey = `votedIdeas_${user.id}`;
      const votedIdeasFromStorage = JSON.parse(
        localStorage.getItem(userKey) || "[]"
      );
      setVotedIdeas(new Set(votedIdeasFromStorage));
    } else {
      setVotedIdeas(new Set());
    }
  }, [user]);

  // Check vote status for all ideas when data loads
  useEffect(() => {
    if (!data?.ideas || !user) {
      setVotedIdeas(new Set());
      return;
    }

    const checkVotedIdeas = async () => {
      const votedSet = new Set<number>();

      for (const idea of data.ideas) {
        try {
          const response = await fetch(
            `/api/creators/${username}/ideas/${idea.id}/vote-status`,
            {
              credentials: "include",
            }
          );

          if (response.ok) {
            const voteData = await response.json();
            if (voteData.hasVoted) {
              votedSet.add(idea.id);
            }
          }
        } catch (error) {
          console.error(
            `Error checking vote status for idea ${idea.id}:`,
            error
          );
        }
      }

      setVotedIdeas(votedSet);
    };

    checkVotedIdeas();
  }, [data?.ideas, user, username]);

  const handleVote = async (ideaId: number) => {
    if (!user || isOwnProfile) return;

    setIsVoting(prev => ({ ...prev, [ideaId]: true }));

    try {
      await apiRequest(`/api/creators/${username}/ideas/${ideaId}/vote`, {
        method: "POST",
      });

      // Update localStorage using the fresh state to avoid race condition
      const userKey = `votedIdeas_${user.id}`;
      const updatedVotedIdeas = Array.from(new Set([...Array.from(votedIdeas), ideaId]));
      localStorage.setItem(userKey, JSON.stringify(updatedVotedIdeas));
      
      setVotedIdeas(prev => new Set([...Array.from(prev), ideaId]));

      toast({
        title: t("vote.success"),
        description: t("vote.successDesc"),
      });

      // Invalidate points for this specific creator
      if (data?.creator?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/user/points/${data.creator.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/user/audience-stats"] });
      
      await refetch();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: t("vote.error"),
        description: t("vote.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter": return <Twitter className="h-4 w-4" />;
      case "instagram": return <Instagram className="h-4 w-4" />;
      case "youtube": return <Youtube className="h-4 w-4" />;
      case "tiktok": return <FaTiktok className="h-4 w-4" />;
      case "threads": return <FaThreads className="h-4 w-4" />;
      case "website": return <Globe className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const formatSocialUrl = (url: string, platform: string) => {
    if (!url) return "";
    
    if (url.startsWith("http")) return url;
    
    switch (platform) {
      case "twitter": return `https://twitter.com/${url.replace("@", "")}`;
      case "instagram": return `https://instagram.com/${url.replace("@", "")}`;
      case "youtube": return url.startsWith("@") ? `https://youtube.com/${url}` : `https://youtube.com/@${url}`;
      case "tiktok": return `https://tiktok.com/@${url.replace("@", "")}`;
      case "threads": return `https://threads.net/@${url.replace("@", "")}`;
      case "website": return url.startsWith("www.") ? `https://${url}` : url;
      default: return url;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("profile.notFound")}
          </h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const { ideas, creator } = data;
  const socialLinks = [
    { platform: "twitter", url: creator.twitterUrl },
    { platform: "instagram", url: creator.instagramUrl },
    { platform: "youtube", url: creator.youtubeUrl },
    { platform: "tiktok", url: creator.tiktokUrl },
    { platform: "threads", url: creator.threadsUrl },
    { platform: "website", url: creator.websiteUrl },
  ].filter(link => link.url);

  const renderProfileSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Creator Info Card */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={creator.logoUrl || ""} alt={creator.username} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {creator.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                {creator.username}
              </h1>
              {creator.profileDescription && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {creator.profileDescription}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.platform}
                      href={formatSocialUrl(link.url!, link.platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getSocialIcon(link.platform)}
                      <span className="capitalize">{link.platform}</span>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            {!isOwnProfile && user && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-shrink-0"
              >
                <Button
                  onClick={() => setSuggestDialogOpen(true)}
                  disabled={!userPoints || userPoints.totalPoints < 3}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("suggest.idea")}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderIdeasSection = () => {
    if (isLoading) {
      return <LeaderboardSkeleton />;
    }

    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Creator Profile Info */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/50">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={creator.logoUrl || ""} alt={creator.username} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {creator.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                {creator.username}
              </h1>
              {creator.profileDescription && (
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                  {creator.profileDescription}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.platform}
                      href={formatSocialUrl(link.url!, link.platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getSocialIcon(link.platform)}
                      <span className="capitalize">{link.platform}</span>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Ideas Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {t("ideas.title")}
        </h2>
        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
          {ideas.length} {t("ideas.total")}
        </Badge>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t("ideas.empty")}
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {ideas.length > 0 && (
            <div className="mb-8">
              <Top3Podium
                ideas={ideas.slice(0, 3)}
                onVote={handleVote}
                user={user && !isOwnProfile ? user : null}
                votedIdeas={votedIdeas}
                isVoting={isVoting}
                successVote={null}
              />
            </div>
          )}

          {/* Other Ideas */}
          {ideas.length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("leaderboard.otherIdeas")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t("leaderboard.otherIdeasDesc")}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {ideas.slice(3).map((idea, index) => (
                  <CompactIdeaCard
                    key={idea.id}
                    rank={index + 4}
                    idea={idea}
                    isVoting={isVoting[idea.id]}
                    isVoted={votedIdeas.has(idea.id)}
                    onVote={handleVote}
                    isLoggedIn={!!user && !isOwnProfile}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
    );
  };

  const renderStoreSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PublicStore 
        creatorUsername={creator.username}
        isAuthenticated={!!user}
      />
    </motion.div>
  );

  const renderActivitySection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AudienceStats isVisible={!!user} />
    </motion.div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "ideas": return renderIdeasSection();
      case "store": return renderStoreSection();
      case "activity": return renderActivitySection();
      default: return renderIdeasSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
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
              isCreatorProfile={false}
              onRefresh={() => refetch()}
            />
          </div>
        </div>
      </div>
      

      {/* Main Layout */}
      <div className="flex lg:pt-0 pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <ModernSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isAuthenticated={!!user}
            isOwnProfile={isOwnProfile}
            userPoints={userPoints?.totalPoints}
            onSuggestClick={() => setSuggestDialogOpen(true)}
            user={user}
          />
        </div>

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 transition-all duration-300",
          "lg:ml-64 mb-20 lg:mb-0"
        )}>
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Suggest Idea Modal */}
      <SuggestIdeaModal
        username={creator.username}
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        onSuccess={async () => {
          setSuggestDialogOpen(false);
          await refetch();
        }}
      />
    </div>
  );
}