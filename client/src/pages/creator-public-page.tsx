import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { IdeaResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Share2, RefreshCcw, ThumbsUp, Loader2, UserPlus, User, Trophy, Medal, ArrowUp, ArrowDown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SuggestIdeaDialog from "@/components/suggest-idea-dialog";
import CreatorProfileHeader from "@/components/creator-profile-header";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedTitle from "@/components/animated-title";
import { ANIMATION_EFFECTS, CustomSplitText, registerGSAPPlugins, useStaggerCards, useFloatingElement } from "@/components/gsap-animations";

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

export default function CreatorPublicPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const username = params?.username;
  const [isVoting, setIsVoting] = useState<{[key: number]: boolean}>({});
  const [successVote, setSuccessVote] = useState<number | null>(null);
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Referencias para las animaciones
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ideasContainerRef = useRef<HTMLDivElement>(null);
  
  // Inicializar GSAP
  useEffect(() => {
    registerGSAPPlugins();
    gsap.registerPlugin(ScrollTrigger);
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  const { data, isLoading, error, refetch } = useQuery<CreatorPublicPageResponse>({
    queryKey: [`/api/creators/${username}`],
    enabled: !!username,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as Error).message || t('creator.loadError', "Failed to load creator page"),
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [error, navigate, toast, t]);
  
  // Effect to check ideas already voted by user when page loads
  useEffect(() => {
    if (user && data?.ideas) {
      // Function to check if user has already voted for each idea
      const checkVotedIdeas = async () => {
        try {
          const votedSet = new Set<number>();
          const existingVotedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
          
          // Add all ideas from localStorage
          for (const ideaId of existingVotedIdeas) {
            votedSet.add(ideaId);
          }
          
          // For each idea, make a silent verification call
          for (const idea of data.ideas) {
            if (!votedSet.has(idea.id)) {
              try {
                // Try to vote to verify (silent mode, only for verification)
                await apiRequest("POST", `/api/creators/${username}/ideas/${idea.id}/vote?check_only=true`);
                // If we get here, the user hasn't voted for this idea
              } catch (error) {
                // If it returns "already voted" error, register this idea as voted
                const errorMsg = (error as Error).message || "";
                if (errorMsg.includes("Ya has votado") || 
                    errorMsg.includes("You have already voted") ||
                    errorMsg.includes("already voted")) {
                  votedSet.add(idea.id);
                  
                  // Also update localStorage if needed
                  if (!existingVotedIdeas.includes(idea.id)) {
                    existingVotedIdeas.push(idea.id);
                    localStorage.setItem("votedIdeas", JSON.stringify(existingVotedIdeas));
                  }
                }
              }
            }
          }
          
          // Update the set of voted ideas
          setVotedIdeas(votedSet);
        } catch (error) {
          console.error("[ERROR] Error checking voted ideas:", error);
        }
      };
      
      checkVotedIdeas();
    }
  }, [user, data?.ideas, username]);

  // Usar useStaggerCards para animar las tarjetas de ideas cuando estén disponibles
  useStaggerCards(ideasContainerRef);
  
  // Efecto para aplicar animaciones cuando los datos se cargan
  useEffect(() => {
    if (data && pageRef.current) {
      try {
        // Animar el encabezado con SplitText
        if (headerRef.current) {
          const headerSplit = new CustomSplitText(headerRef.current, { type: "words" });
          gsap.from(headerSplit.words, {
            opacity: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.2
          });
        }
        
        // Animar la descripción
        if (descriptionRef.current) {
          gsap.from(descriptionRef.current, {
            opacity: 0,
            y: 15,
            duration: 0.6,
            delay: 0.4
          });
        }
      } catch (error) {
        console.error("Error en animaciones GSAP:", error);
      }
    }
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { ideas, creator } = data;

  const handleVote = async (ideaId: number) => {
    // If the user is not authenticated, show a message and redirect to the login page
    if (!user) {
      toast({
        title: t('common.loginRequired'),
        description: t('common.loginRequiredDesc'),
        variant: "destructive",
      });
      // Optionally we could redirect the user to the login page
      // navigate("/auth");
      return;
    }
    
    // If we've already voted for this idea, do nothing
    if (votedIdeas.has(ideaId)) {
      toast({
        title: t('common.alreadyVoted'),
        description: t('common.alreadyVotedDesc'),
        variant: "default",
      });
      return;
    }
    
    try {
      setIsVoting(prev => ({ ...prev, [ideaId]: true }));
      
      const endpoint = `/api/creators/${username}/ideas/${ideaId}/vote`;
      
      await apiRequest("POST", endpoint);
      
      // Update the local votes state
      setVotedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.add(ideaId);
        return newSet;
      });
      
      // Show success animation
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 2000);
      
      // Refetch data to update UI
      await refetch();
      
      toast({
        title: t('common.thankYou'),
        description: t('common.yourOpinionMatters'),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
    } catch (error) {
      console.error("[ERROR] Vote error details:", error);
      
      // If the error is because they've already voted, update the local state
      if ((error as Error).message?.includes("Ya has votado") || 
          (error as Error).message?.includes("You have already voted") ||
          (error as Error).message?.includes("already voted")) {
        setVotedIdeas(prev => {
          const newSet = new Set(prev);
          newSet.add(ideaId);
          return newSet;
        });
      } else {
        // Other errors
        toast({
          title: t('creator.voteError'),
          description: (error as Error).message || t('creator.voteErrorDesc'),
          variant: "destructive",
        });
      }
    } finally {
      setIsVoting(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    // Construct the URL with the new format /:username
    const shareUrl = `${window.location.origin}/${creator.username}`;
    
    if (navigator.share) {
      navigator.share({
        title: t('share.title', { username: creator.username }),
        text: t('share.text', { username: creator.username }),
        url: shareUrl,
      }).catch((error) => {
        console.error("Error sharing:", error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    // Construct the URL with the new format /:username (without /u/)
    const shareUrl = `${window.location.origin}/${creator.username}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: t('common.copySuccess'),
      description: t('common.copyDesc', { url: shareUrl }),
    });
  };

  // Function to get the CSS background class based on profileBackground
  const getBackgroundClass = () => {
    if (!creator.profileBackground || creator.profileBackground === "gradient-1") {
      return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950";
    } else if (creator.profileBackground === "gradient-2") {
      return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30";
    } else if (creator.profileBackground === "gradient-3") {
      return "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30";
    } else if (creator.profileBackground === "gradient-4") {
      return "bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30";
    } else if (creator.profileBackground === "pattern-1") {
      return "bg-gray-50 dark:bg-gray-900 bg-[radial-gradient(circle_at_1px_1px,gray_1px,transparent_0)] bg-[size:20px_20px]";
    } else if (creator.profileBackground === "pattern-2") {
      return "bg-gray-50 dark:bg-gray-900 bg-[linear-gradient(gray_1px,transparent_1px),linear-gradient(to_right,gray_1px,transparent_1px)] bg-[size:20px_20px]";
    }
    // By default, return gradient-1
    return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950";
  };

  // Referencia para el trofeo animado
  const trophyRef = useRef(null);
  
  // Aplicar efecto de flotación al trofeo
  useFloatingElement(trophyRef, {
    amplitude: 8,
    frequency: 3,
    rotation: true
  });

  return (
    <div ref={pageRef} className="min-h-screen dark:bg-gray-950">
      <div className={`${getBackgroundClass()} min-h-screen pb-16`}>
        <div className="container mx-auto px-4">
          {/* Barra superior con controles de utilidad */}
          <div className="py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 mb-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-primary dark:text-primary-400">
                  <ArrowUp className="h-4 w-4 -rotate-90 mr-1" />
                  Fanlist
                </Button>
              </Link>
              
              <Badge className="bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border-primary/20 dark:from-primary/5 dark:to-blue-500/5 dark:text-primary-400 dark:border-primary/10 py-1">
                {t('creator.publicView')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white"
                >
                  <motion.span
                    whileHover={{ 
                      rotate: [0, 15, -15, 0],
                      transition: { duration: 0.5 }
                    }}
                    className="inline-block"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </motion.span>
                  {t('common.share', 'Share')}
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => refetch()} 
                  aria-label={t('common.refresh')}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 1, 
                      ease: "linear", 
                      repeat: 0
                    }}
                    className="inline-block"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </motion.span>
                </Button>
              </motion.div>
              <ThemeToggle />
              <LanguageToggle />
              {user ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 px-3 py-1 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <User className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
                  <span className="font-medium">{user.username}</span>
                </Badge>
              ) : (
                <Link href="/auth">
                  <Button size="sm" variant="default" className="text-xs">
                    {t('common.login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-12 gap-6">
            {/* Panel lateral con información del creador - REDUCIDO */}
            <div className="md:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
                <div className="p-4">
                  <CreatorProfileHeader creator={creator} />
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <p ref={descriptionRef} className="text-sm text-gray-600 dark:text-gray-400">
                      {t('creator.roadmapDescription')}
                    </p>
                  </div>
                  
                  {user && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <SuggestIdeaDialog username={creator.username} refetch={refetch} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Leaderboard - DESTACADO */}
            <div className="md:col-span-9">
              {/* Encabezado del leaderboard */}
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -ml-6 -mb-6"></div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div ref={trophyRef} className="relative">
                        <Trophy className="h-8 w-8 text-yellow-400 dark:text-yellow-500" />
                      </div>
                      <AnimatedTitle
                        text={`${t('creator.leaderboardTitle')} - ${creator.username}`}
                        effect={ANIMATION_EFFECTS.TEXT_REVEAL}
                        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                      {t('creator.leaderboardDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {ideas.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <h2 ref={headerRef} className="text-2xl font-semibold dark:text-white mb-2">
                    {t('creator.noIdeasYet')}
                  </h2>
                  <p className="text-muted-foreground dark:text-gray-400 max-w-md mx-auto">
                    {t('creator.noIdeasDescription')}
                  </p>
                </div>
              ) : (
                <div ref={ideasContainerRef} className="grid grid-cols-1 gap-4">
                  {ideas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                      className="relative"
                    >
                      {/* Medallas para el top 3 */}
                      {idea.position.current && idea.position.current <= 3 && (
                        <motion.div 
                          className="absolute -top-2 -left-2 z-10"
                          initial={{ rotate: -15, scale: 0.5 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 10, 
                            delay: index * 0.05 + 0.2 
                          }}
                        >
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shadow-lg
                            ${idea.position.current === 1 
                              ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border-2 border-yellow-200 dark:border-yellow-700" 
                              : idea.position.current === 2
                                ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 border-2 border-gray-200 dark:border-gray-600"
                                : "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100 border-2 border-amber-400 dark:border-amber-800"
                            }
                          `}>
                            {idea.position.current === 1 && (
                              <Trophy className="h-6 w-6 text-yellow-900 dark:text-yellow-100" />
                            )}
                            {idea.position.current === 2 && (
                              <Medal className="h-6 w-6 text-gray-900 dark:text-gray-100" />
                            )}
                            {idea.position.current === 3 && (
                              <Medal className="h-6 w-6 text-amber-100" />
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Tarjeta principal */}
                      <Card 
                        className={`
                          overflow-hidden border-l-4 group cursor-pointer relative z-0
                          ${idea.position.current === 1 
                            ? "border-l-yellow-400 dark:border-l-yellow-600" 
                            : idea.position.current === 2
                              ? "border-l-gray-400 dark:border-l-gray-500"
                              : idea.position.current === 3
                                ? "border-l-amber-600 dark:border-l-amber-700"
                                : "border-l-primary/30 dark:border-l-primary/40"
                          } 
                          dark:bg-gray-800/90 dark:border-gray-700 
                          transition-all duration-300 
                          hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50/50 dark:hover:bg-gray-700/70
                          ${idea.position.current && idea.position.current <= 3 ? "pl-4" : ""}
                        `}
                      >
                        <CardHeader className="bg-white dark:bg-gray-800 pb-3 border-b border-gray-100 dark:border-gray-700 pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {idea.position.current && idea.position.current > 3 && (
                                <Badge 
                                  variant="outline" 
                                  className="mr-2 bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                >
                                  #{idea.position.current}
                                </Badge>
                              )}
                              <CardTitle className="dark:text-white transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5">
                                {idea.title}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const { previous, change } = idea.position;
                                
                                // If it's new or has changed position, show a badge
                                if (previous === null || change !== null) {
                                  // Determine the style class with dark mode support
                                  let badgeClass = "text-xs flex items-center gap-1 ";
                                  let icon = null;
                                  
                                  if (previous === null) {
                                    badgeClass += "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 border border-primary/20 dark:border-primary/30";
                                    icon = <span className="text-xs font-bold">NEW</span>;
                                  } else if (change !== null && change > 0) {
                                    badgeClass += "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50";
                                    icon = <ArrowUp className="h-3 w-3" />;
                                  } else if (change !== null && change < 0) {
                                    badgeClass += "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50";
                                    icon = <ArrowDown className="h-3 w-3" />;
                                  }
                                  
                                  // Determine the text to display
                                  let badgeText = "";
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
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ delay: index * 0.05 + 0.3 }}
                                    >
                                      <Badge className={cn(badgeClass)}>
                                        {icon}
                                        {badgeText}
                                      </Badge>
                                    </motion.div>
                                  );
                                }
                                
                                return null;
                              })()}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4 pb-5">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 transition-all duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                            {idea.description}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <motion.div 
                              className="bg-muted/30 dark:bg-gray-700/50 rounded-full px-3 py-1.5 flex items-center transition-all duration-300 group-hover:shadow-md group-hover:bg-muted/60 dark:group-hover:bg-gray-700/80"
                              whileHover={{ scale: 1.05 }}
                            >
                              <ThumbsUp className="h-4 w-4 text-primary dark:text-primary-400 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-600 dark:group-hover:text-primary-300" />
                              <span className="text-sm font-medium dark:text-gray-300 transition-all duration-300 group-hover:font-semibold">
                                <span className="transition-all duration-300 group-hover:text-primary dark:group-hover:text-primary-300">{idea.votes}</span> {t('common.votes')}
                              </span>
                            </motion.div>
                            
                            {user ? (
                              votedIdeas.has(idea.id) ? (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    disabled
                                    className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400"
                                  >
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    {t('common.voted')}
                                  </Button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  whileHover={{ scale: successVote === idea.id ? 1 : 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <AnimatePresence mode="wait">
                                    {successVote === idea.id ? (
                                      <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 rounded-md px-3 py-1.5 text-sm font-medium flex items-center shadow-md shadow-green-500/10 dark:shadow-green-800/5"
                                      >
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: [0, 1.5, 1] }}
                                          transition={{ duration: 0.5 }}
                                        >
                                          <ThumbsUp className="h-3.5 w-3.5 mr-2" />
                                        </motion.span>
                                        {t('common.thanks')}
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="vote"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                      >
                                        <Button 
                                          size="sm" 
                                          variant="default"
                                          onClick={() => handleVote(idea.id)}
                                          disabled={isVoting[idea.id]}
                                          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 dark:shadow-primary/10 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/20 transition-all"
                                        >
                                          {isVoting[idea.id] ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <ThumbsUp className="h-3.5 w-3.5" />
                                          )}
                                          {t('common.vote')}
                                        </Button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              )
                            ) : (
                              <Link href="/auth">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex items-center gap-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    {t('common.loginToVote')}
                                  </Button>
                                </motion.div>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}