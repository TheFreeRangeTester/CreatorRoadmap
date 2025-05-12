import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Loader2, Share2, ThumbsUp, RefreshCcw, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { IdeaResponse, PublicLinkResponse } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";

interface PublicLeaderboardResponse {
  ideas: IdeaResponse[];
  publicLink: PublicLinkResponse;
}

export default function PublicLeaderboardPage() {
  const [, params] = useRoute("/public/:token");
  const [, navigate] = useLocation();
  const token = params?.token;
  const [isVoting, setIsVoting] = useState<{[key: number]: boolean}>({});
  const [successVote, setSuccessVote] = useState<number | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading, error, refetch } = useQuery<PublicLeaderboardResponse>({
    queryKey: [`/api/public/${token}`],
    enabled: !!token,
  });

  console.log("[DEBUG] PublicLeaderboardPage rendered with token:", token);
  console.log("[DEBUG] Data:", data);
  console.log("[DEBUG] Error:", error);

  useEffect(() => {
    if (error) {
      toast({
        title: t('common.error', 'Error'),
        description: (error as Error).message || t('publicLeaderboard.errorLoading'),
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [error, navigate]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { ideas, publicLink } = data;

  const handleVote = async (ideaId: number) => {
    try {
      setIsVoting(prev => ({ ...prev, [ideaId]: true }));
      
      const endpoint = `/api/public/${token}/ideas/${ideaId}/vote`;
      
      const response = await apiRequest("POST", endpoint);
      
      // Show success animation
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 2000);
      
      // Refetch data to update UI
      await refetch();
      
      toast({
        title: t('creator.voteSuccess'),
        description: t('creator.voteSuccessDesc'),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
    } catch (error) {
      console.error("[ERROR] Vote error details:", error);
      toast({
        title: t('creator.voteError'),
        description: (error as Error).message || t('creator.voteErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('publicLeaderboard.title'),
        text: t('publicLeaderboard.description'),
        url: window.location.href,
      }).catch((error) => {
        console.error("[ERROR] Error sharing:", error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('common.copySuccess'),
      description: t('common.copyDesc', { url: window.location.href }),
    });
  };

  return (
    <div className="container px-4 mx-auto py-8 dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 dark:text-white">{t('publicLeaderboard.title')}</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            {t('publicLeaderboard.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 px-3 py-1 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <User className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
              <span className="font-medium">{user.username}</span>
            </Badge>
          )}
          <ThemeToggle />
          <LanguageToggle />
          <Button variant="ghost" onClick={() => refetch()} aria-label="Refresh leaderboard" className="flex items-center dark:text-gray-300 dark:hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white">
            <Share2 className="h-4 w-4" />
            {t('common.share')}
          </Button>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold dark:text-white">{t('publicLeaderboard.noIdeasYet')}</h2>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            {t('publicLeaderboard.noIdeasDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ideas.map((idea) => (
            <Card key={idea.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="bg-muted/30 dark:bg-gray-800/80 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="dark:text-white">{idea.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                      {t('publicLeaderboard.rank')}: {idea.position.current || t('publicLeaderboard.na')}
                    </Badge>
                    {(() => {
                      const { previous, change } = idea.position;
                      
                      // Determine style class with dark mode support
                      let badgeClass = "text-xs ";
                      if (previous === null) {
                        badgeClass += "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 hover:bg-primary-100 hover:text-primary-800 dark:hover:bg-primary-900/70 dark:hover:text-primary-300";
                      } else if (change !== null && change > 0) {
                        badgeClass += "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/70 dark:hover:text-green-300";
                      } else if (change !== null && change < 0) {
                        badgeClass += "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/70 dark:hover:text-red-300";
                      } else {
                        badgeClass += "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-300";
                      }
                      
                      // Determine text to display
                      let badgeText = t('badges.same');
                      if (previous === null) {
                        badgeText = t('badges.new');
                      } else if (change !== null) {
                        if (change > 0) {
                          badgeText = t('badges.up', { change });
                        } else if (change < 0) {
                          badgeText = t('badges.down', { change: Math.abs(change) });
                        }
                      }
                      
                      return (
                        <Badge className={cn(badgeClass)}>
                          {badgeText}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{idea.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    <span className="text-sm font-medium dark:text-gray-300">{idea.votes} {t('badges.votes')}</span>
                  </div>
                  {user ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleVote(idea.id)}
                      disabled={isVoting[idea.id] || successVote === idea.id}
                      className={`transition-all duration-300 ${
                        successVote === idea.id 
                          ? "bg-green-500 hover:bg-green-600 dark:text-white animate-pulse transform scale-105" 
                          : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 dark:text-white"
                      }`}
                    >
                      {isVoting[idea.id] ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('common.voting')}
                        </>
                      ) : successVote === idea.id ? (
                        <>
                          <ThumbsUp className="h-4 w-4 mr-2 animate-bounce" />
                          {t('common.voted')}
                        </>
                      ) : (
                        <>{t('common.vote')}</>
                      )}
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed bg-muted/50 hover:bg-muted"
                      >
                        <span className="text-xs text-gray-600 dark:text-gray-400">{t('login.requiredToVote')}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}