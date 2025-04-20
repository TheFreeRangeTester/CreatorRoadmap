import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { IdeaResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Share2, RefreshCcw, ThumbsUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CreatorPublicPageResponse {
  ideas: IdeaResponse[];
  creator: {
    id: number;
    username: string;
  };
}

export default function CreatorPublicPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const username = params?.username;
  const [isVoting, setIsVoting] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<CreatorPublicPageResponse>({
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
      navigate("/");
    }
  }, [error, navigate, toast]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { ideas, creator } = data;

  const [successVote, setSuccessVote] = useState<number | null>(null);

  const handleVote = async (ideaId: number) => {
    try {
      setIsVoting(prev => ({ ...prev, [ideaId]: true }));
      
      const endpoint = `/api/creators/${username}/ideas/${ideaId}/vote`;
      
      const response = await apiRequest("POST", endpoint);
      
      // Mostrar animación de éxito
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 2000);
      
      // Refetch data to update UI
      await refetch();
      
      toast({
        title: "¡Gracias por tu voto!",
        description: "Tu opinión es importante para el creador.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
    } catch (error) {
      console.error("Vote error details:", error);
      toast({
        title: "No se pudo registrar tu voto",
        description: (error as Error).message || "Ocurrió un error al procesar tu voto",
        variant: "destructive",
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${creator.username}'s Content Roadmap`,
        text: `Check out ${creator.username}'s content roadmap and vote for what you want to see next!`,
        url: window.location.href,
      }).catch((error) => {
        console.error("Error sharing:", error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Creator page link copied to clipboard",
    });
  };

  return (
    <div className="container px-4 mx-auto py-8 dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
            {creator.username}'s Content Roadmap
          </h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Vote for what content you want to see next from this creator!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => refetch()} aria-label="Refresh leaderboard" className="flex items-center dark:text-gray-300 dark:hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold dark:text-white">No ideas yet</h2>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            This creator hasn't added any content ideas yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ideas.map((idea) => (
            <Card key={idea.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-muted/30 dark:bg-gray-800/80 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="dark:text-white">{idea.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                      Rank: {idea.position.current || "N/A"}
                    </Badge>
                    {(() => {
                      const { previous, change } = idea.position;
                      
                      // Determinar la clase de estilo con soporte para dark mode
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
                      
                      // Determinar el texto a mostrar
                      let badgeText = "Same";
                      if (previous === null) {
                        badgeText = "New";
                      } else if (change !== null) {
                        if (change > 0) {
                          badgeText = `▲ ${change}`;
                        } else if (change < 0) {
                          badgeText = `▼ ${Math.abs(change)}`;
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
                    <span className="text-sm font-medium dark:text-gray-300">{idea.votes} votes</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleVote(idea.id)}
                    disabled={isVoting[idea.id]}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 dark:text-white transition-all duration-300"
                  >
                    {isVoting[idea.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Voting...
                      </>
                    ) : (
                      <>Vote</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}