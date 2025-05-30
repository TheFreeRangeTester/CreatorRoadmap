
import React, { useState, useEffect } from "react";
import { useParams, useLocation, navigate } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import CreatorProfileHeader from "@/components/creator-profile-header";
import SuggestIdeaDialog from "@/components/suggest-idea-dialog";
import ShareProfile from "@/components/share-profile";
import MobileMenu from "@/components/mobile-menu";
import AudienceStats from "@/components/audience-stats";
import { 
  Heart, 
  Share2, 
  User, 
  ChevronUp, 
  ChevronDown, 
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ArrowLeft,
  Settings,
  Eye,
  RefreshCcw,
  LogOut
} from "lucide-react";

interface Creator {
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
}

interface Idea {
  id: number;
  title: string;
  description?: string;
  voteCount: number;
  status: string;
  createdAt: string;
  hasVoted?: boolean;
  rankChange?: number;
  isNew?: boolean;
}

interface VoteResponse {
  voteCount: number;
  hasVoted: boolean;
}

function CreatorProfileUnified() {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const [, setLocation] = useLocation();
  
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if this is the user's own profile
  const isOwnProfile = user?.username === username;

  // Fetch creator data
  const { data: creator, isLoading: creatorLoading, error: creatorError } = useQuery<Creator>({
    queryKey: ["creator", username],
    queryFn: async () => {
      const response = await fetch(`/api/creators/${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch creator");
      }
      return response.json();
    },
    enabled: !!username,
  });

  // Fetch ideas
  const { data: ideas = [], isLoading: ideasLoading, refetch: refetchIdeas } = useQuery<Idea[]>({
    queryKey: ["creator-ideas", username],
    queryFn: async () => {
      const response = await fetch(`/api/creators/${username}/ideas`);
      if (!response.ok) {
        throw new Error("Failed to fetch ideas");
      }
      return response.json();
    },
    enabled: !!username,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ ideaId }: { ideaId: number }): Promise<VoteResponse> => {
      const response = await fetch(`/api/ideas/${ideaId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to vote");
      }

      return response.json();
    },
    onSuccess: (data, { ideaId }) => {
      // Update the ideas cache
      queryClient.setQueryData(["creator-ideas", username], (oldIdeas: Idea[] | undefined) => {
        if (!oldIdeas) return oldIdeas;
        
        return oldIdeas.map(idea => 
          idea.id === ideaId 
            ? { ...idea, voteCount: data.voteCount, hasVoted: data.hasVoted }
            : idea
        );
      });

      toast({
        title: t("creator.voteSuccess"),
        description: t("creator.voteSuccessDesc"),
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("already voted")) {
        toast({
          title: t("common.alreadyVoted"),
          description: t("common.alreadyVotedDesc"),
          variant: "destructive",
          duration: 3000,
        });
      } else if (error.message.includes("own ideas")) {
        toast({
          title: t("creator.cantVoteOwn"),
          description: t("creator.cantVoteOwnDesc"),
          variant: "destructive",
          duration: 3000,
        });
      } else if (error.message.includes("authentication")) {
        toast({
          title: t("common.loginRequired"),
          description: t("common.loginRequiredDesc"),
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: t("creator.voteError"),
          description: t("creator.voteErrorDesc"),
          variant: "destructive",
          duration: 3000,
        });
      }
    },
  });

  const handleVote = (ideaId: number) => {
    if (!user) {
      localStorage.setItem("redirectAfterAuth", `/${username}`);
      navigate(`/auth?referrer=/${username}`);
      return;
    }

    if (isOwnProfile) {
      toast({
        title: t("creator.cantVoteOwn"),
        description: t("creator.cantVoteOwnDesc"),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    voteMutation.mutate({ ideaId });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("share.title", { username }),
          text: t("share.text", { username }),
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      setShareDialogOpen(true);
    }
  };

  const getBackgroundClass = (background?: string) => {
    switch (background) {
      case "gradient-1":
        return "bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950 dark:via-gray-900 dark:to-indigo-950";
      case "gradient-2":
        return "bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900 dark:via-indigo-950 dark:to-purple-900";
      case "gradient-3":
        return "bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 dark:from-green-950 dark:via-teal-950 dark:to-blue-950";
      case "gradient-4":
        return "bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 dark:from-pink-950 dark:via-orange-950 dark:to-yellow-950";
      case "pattern-1":
        return "bg-white dark:bg-gray-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]";
      case "pattern-2":
        return "bg-white dark:bg-gray-900 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] dark:bg-[linear-gradient(45deg,#374151_25%,transparent_25%),linear-gradient(-45deg,#374151_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#374151_75%),linear-gradient(-45deg,transparent_75%,#374151_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]";
      default:
        return "bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950 dark:via-gray-900 dark:to-indigo-950";
    }
  };

  const getRankBadge = (idea: Idea, index: number) => {
    if (idea.isNew) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 ml-2">
          <Plus className="w-3 h-3 mr-1" />
          {t("badges.new")}
        </Badge>
      );
    }

    if (typeof idea.rankChange === 'number' && idea.rankChange !== 0) {
      if (idea.rankChange > 0) {
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 ml-2">
            <TrendingDown className="w-3 h-3 mr-1" />
            {t("badges.down", { change: Math.abs(idea.rankChange) })}
          </Badge>
        );
      } else {
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 ml-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            {t("badges.up", { change: Math.abs(idea.rankChange) })}
          </Badge>
        );
      }
    }

    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ml-2">
        <Minus className="w-3 h-3 mr-1" />
        {t("badges.same")}
      </Badge>
    );
  };

  if (creatorLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (creatorError || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Creator not found</h2>
          <p className="text-muted-foreground">The creator you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass(creator.profileBackground)}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span className="font-medium">{t("creator.publicProfileView")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* User actions */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium hidden sm:inline">
                    {t("common.greeting")} {user.username}
                  </span>
                  
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/settings")}
                      className="hidden sm:flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Call logout API
                        await fetch("/api/logout", {
                          method: "POST",
                          headers: {
                            "X-Requested-With": "XMLHttpRequest"
                          },
                          credentials: "same-origin"
                        });

                        // Stay on the same public profile after logout
                        window.location.reload();
                      } catch (error) {
                        console.error("Logout error:", error);
                        // Even if logout fails, reload to refresh the page
                        window.location.reload();
                      }
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-gray-300 dark:border-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">{t("common.logout")}</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem("redirectAfterAuth", `/${username}`);
                    navigate(`/auth?referrer=/${username}`);
                  }}
                >
                  {t("common.login")}
                </Button>
              )}

              {/* Mobile menu */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Creator header */}
          <div className="mb-8">
            <CreatorProfileHeader creator={creator} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              onClick={() => {
                if (!user) {
                  localStorage.setItem("redirectAfterAuth", `/${username}`);
                  navigate(`/auth?referrer=/${username}`);
                  return;
                }

                if (isOwnProfile) {
                  toast({
                    title: t("creator.cantSuggestOwn"),
                    description: t("creator.cantSuggestOwnDesc"),
                    variant: "destructive",
                    duration: 3000,
                  });
                  return;
                }

                setSuggestDialogOpen(true);
              }}
              disabled={isOwnProfile}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("suggestIdea.button")}
            </Button>

            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {t("common.share")}
            </Button>

            <Button
              variant="outline"
              onClick={() => refetchIdeas()}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t("common.refresh")}
            </Button>
          </div>

          {/* Ideas section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {t("creator.voteHeaderTitle")}
            </h2>

            {ideasLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : ideas.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No ideas yet</h3>
                <p className="text-muted-foreground">
                  {t("suggestIdea.beFirstToSuggest")}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {ideas.map((idea, index) => (
                  <Card key={idea.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            #{index + 1}
                          </Badge>
                          {getRankBadge(idea, index)}
                        </div>

                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {idea.title}
                        </h3>

                        {idea.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                            {idea.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {idea.voteCount} {idea.voteCount === 1 ? t("badges.vote") : t("badges.votes")}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant={idea.hasVoted ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVote(idea.id)}
                          disabled={voteMutation.isPending || isOwnProfile}
                          className={idea.hasVoted ? "bg-primary text-primary-foreground" : ""}
                        >
                          {voteMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <>
                              <Heart className={`w-4 h-4 mr-1 ${idea.hasVoted ? "fill-current" : ""}`} />
                              {idea.hasVoted ? t("common.voted") : t("common.vote")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Audience stats for logged-in users */}
          {user && user.userRole === "audience" && (
            <div className="mb-8">
              <AudienceStats />
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <SuggestIdeaDialog
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        creatorUsername={username!}
        onSuccess={() => {
          setSuggestDialogOpen(false);
          refetchIdeas();
        }}
      />

      <ShareProfile
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        username={username!}
        profileUrl={window.location.href}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        user={user}
        username={username}
        isCreatorProfile={true}
        onRefresh={() => refetchIdeas()}
      />
    </div>
  );
}

export default CreatorProfileUnified;
