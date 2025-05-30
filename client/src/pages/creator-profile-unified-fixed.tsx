import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import CreatorProfileHeader from "@/components/creator-profile-header";
import SuggestIdeaDialog from "@/components/suggest-idea-dialog";
import ShareProfile from "@/components/share-profile";
import { MobileMenu } from "@/components/mobile-menu";
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
  Loader2,
  ThumbsUp,
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useStaggerCards } from "@/components/gsap-animations";

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

interface IdeaResponse {
  id: number;
  title: string;
  description: string;
  votes: number;
  createdAt: string;
  creatorId: number;
  status: string;
  suggestedBy: number | null;
  suggestedByUsername?: string;
  position: {
    current: number | null;
    previous: number | null;
    change: number | null;
  };
}

export default function CreatorProfileUnified() {
  const { username } = useParams<{ username: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const ideasContainerRef = useRef<HTMLDivElement>(null);
  
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [isVoting, setIsVoting] = useState<Record<number, boolean>>({});
  const [showAudienceStats, setShowAudienceStats] = useState(false);

  const { data, isLoading, error, refetch } =
    useQuery<CreatorPublicPageResponse>({
      queryKey: [`/api/creators/${username}`],
      enabled: !!username,
    });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to load creator page",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [error, setLocation, toast]);

  // Load voted ideas from localStorage only for authenticated users
  useEffect(() => {
    if (user) {
      const userKey = `votedIdeas_${user.id}`;
      const votedIdeasFromStorage = JSON.parse(
        localStorage.getItem(userKey) || "[]"
      );
      setVotedIdeas(new Set(votedIdeasFromStorage));
    } else {
      // Clear voted ideas for non-authenticated users
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
          const response = await fetch(`/api/creators/${username}/ideas/${idea.id}/vote-status`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const voteData = await response.json();
            if (voteData.hasVoted) {
              votedSet.add(idea.id);
            }
          }
        } catch (error) {
          console.error(`Error checking vote status for idea ${idea.id}:`, error);
        }
      }
      
      setVotedIdeas(votedSet);
    };
    
    checkVotedIdeas();
  }, [data?.ideas, user, username]);

  // Usar useStaggerCards para animar las tarjetas de ideas cuando estén disponibles
  useStaggerCards(ideasContainerRef);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-indigo-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Creator not found</p>
      </div>
    );
  }

  const { ideas, creator } = data;

  // Check if current user is the profile owner
  const isOwnProfile = user?.username === creator.username;

  const handleVote = async (ideaId: number) => {
    if (!user) {
      // Store current page as redirect destination
      localStorage.setItem("redirectAfterAuth", `/creators/${username}`);
      setLocation(`/auth?referrer=${encodeURIComponent(`/creators/${username}`)}`);
      return;
    }

    if (isOwnProfile) {
      toast({
        title: t("common.error", "Error"),
        description: t("creator.cantVoteOwnIdea", "You cannot vote on your own ideas"),
        variant: "destructive",
      });
      return;
    }

    if (votedIdeas.has(ideaId) || isVoting[ideaId]) {
      return;
    }

    setIsVoting((prev) => ({ ...prev, [ideaId]: true }));

    try {
      await apiRequest(
        "POST",
        `/api/creators/${username}/ideas/${ideaId}/vote`
      );

      // Update voted ideas
      const newVotedIdeas = new Set(votedIdeas);
      newVotedIdeas.add(ideaId);
      setVotedIdeas(newVotedIdeas);

      // Update localStorage with user-specific key
      const userKey = `votedIdeas_${user.id}`;
      const votedArray = Array.from(newVotedIdeas);
      localStorage.setItem(userKey, JSON.stringify(votedArray));

      toast({
        title: t("creator.voteSuccess", "Vote registered!"),
        description: t(
          "creator.voteSuccessDesc",
          "Your vote has been registered successfully"
        ),
      });

      // Refresh ideas to get updated vote counts
      refetch();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: t("creator.voteError", "Vote failed"),
        description: t(
          "creator.voteErrorDesc",
          "Failed to register your vote. Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsVoting((prev) => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleSuggestIdea = () => {
    if (!user) {
      // Store current page as redirect destination
      localStorage.setItem("redirectAfterAuth", `/creators/${username}`);
      setLocation(`/auth?referrer=${encodeURIComponent(`/creators/${username}`)}`);
      return;
    }

    // Open suggestion dialog logic would go here
    toast({
      title: t("common.suggest", "Suggest"),
      description: t(
        "creator.suggestFeature",
        "Suggestion feature coming soon!"
      ),
    });
  };

  const getRankingIcon = (change: number | null) => {
    if (change === null || change === 0) return <Minus className="h-4 w-4" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getRankingText = (position: IdeaResponse["position"]) => {
    if (!position.current) return "Unranked";
    if (position.change === null || position.change === 0) {
      return `#${position.current}`;
    }
    const direction = position.change > 0 ? "up" : "down";
    return `#${position.current} (${Math.abs(position.change)} ${direction})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <CreatorProfileHeader
        creator={creator}
        isOwnProfile={isOwnProfile}
        user={user}
        onSuggestIdea={handleSuggestIdea}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Ideas Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white">
              {t("creator.voteHeaderTitle", "Vote for Content Ideas")}
            </h2>
            
            {/* Audience Stats Button */}
            {user && !isOwnProfile && (
              <Button
                onClick={() => setShowAudienceStats(true)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <User className="h-4 w-4 mr-2" />
                {t("audience.myActivity", "My Activity")}
              </Button>
            )}
          </div>

          {/* Ideas Container */}
          <div
            ref={ideasContainerRef}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {ideas.map((idea) => (
              <Card
                key={idea.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="p-6">
                  {/* Ranking Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30"
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      {getRankingText(idea.position)}
                    </Badge>
                    <div className="flex items-center text-white/70">
                      {getRankingIcon(idea.position.change)}
                    </div>
                  </div>

                  {/* Idea Content */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {idea.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Vote Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">{idea.votes}</span>
                    </div>

                    {/* Vote Button */}
                    {user ? (
                      <Button
                        onClick={() => handleVote(idea.id)}
                        disabled={
                          isOwnProfile || 
                          votedIdeas.has(idea.id) || 
                          isVoting[idea.id]
                        }
                        size="sm"
                        className={`
                          ${votedIdeas.has(idea.id)
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                          }
                          ${isOwnProfile ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {isVoting[idea.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : votedIdeas.has(idea.id) ? (
                          <>
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {t("common.voted", "Voted!")}
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-1" />
                            {t("common.vote", "Vote")}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleVote(idea.id)}
                        size="sm"
                        variant="outline"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {t("common.vote", "Vote")}
                      </Button>
                    )}
                  </div>

                  {/* Suggested by */}
                  {idea.suggestedByUsername && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs text-white/60">
                        {t("creator.suggestedBy", "Suggested by")}{" "}
                        <span className="font-medium text-white/80">
                          {idea.suggestedByUsername}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Stats Modal */}
      <AudienceStats 
        isVisible={showAudienceStats}
        onClose={() => setShowAudienceStats(false)}
      />
    </div>
  );
}