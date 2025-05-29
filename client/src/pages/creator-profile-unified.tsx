import { useState, useEffect } from "react";
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
  ExternalLink,
  Twitter,
  Instagram,
  Youtube,
  Globe,
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

export default function CreatorProfileUnified() {
  const params = useParams();
  const [, navigate] = useLocation();
  const username = params?.username;
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

  // Load voted ideas from localStorage
  useEffect(() => {
    const votedIdeasFromStorage = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
    setVotedIdeas(new Set(votedIdeasFromStorage));
  }, []);

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
      toast({
        title: t("common.loginRequired", "Login required"),
        description: t("common.loginRequiredDesc", "Please log in to vote"),
        variant: "destructive",
      });
      navigate(`/auth?referrer=/creators/${username}`);
      return;
    }

    if (votedIdeas.has(ideaId) || isVoting[ideaId]) {
      return;
    }

    setIsVoting(prev => ({ ...prev, [ideaId]: true }));

    try {
      await apiRequest("POST", `/api/creators/${username}/ideas/${ideaId}/vote`);
      
      // Update voted ideas
      const newVotedIdeas = new Set(votedIdeas);
      newVotedIdeas.add(ideaId);
      setVotedIdeas(newVotedIdeas);
      
      // Update localStorage
      const votedArray = Array.from(newVotedIdeas);
      localStorage.setItem("votedIdeas", JSON.stringify(votedArray));

      toast({
        title: t("creator.voteSuccess", "Vote registered!"),
        description: t("creator.voteSuccessDesc", "Your vote has been registered successfully"),
      });

      refetch();
    } catch (error) {
      toast({
        title: t("creator.voteError", "Vote failed"),
        description: t("creator.voteErrorDesc", "Could not register your vote. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    const shareData = {
      title: t("share.title", "Check out {{username}}'s ideas!", { username: creator.username }),
      text: t("share.text", "Vote for {{username}}'s next content ideas", { username: creator.username }),
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

  const getSocialIcon = (platform: string, url: string) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (platform) {
      case 'twitter':
        return <Twitter {...iconProps} />;
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      case 'tiktok':
        return <FaTiktok {...iconProps} />;
      case 'threads':
        return <FaThreads {...iconProps} />;
      case 'website':
        return <Globe {...iconProps} />;
      default:
        return <ExternalLink {...iconProps} />;
    }
  };

  const renderSocialLinks = () => {
    const socialLinks = [
      { platform: 'website', url: creator.websiteUrl },
      { platform: 'twitter', url: creator.twitterUrl },
      { platform: 'instagram', url: creator.instagramUrl },
      { platform: 'youtube', url: creator.youtubeUrl },
      { platform: 'tiktok', url: creator.tiktokUrl },
      { platform: 'threads', url: creator.threadsUrl },
    ].filter(link => link.url);

    if (socialLinks.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {socialLinks.map(({ platform, url }) => (
          <a
            key={platform}
            href={url!}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {getSocialIcon(platform, url!)}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <MobileMenu 
            isCreatorProfile={true} 
            username={username}
            transparent={true}
            onRefresh={async () => {
              await refetch();
            }}
          />
        </div>
      </header>

      {/* Creator Profile Section */}
      <div className="relative z-10 text-center text-white py-12">
        <div className="container mx-auto px-4">
          <Avatar className="w-24 h-24 mx-auto mb-6 ring-4 ring-white/20">
            <AvatarImage src={creator.logoUrl || undefined} alt={creator.username} />
            <AvatarFallback className="text-2xl font-bold bg-white/20">
              {creator.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-4xl font-bold mb-4">{creator.username}</h1>
          
          {creator.profileDescription && (
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              {creator.profileDescription}
            </p>
          )}

          {renderSocialLinks()}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => setSuggestDialogOpen(true)}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t("suggestIdea.button", "Suggest Idea")}
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t("common.share", "Share")}
            </Button>
          </div>
        </div>
      </div>

      {/* Ideas Section */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            {t("creator.voteHeaderTitle", "Vote for Content Ideas")}
          </h2>

          {ideas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {t("suggestIdea.beFirstToSuggest", "Be the first to suggest a content idea")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {idea.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {idea.votes} {idea.votes === 1 ? t("badges.vote", "vote") : t("badges.votes", "votes")}
                      </span>
                      <Button
                        onClick={() => handleVote(idea.id)}
                        disabled={votedIdeas.has(idea.id) || isVoting[idea.id] || !user}
                        size="sm"
                        className={cn(
                          votedIdeas.has(idea.id) 
                            ? "bg-green-100 text-green-700 hover:bg-green-100" 
                            : ""
                        )}
                      >
                        {isVoting[idea.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {votedIdeas.has(idea.id) 
                              ? t("ideaPosition.voted", "Voted")
                              : t("ideaPosition.vote", "Vote")
                            }
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggest Idea Modal */}
      <SuggestIdeaModal
        isOpen={suggestDialogOpen}
        onClose={() => setSuggestDialogOpen(false)}
        creatorUsername={creator.username}
        onSuccess={async () => {
          setSuggestDialogOpen(false);
          await refetch();
        }}
      />
    </div>
  );
}