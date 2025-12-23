import { useState, useEffect } from "react";
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
  ExternalLink,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  ArrowLeft,
  Lightbulb,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ModernSidebar } from "@/components/modern-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import SuggestIdeaModal from "@/components/suggest-idea-modal";
import AudienceStats from "@/components/audience-stats";
import { PublicStore } from "@/components/public-store";
import { MobileMenu } from "@/components/mobile-menu";
import { Top3Cards } from "@/components/top3-cards";
import { IdeasList } from "@/components/ideas-list";
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

  const isOwnProfile = user?.username === username;

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

      const userKey = `votedIdeas_${user.id}`;
      const updatedVotedIdeas = Array.from(new Set([...Array.from(votedIdeas), ideaId]));
      localStorage.setItem(userKey, JSON.stringify(updatedVotedIdeas));
      
      setVotedIdeas(prev => new Set([...Array.from(prev), ideaId]));

      toast({
        title: t("vote.success"),
        description: t("vote.successDesc"),
      });

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
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

  const renderIdeasSection = () => {
    if (isLoading) {
      return <LeaderboardSkeleton />;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                <Avatar className="w-16 h-16 border-2 border-gray-100 dark:border-gray-800 shadow-md">
                  <AvatarImage src={creator.logoUrl || ""} alt={creator.username} />
                  <AvatarFallback className="text-xl font-bold bg-primary text-white">
                    {creator.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {creator.username}
                </h2>
                {creator.profileDescription && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    {creator.profileDescription}
                  </p>
                )}

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <motion.a
                        key={link.platform}
                        href={formatSocialUrl(link.url!, link.platform)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid={`link-social-${link.platform}`}
                      >
                        {getSocialIcon(link.platform)}
                        <span className="capitalize">{link.platform}</span>
                      </motion.a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t("ideas.empty")}
            </p>
          </div>
        ) : (
          <>
            <Top3Cards
              ideas={ideas.slice(0, 3)}
              onVote={handleVote}
              isVoting={isVoting}
              votedIdeas={votedIdeas}
              user={user && !isOwnProfile ? user : null}
            />

            {ideas.length > 3 && (
              <IdeasList
                ideas={ideas.slice(3)}
                onVote={handleVote}
                isVoting={isVoting}
                votedIdeas={votedIdeas}
                user={user && !isOwnProfile ? user : null}
                startRank={4}
              />
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
      <AudienceStats isVisible={!!user} creatorId={data?.creator?.id} />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {user && !isOwnProfile && (
        <div className="hidden lg:flex fixed top-4 right-4 z-50 items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-md">
          <Coins className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-points-desktop">
            {userPoints?.totalPoints ?? 0}
          </span>
        </div>
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Fanlist
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user && !isOwnProfile && (
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-gray-900 dark:text-white" data-testid="text-points-mobile">
                  {userPoints?.totalPoints ?? 0}
                </span>
              </div>
            )}
            <MobileMenu 
              username={user?.username}
              isCreatorProfile={false}
              onRefresh={() => refetch()}
            />
          </div>
        </div>
      </div>

      <div className="flex lg:pt-0 pt-14">
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

        <main className={cn(
          "flex-1 p-4 md:p-6 transition-all duration-300",
          "lg:ml-64 mb-20 lg:mb-0"
        )}>
          <div className="max-w-5xl mx-auto">
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

      <div className="lg:hidden">
        <MobileBottomNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

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
