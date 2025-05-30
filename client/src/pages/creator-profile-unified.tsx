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

  // Check if current user is the profile owner
  const isOwnProfile = user?.username === creator.username;

  const handleVote = async (ideaId: number) => {
    if (!user) {
      // Store current page as redirect destination
      localStorage.setItem("redirectAfterAuth", `/creators/${username}`);

      toast({
        title: t("common.loginRequired"),
        description: t("common.loginRequiredDesc"),
        variant: "destructive",
      });
      navigate(`/auth?referrer=/creators/${username}`);
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

      toast({
        title: t("creator.voteSuccess", "Vote registered!"),
        description: t(
          "creator.voteSuccessDesc",
          "Your vote has been registered successfully"
        ),
      });

      refetch();
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
                  
                  if (!user) {
                    localStorage.setItem("redirectAfterAuth", `/creators/${username}`);
                    navigate(`/auth?referrer=/creators/${username}`);
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
                {user 
                  ? t("suggestIdea.button", "Suggest Idea")
                  : t("common.loginToSuggest", "Login to suggest ideas")
                }
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

                  // Gradientes basados en el ranking como en la página QA original
                  const gradientClasses = {
                    1: "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600", // #1 Oro
                    2: "bg-gradient-to-r from-purple-400 to-violet-600 hover:from-purple-500 hover:to-violet-700", // #2 Púrpura
                    3: "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600", // #3 Rosa
                    4: "bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600", // #4 Azul
                    5: "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600", // #5 Verde
                    default:
                      "bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-500 hover:to-slate-600",
                  };

                  const gradientClass =
                    rank <= 5
                      ? gradientClasses[rank as keyof typeof gradientClasses]
                      : gradientClasses.default;

                  return (
                    <motion.div
                      key={idea.id}
                      className="gsap-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: rank * 0.05,
                        ease: [0.25, 0.1, 0.25, 1.0],
                      }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-stretch">
                          {/* Indicador de posición con emojis animados */}
                          <div
                            className={`flex items-center justify-center w-16 text-white font-bold text-xl ${gradientClass} relative`}
                          >
                            <span className="relative z-10">
                              {rank > 3 ? `#${rank}` : ""}
                            </span>
                            {rank <= 3 && (
                              <span
                                className={`absolute trophy-icon text-2xl ${
                                  rank === 1
                                    ? "text-yellow-400"
                                    : rank === 2
                                    ? "text-gray-300"
                                    : "text-amber-700"
                                }`}
                                ref={(el) => {
                                  if (el) {
                                    gsap.fromTo(
                                      el,
                                      { scale: 0.8, opacity: 0, y: 10 },
                                      {
                                        scale: 1,
                                        opacity: 1,
                                        y: 0,
                                        duration: 0.6,
                                        ease: "elastic.out(1, 0.5)",
                                        repeat: -1,
                                        yoyo: true,
                                        repeatDelay: 2,
                                        yoyoEase: "power2.out",
                                      }
                                    );
                                  }
                                }}
                              >
                                {rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}
                              </span>
                            )}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 p-4">
                            <h3 className="text-lg font-bold dark:text-white mb-2">
                              {idea.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                              {idea.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Contador de votos */}
                                <div className="flex items-center gap-2">
                                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-1 flex items-center">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {idea.votes}{" "}
                                    {idea.votes === 1
                                      ? t("badges.vote")
                                      : t("badges.votes")}
                                  </div>
                                </div>

                                {/* Información de quién sugirió la idea */}
                                {idea.suggestedByUsername && (
                                  <div className="flex items-center gap-2">
                                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-1 flex items-center">
                                      <User className="h-3 w-3 mr-1" />
                                      {t("ideas.suggestedBy")}:{" "}
                                      {idea.suggestedByUsername}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {user ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={cn(
                                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    votedIdeas.has(idea.id)
                                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 cursor-not-allowed"
                                      : "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/70"
                                  )}
                                  onClick={() => handleVote(idea.id)}
                                  disabled={
                                    votedIdeas.has(idea.id) ||
                                    isVoting[idea.id]
                                  }
                                >
                                  {isVoting[idea.id] ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      {t("common.voting", "Voting...")}
                                    </>
                                  ) : (
                                    <>
                                      <motion.div
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                        className="mr-2"
                                      >
                                        <ThumbsUp className="w-4 h-4" />
                                      </motion.div>
                                      {votedIdeas.has(idea.id)
                                        ? t("common.voted", "Voted!")
                                        : t("common.vote", "Vote")}
                                    </>
                                  )}
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/70"
                                  onClick={() => {
                                    localStorage.setItem("redirectAfterAuth", `/creators/${username}`);
                                    navigate(`/auth?referrer=/creators/${username}`);
                                  }}
                                >
                                  <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="mr-2"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </motion.div>
                                  {t("common.loginToVote", "Login to Vote")}
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
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