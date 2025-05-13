import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import AchievementsContainer from "@/components/achievements-container";
import { AchievementType } from "@/components/achievement-animation";
import { IdeaResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Share2, 
  RefreshCcw, 
  ThumbsUp, 
  Loader2, 
  UserPlus, 
  User, 
  Trophy, 
  Twitter, 
  Instagram, 
  Youtube, 
  Globe, 
  ChevronRight,
  MoreVertical,
  LogIn,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NewSuggestionModal } from "@/components/new-suggestion-modal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIMATION_EFFECTS, CustomSplitText, registerGSAPPlugins, useStaggerCards, useFloatingElement } from "@/components/gsap-animations";
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
  const { registerVote, showAchievement } = useAchievements();
  
  // Referencias para las animaciones
  const pageRef = useRef<HTMLDivElement>(null);
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
  
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-indigo-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
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
      
      // Redirect to login page with referrer parameter to come back to this profile
      // Store current location for redirect after auth
      localStorage.setItem('redirectAfterAuth', `/creators/${username}`);
      setTimeout(() => {
        navigate(`/auth?referrer=/creators/${username}`);
      }, 1500);
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
      
      // Registrar el voto para el sistema de logros
      registerVote(ideaId);
      
      // Comprobar si es el primer voto
      const existingVotedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
      if (existingVotedIdeas.length === 0) {
        // Muestra la animación del logro del primer voto
        showAchievement(AchievementType.FIRST_VOTE);
      } else if (existingVotedIdeas.length >= 4) {
        // Si ya ha votado más de 5 ideas (incluyendo esta), mostrar logro de 10 votos
        showAchievement(AchievementType.TEN_VOTES);
      }
      
      // Comprobar si está votando a una idea del Top 3
      const idea = ideas.find(i => i.id === ideaId);
      if (idea?.position?.current && idea.position.current <= 3) {
        // Mostrar logro de votar a una idea Top
        showAchievement(AchievementType.VOTED_TOP_IDEA);
      }
      
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

  // Referencia para el trofeo animado
  const trophyRef = useRef(null);
  
  // Aplicar efecto de flotación al trofeo
  useFloatingElement(trophyRef, {
    amplitude: 4,
    frequency: 3,
    rotation: true
  });

  // Función para obtener el fondo del gradient según el índice
  const getGradientBackground = (index: number) => {
    const gradients = [
      "bg-gradient-to-r from-blue-600 to-indigo-700", 
      "bg-gradient-to-r from-purple-600 to-indigo-700",
      "bg-gradient-to-r from-pink-600 to-rose-700",
      "bg-gradient-to-r from-amber-500 to-orange-600",
      "bg-gradient-to-r from-emerald-500 to-teal-600",
      "bg-gradient-to-r from-cyan-500 to-blue-600"
    ];
    
    return gradients[index % gradients.length];
  };

  // Ordenamos las ideas para que primero aparezcan las TOP 3
  const sortedIdeas = [...ideas].sort((a, b) => {
    // Si ambas tienen posición actual
    if (a.position.current && b.position.current) {
      return a.position.current - b.position.current;
    }
    // Si solo a tiene posición
    if (a.position.current && !b.position.current) {
      return -1;
    }
    // Si solo b tiene posición
    if (!a.position.current && b.position.current) {
      return 1;
    }
    // Si ninguna tiene posición, ordenar por votos
    return (b.votes || 0) - (a.votes || 0);
  });

  return (
    <div ref={pageRef} className="min-h-screen">
      {/* Contenedor para animaciones de logros (solo en esta página) */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AchievementsContainer />
      </div>
      
      <div className="bg-gradient-to-b from-blue-600 to-indigo-900 min-h-screen pb-16">
        <div className="container mx-auto px-4 max-w-3xl pt-6">
          {/* Barra superior con controles de utilidad (minimalista) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
            {/* Estado de inicio de sesión */}
            <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs mr-1 flex items-center border border-white/10">
              {user ? (
                <div className="flex items-center gap-1.5">
                  <span>{t('common.logged', 'Logged in')}: {user.username}</span>
                  <Link to="/" className="hover:text-white/80">
                    <LogOut className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <Link to={`/auth?referrer=/creators/${username}`} className="flex items-center gap-1.5 hover:text-white/80">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{t('common.loginToVote')}</span>
                </Link>
              )}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => refetch()} 
                aria-label={t('common.refresh')}
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </motion.div>
            <ThemeToggle />
            <LanguageToggle />
          </div>
          
          {/* Perfil del creador simplificado al estilo Linktree */}
          <div className="text-center mb-10">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={creator.logoUrl || undefined} alt={creator.username} />
              <AvatarFallback className="text-3xl bg-white/10 text-white">
                {creator.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <motion.h1 
              className="text-2xl font-bold mb-2 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              @{creator.username}
            </motion.h1>
            
            {creator.profileDescription && (
              <motion.p 
                className="text-white/80 max-w-md mx-auto mb-5 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {creator.profileDescription}
              </motion.p>
            )}
            
            {/* Botón para sugerir ideas */}
            <motion.div
              className="mt-4 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <NewSuggestionModal
                username={creator.username} 
                onSuggestionSuccess={refetch}
                buttonStyle="secondary"
                fullWidth={true} 
              />
            </motion.div>
            
            {/* Iconos sociales en línea */}
            <motion.div 
              className="flex justify-center gap-3 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {creator.twitterUrl && (
                <motion.a 
                  href={creator.twitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter size={16} />
                </motion.a>
              )}
              
              {creator.instagramUrl && (
                <motion.a 
                  href={creator.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram size={16} />
                </motion.a>
              )}
              
              {creator.youtubeUrl && (
                <motion.a 
                  href={creator.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Youtube size={16} />
                </motion.a>
              )}
              
              {creator.tiktokUrl && (
                <motion.a 
                  href={creator.tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTiktok size={14} />
                </motion.a>
              )}
              
              {creator.threadsUrl && (
                <motion.a 
                  href={creator.threadsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaThreads size={14} />
                </motion.a>
              )}
              
              {creator.websiteUrl && (
                <motion.a 
                  href={creator.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe size={16} />
                </motion.a>
              )}
              
              <motion.button
                onClick={handleShare}
                className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 size={16} />
              </motion.button>
            </motion.div>
            
            {/* Botón para sugerir idea flotante */}
            {user && (
              <motion.div 
                className="mb-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <NewSuggestionModal 
                  username={creator.username} 
                  onSuggestionSuccess={refetch} 
                  buttonStyle="outline" 
                  fullWidth={false} 
                />
              </motion.div>
            )}
          </div>
          
          {/* Lista de ideas estilo Linktree */}
          <div ref={ideasContainerRef} className="space-y-4 max-w-xl mx-auto">
            {ideas.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-white/50" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  {t('creator.noIdeasYet')}
                </h2>
                <p className="text-white/70 max-w-md mx-auto">
                  {t('creator.noIdeasDescription')}
                </p>
              </div>
            ) : (
              sortedIdeas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                >
                  <motion.div 
                    className={`relative rounded-xl overflow-hidden backdrop-blur-md ${getGradientBackground(index)} cursor-pointer transition-all duration-300`}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    layoutId={`idea-card-${idea.id}`}
                  >
                    {/* Posición y medalla para TOP 3 */}
                    {idea.position.current && idea.position.current <= 3 && (
                      <div className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center">
                        <div className={`
                          absolute inset-0
                          ${idea.position.current === 1 
                            ? "bg-yellow-500/30"
                            : idea.position.current === 2 
                              ? "bg-gray-400/30" 
                              : "bg-amber-600/30"
                          }
                        `}></div>
                        <span className="relative text-white font-bold text-sm">
                          #{idea.position.current}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-4 flex items-center gap-3 relative group">
                      <div className="flex-grow">
                        <div className="font-semibold text-white mb-1 pr-6">
                          {idea.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-white/20 text-white text-xs rounded-full px-2 py-0.5 flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {idea.votes}
                          </div>
                          
                          {/* Mostrar cambios en posición */}
                          {(() => {
                            const { previous, change } = idea.position;
                            
                            if (previous === null) {
                              return (
                                <div className="bg-white/20 text-white text-xs rounded-full px-2 py-0.5">
                                  {t('badges.new')}
                                </div>
                              );
                            } else if (change !== null && change > 0) {
                              return (
                                <div className="bg-green-500/20 text-white text-xs rounded-full px-2 py-0.5 flex items-center">
                                  ↑{change}
                                </div>
                              );
                            } else if (change !== null && change < 0) {
                              return (
                                <div className="bg-red-500/20 text-white text-xs rounded-full px-2 py-0.5 flex items-center">
                                  ↓{Math.abs(change)}
                                </div>
                              );
                            }
                            
                            return null;
                          })()}
                        </div>
                      </div>
                      
                      {user ? (
                        votedIdeas.has(idea.id) ? (
                          <div className="bg-green-500/30 text-white text-xs font-medium rounded-full px-3 py-1.5 flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {t('common.voted')}
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleVote(idea.id)}
                            disabled={isVoting[idea.id]}
                            className="bg-white/20 hover:bg-white/30 text-white border-none"
                          >
                            {isVoting[idea.id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1">{t('common.vote')}</span>
                          </Button>
                        )
                      ) : (
                        <Link href="/auth">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="bg-white/20 hover:bg-white/30 text-white border-none"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span className="ml-1">{t('common.vote')}</span>
                          </Button>
                        </Link>
                      )}
                      
                      {/* Tooltip con descripción en hover */}
                      <AnimatePresence>
                        <motion.div 
                          className="absolute opacity-0 group-hover:opacity-100 top-full left-0 right-0 z-50 mt-2 p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-md border border-white/20 dark:border-gray-700/50"
                          initial={{ opacity: 0, y: -5 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {idea.description ? (
                              <>
                                <p className="font-medium mb-1">{idea.title}</p>
                                <p className="text-xs opacity-80 line-clamp-3">{idea.description}</p>
                              </>
                            ) : (
                              <p className="text-xs opacity-80 italic">{t('common.noDescription', 'No description available')}</p>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            )}
            
            {/* Botón para iniciar sesión al final */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.5,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className="mt-6 text-center"
              >
                <Link href="/auth">
                  <Button
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
                    variant="outline"
                  >
                    {t('common.joinFanlist')}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-center mt-10 text-white/50 text-xs space-y-2">
            <p>{t('creator.wantLeaderboard', '¿Quieres tener tu propio Leaderboard?')} <Link href="/" className="hover:text-white transition-colors underline">{t('creator.getStarted', 'Comenzar ahora')}</Link></p>
            <p>Powered by <Link href="/" className="hover:text-white transition-colors">Fanlist</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}