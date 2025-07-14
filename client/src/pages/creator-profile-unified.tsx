import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { IdeaResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Share2,
  ThumbsUp,
  Loader2,
  UserPlus,
  User,
  ExternalLink,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import SuggestIdeaModal from "@/components/suggest-idea-modal";
import AudienceStats from "@/components/audience-stats";
import { PointsSuggestionForm } from "@/components/points-suggestion-form";
import { PointsDisplay } from "@/components/points-display";
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { useStaggerCards } from "@/components/gsap-animations";
import { gsap } from "gsap";
import IdeaCard from "@/components/idea-card";
import EnhancedRankingCard from "@/components/enhanced-ranking-card";
import { PublicStore } from "@/components/public-store";

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

export default function CreatorProfileUnified() {
  const params = useParams();
  const [, navigate] = useLocation();
  const username = params?.username;
  const [isVoting, setIsVoting] = useState<{ [key: number]: boolean }>({});
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const [successVote, setSuccessVote] = useState<number | null>(null);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [showAudienceStats, setShowAudienceStats] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const ideasContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } =
    useQuery<CreatorPublicPageResponse>({
      queryKey: [`/api/creators/${username}`],
      enabled: !!username,
    });

  // Check if current user is the profile owner
  const isOwnProfile = user?.username === username;

  // Query user points to control suggestion button
  const { data: userPoints } = useQuery<{ totalPoints: number }>({
    queryKey: ["/api/user/points"],
    enabled: !!user && !isOwnProfile,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to load creator page",
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

  const handleVote = async (ideaId: number) => {
    if (!user) {
      // Store current page as redirect destination
      localStorage.setItem("redirectAfterAuth", `/${username}`);

      toast({
        title: t("common.loginRequired"),
        description: t("common.loginRequiredDesc"),
        variant: "destructive",
      });
      navigate(`/auth?referrer=/${username}`);
      return;
    }

    // Prevent voting on own ideas
    if (isOwnProfile) {
      toast({
        title: t("creator.cantVoteOwn"),
        description: t("creator.cantVoteOwnDesc"),
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

      // Show success animation
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 3000);

      // Refetch para obtener las posiciones actualizadas
      const refreshedData = await refetch();
      
      // Calcular nueva posición después del refetch
      const newIdeaIndex = refreshedData.data?.ideas.findIndex(idea => idea.id === ideaId);
      const newRank = newIdeaIndex !== undefined ? newIdeaIndex + 1 : 0;

      toast({
        title: t("common.voteRegistered", "¡Voto registrado!"),
        description: newRank <= 3 
          ? t("common.voteHelpedTopIdea", "¡Tu voto ayudó a esta idea en el top {{rank}}!", { rank: newRank })
          : t("common.voteCountsPosition", "Tu voto cuenta. Esta idea está en la posición #{{rank}}", { rank: newRank }),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
    } catch (error) {
      toast({
        title: t("creator.voteError", "Vote failed"),
        description: t(
          "creator.voteErrorDesc",
          "Could not register your vote. Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsVoting((prev) => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    const shareData = {
      title: t("share.title", "Check out {{username}}'s ideas!", {
        username: creator.username,
      }),
      text: t("share.text", "Vote for {{username}}'s next content ideas", {
        username: creator.username,
      }),
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("common.copied", "Copied!"),
        description: t("common.linkCopied", "Link copied to clipboard"),
      });
    }
  };

  const getBackgroundStyle = (profileBackground?: string) => {
    switch (profileBackground) {
      case "gradient-1":
        return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950";
      case "gradient-2":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30";
      case "gradient-3":
        return "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30";
      case "gradient-4":
        return "bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30";
      case "pattern-1":
        return "bg-gray-50 dark:bg-gray-900";
      case "pattern-2":
        return "bg-gray-50 dark:bg-gray-900";
      default:
        return "bg-gradient-to-b from-blue-600 to-indigo-900";
    }
  };

  const getPatternStyle = (profileBackground?: string) => {
    if (profileBackground === "pattern-1") {
      return {
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.5) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      };
    }
    if (profileBackground === "pattern-2") {
      return {
        backgroundImage:
          "linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px), linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      };
    }
    return {};
  };

  const getSocialIcon = (platform: string, url: string) => {
    const iconProps = { className: "w-5 h-5" };

    switch (platform) {
      case "twitter":
        return <Twitter {...iconProps} />;
      case "instagram":
        return <Instagram {...iconProps} />;
      case "youtube":
        return <Youtube {...iconProps} />;
      case "tiktok":
        return <FaTiktok {...iconProps} />;
      case "threads":
        return <FaThreads {...iconProps} />;
      case "website":
        return <Globe {...iconProps} />;
      default:
        return <ExternalLink {...iconProps} />;
    }
  };

  const renderSocialLinks = () => {
    const socialLinks = [
      {
        platform: "website",
        url: creator.websiteUrl,
        label: t("common.website", "Website"),
      },
      { platform: "twitter", url: creator.twitterUrl, label: "Twitter" },
      { platform: "instagram", url: creator.instagramUrl, label: "Instagram" },
      { platform: "youtube", url: creator.youtubeUrl, label: "YouTube" },
      { platform: "tiktok", url: creator.tiktokUrl, label: "TikTok" },
      { platform: "threads", url: creator.threadsUrl, label: "Threads" },
    ].filter((link) => link.url);

    if (socialLinks.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {socialLinks.map(({ platform, url, label }) => {
          if (!url) return null;

          // Formatear la URL según la plataforma
          const formattedUrl = (() => {
            // Remover @ si existe al inicio
            let cleanUrl = url.startsWith("@") ? url.substring(1) : url;

            // Si es un sitio web, usar la URL tal cual
            if (platform === "website") {
              return cleanUrl.startsWith("http://") ||
                cleanUrl.startsWith("https://")
                ? cleanUrl
                : `https://${cleanUrl}`;
            }

            // Para redes sociales, construir la URL base según la plataforma
            const baseUrls = {
              twitter: "https://www.x.com/",
              instagram: "https://www.instagram.com/",
              youtube: "https://www.youtube.com/@",
              tiktok: "https://www.tiktok.com/@",
              threads: "https://www.threads.net/@",
            };

            return `${baseUrls[platform as keyof typeof baseUrls]}${cleanUrl}`;
          })();

          return (
            <a
              key={platform}
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-3 rounded-full transition-all duration-200 hover:scale-110",
                isCustomBackground
                  ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  : "bg-white/10 hover:bg-white/20 text-white"
              )}
              aria-label={label}
            >
              {getSocialIcon(platform, url)}
            </a>
          );
        })}
      </div>
    );
  };

  const backgroundClass = getBackgroundStyle(creator.profileBackground);
  const patternStyle = getPatternStyle(creator.profileBackground);
  const isCustomBackground =
    creator.profileBackground &&
    creator.profileBackground !== "gradient-default";

  return (
    <div className={cn("min-h-screen", backgroundClass)} style={patternStyle}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Left section - User Info (Desktop) or Logo/Title (Mobile) */}
            <div className="flex items-center gap-4">
              {/* User info and Logout (Desktop only) */}
              {user && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Call logout API
                        await fetch("/api/logout", {
                          method: "POST",
                          headers: {
                            "X-Requested-With": "XMLHttpRequest",
                          },
                          credentials: "same-origin",
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
                    {t("common.logout", "Cerrar sesión")}
                  </Button>
                </div>
              )}

              {/* Logo/Title (Mobile only) */}
              <div className="md:hidden">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("dashboard.appName", "Fanlist")}
                </h1>
              </div>
            </div>

            {/* Right section - Toggles (Desktop) and Mobile Menu (Mobile) */}
            <div className="flex items-center gap-4">
              {/* Toggles (Desktop only) */}
              <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>

              {/* Mobile Menu (Mobile only) */}
              <div className="md:hidden">
                <MobileMenu
                  isCreatorProfile={true}
                  username={username}
                  transparent={false} // Mobile menu background
                  onRefresh={async () => {
                    await refetch();
                  }}
                  onLogout={async () => {
                    try {
                      await fetch("/api/logout", {
                        method: "POST",
                        headers: {
                          "X-Requested-With": "XMLHttpRequest",
                        },
                        credentials: "same-origin",
                      });
                      window.location.reload();
                    } catch (error) {
                      console.error("Mobile logout error:", error);
                      window.location.reload();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-20">
        {/* Creator Profile Section */}
        <div
          className={cn(
            "relative z-10 text-center py-12",
            isCustomBackground ? "text-gray-900 dark:text-white" : "text-white"
          )}
        >
          <div className="container mx-auto px-4">
            <Avatar
              className={cn(
                "w-24 h-24 mx-auto mb-6 ring-4",
                isCustomBackground
                  ? "ring-gray-300 dark:ring-gray-600"
                  : "ring-white/20"
              )}
            >
              <AvatarImage
                src={creator.logoUrl || undefined}
                alt={creator.username}
              />
              <AvatarFallback
                className={cn(
                  "text-2xl font-bold",
                  isCustomBackground
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "bg-white/20"
                )}
              >
                {creator.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-4xl font-bold mb-4">{creator.username}</h1>

            {creator.profileDescription && (
              <p
                className={cn(
                  "text-xl mb-6 max-w-2xl mx-auto",
                  isCustomBackground
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-white/90"
                )}
              >
                {creator.profileDescription}
              </p>
            )}

            {renderSocialLinks()}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                onClick={() => {
                  if (isOwnProfile) {
                    toast({
                      title: t(
                        "creator.cantSuggestOwn",
                        "Can't suggest to yourself"
                      ),
                      description: t(
                        "creator.cantSuggestOwnDesc",
                        "No podés sugerir ideas a tu propio perfil 😅"
                      ),
                      variant: "destructive",
                    });
                    return;
                  }

                  if (!user) {
                    localStorage.setItem("redirectAfterAuth", `/${username}`);
                    navigate(`/auth?referrer=/${username}`);
                    return;
                  }

                  // Check if user has enough points
                  if (user && userPoints && userPoints.totalPoints < 3) {
                    toast({
                      title: t("points.insufficientPoints", "Not enough points"),
                      description: t("points.needPointsToSuggest", "You need 3 points to suggest an idea. Vote for ideas to earn points!"),
                      variant: "destructive",
                    });
                    return;
                  }

                  setSuggestDialogOpen(true);
                }}
                disabled={isOwnProfile || (user && userPoints && userPoints.totalPoints < 3)}
                className={cn(
                  isOwnProfile || (user && userPoints && userPoints.totalPoints < 3)
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                    : isCustomBackground
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-blue-600 hover:bg-white/90"
                )}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {!user
                  ? t("common.loginToSuggest", "Login to suggest ideas")
                  : user && userPoints && userPoints.totalPoints < 3
                  ? t("points.needMorePoints", "Need 3 points")
                  : t("suggestIdea.button", "Suggest Idea")
                }
              </Button>

              <Button
                onClick={() => setShowStore(!showStore)}
                variant="outline"
                className={cn(
                  isCustomBackground
                    ? "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    : "border-white text-white hover:bg-white hover:text-blue-600"
                )}
              >
                <Store className="w-4 h-4 mr-2" />
                {showStore
                  ? t("store.hideStore", "Hide Store")
                  : t("store.browseStore", "Points Store")}
              </Button>

              {/* Audience Stats Button - Only show if user is logged in */}
              {user && (
                <Button
                  onClick={() => setShowAudienceStats(!showAudienceStats)}
                  variant="outline"
                  className={cn(
                    isCustomBackground
                      ? "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      : "border-white text-white hover:bg-white hover:text-blue-600"
                  )}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showAudienceStats
                    ? t("audienceStats.hide", "Hide My Stats")
                    : t("audienceStats.show", "My Activity")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Audience Stats Section - Only show when toggled */}
        {showAudienceStats && (
          <div className="bg-gray-50 dark:bg-gray-900 py-8">
            <AudienceStats isVisible={showAudienceStats} />
          </div>
        )}

        {/* Store Section - Only show when toggled */}
        {showStore && (
          <div className="bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
              <PublicStore 
                creatorUsername={username!} 
                isAuthenticated={!!user} 
              />
            </div>
          </div>
        )}

        {/* Ideas Section */}
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              {t("creator.voteHeaderTitle", "Vote for Content Ideas")}
            </h2>

            {/* Ideas list - full width */}
            <div className="w-full">
              {ideas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t(
                      "suggestIdea.beFirstToSuggest",
                      "Be the first to suggest a content idea"
                    )}
                  </p>
                </div>
              ) : (
                <div ref={ideasContainerRef} className="space-y-4">
                  {ideas.map((idea, index) => {
                    const rank = index + 1;
                    
                    // Función para calcular votos necesarios para subir de posición
                    const getVotesToNextRank = (currentRank: number, currentVotes: number) => {
                      if (currentRank <= 1) return 0;
                      const ideaAbove = ideas[currentRank - 2]; // -2 porque el array es 0-indexed y queremos la idea anterior
                      if (ideaAbove) {
                        return Math.max(0, ideaAbove.votes - currentVotes + 1);
                      }
                      return 0;
                    };

                    // Simular votos recientes (esto normalmente vendría del backend)
                    const getRecentVotes24h = (ideaId: number) => {
                      return Math.floor(Math.random() * 3); // Simulación simple
                    };

                    const votesToNext = getVotesToNextRank(rank, idea.votes);
                    const recentVotes = getRecentVotes24h(idea.id);

                    return (
                      <EnhancedRankingCard
                        key={idea.id}
                        rank={rank}
                        idea={idea}
                        isVoting={isVoting[idea.id]}
                        isVoted={votedIdeas.has(idea.id)}
                        isSuccessVote={successVote === idea.id}
                        onVote={handleVote}
                        isLoggedIn={!!user}
                        votesToNextRank={votesToNext}
                        recentVotes24h={recentVotes}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
}
