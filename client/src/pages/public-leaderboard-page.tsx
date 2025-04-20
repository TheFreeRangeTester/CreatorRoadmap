import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Loader2, Share2, ThumbsUp, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IdeaResponse, PublicLinkResponse } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PublicLeaderboardResponse {
  ideas: IdeaResponse[];
  publicLink: PublicLinkResponse;
}

export default function PublicLeaderboardPage() {
  const [, params] = useRoute("/l/:token");
  const [, navigate] = useLocation();
  const token = params?.token;
  const [isVoting, setIsVoting] = useState<{[key: number]: boolean}>({});

  const { data, isLoading, error, refetch } = useQuery<PublicLeaderboardResponse>({
    queryKey: [`/api/l/${token}`],
    enabled: !!token,
  });

  console.log("PublicLeaderboardPage rendered with token:", token);
  console.log("Data:", data);
  console.log("Error:", error);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to load leaderboard",
        variant: "destructive",
      });
      navigate("/");
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
      
      await apiRequest("POST", `/api/l/${token}/ideas/${ideaId}/vote`);
      
      // Refetch data to update UI
      await refetch();
      
      toast({
        title: "Vote recorded",
        description: "Your vote has been successfully recorded.",
      });
      
    } catch (error) {
      toast({
        title: "Vote failed",
        description: (error as Error).message || "Failed to record your vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Content Creator Leaderboard",
        text: "Check out this content creator leaderboard!",
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
      description: "Leaderboard link copied to clipboard",
    });
  };

  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Public Leaderboard</h1>
          <p className="text-muted-foreground">
            This leaderboard is publicly accessible. You can vote for your favorite ideas!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => refetch()} aria-label="Refresh leaderboard" className="flex items-center">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">No ideas yet</h2>
          <p className="text-muted-foreground mt-2">
            There are no ideas in this leaderboard yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ideas.map((idea) => (
            <Card key={idea.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{idea.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Rank: {idea.position.current || "N/A"}
                    </Badge>
                    {(() => {
                      const { previous, change } = idea.position;
                      
                      // Determinar la clase de estilo
                      let badgeClass = "text-xs ";
                      if (previous === null) {
                        badgeClass += "bg-primary-100 text-primary-800 hover:bg-primary-100 hover:text-primary-800";
                      } else if (change !== null && change > 0) {
                        badgeClass += "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800";
                      } else if (change !== null && change < 0) {
                        badgeClass += "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800";
                      } else {
                        badgeClass += "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800";
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
                <p className="text-sm text-gray-600 mb-4">{idea.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{idea.votes} votes</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleVote(idea.id)}
                    disabled={isVoting[idea.id]}
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