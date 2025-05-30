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
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { useStaggerCards } from "@/components/gsap-animations";
import { gsap } from "gsap";
import IdeaCard from "@/components/idea-card";

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
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [showAudienceStats, setShowAudienceStats] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const ideasContainerRef = useRef<HTMLDivElement>(null);

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
    if (!user || votedIdeas.has(ideaId) || isVoting[ideaId]) return;

    setIsVoting((prev) => ({ ...prev, [ideaId]: true }));

    try {
      const response = await fetch(
        `/api/creators/${username}/ideas/${ideaId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      // Actualizar el estado local de votación
      setVotedIdeas((prev) => {
        const newSet = new Set(prev);
        newSet.add(ideaId);
        return newSet;
      });

      // Actualizar localStorage
      if (user) {
        const userKey = `votedIdeas_${user.id}`;
        const votedIdeasFromStorage = JSON.parse(
          localStorage.getItem(userKey) || "[]"
        );
        votedIdeasFromStorage.push(ideaId);
        localStorage.setItem(userKey, JSON.stringify(votedIdeasFromStorage));
      }

      // Refetch para actualizar los datos
      await refetch();

      toast({
        title: t("creator.voteSuccess"),
        description: t("creator.voteSuccessDesc"),
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: t("creator.voteError"),
        description: t("creator.voteErrorDesc"),
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
        {socialLinks.map(({ platform, url, label }) => (
          <a
            key={platform}
            href={url!}
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
            {getSocialIcon(platform, url!)}
          </a>
        ))}
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
                    onClick={() => {
                      // Placeholder for actual logout logic
                      if (user?.userRole === "creator") {
                        window.location.href = "/dashboard"; // Redirect creator to dashboard after logout
                      } else {
                        window.location.href = "/"; // Redirect other users to landing
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
                  setSuggestDialogOpen(true);
                }}
                disabled={isOwnProfile}
                className={cn(
                  isOwnProfile
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                    : isCustomBackground
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-blue-600 hover:bg-white/90"
                )}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t("suggestIdea.button", "Suggest Idea")}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className={cn(
                  isCustomBackground
                    ? "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    : "border-white text-white hover:bg-white hover:text-blue-600"
                )}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t("common.share", "Share")}
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

        {/* Ideas Section */}
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              {t("creator.voteHeaderTitle", "Vote for Content Ideas")}
            </h2>

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
                  return (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onVote={handleVote}
                      isVoting={isVoting[idea.id]}
                      hasVoted={votedIdeas.has(idea.id)}
                    />
                  );
                })}
              </div>
            )}
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
