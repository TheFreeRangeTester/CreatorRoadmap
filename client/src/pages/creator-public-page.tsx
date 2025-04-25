import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { IdeaResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Share2, RefreshCcw, ThumbsUp, Loader2, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SuggestIdeaDialog from "@/components/suggest-idea-dialog";
import CreatorProfileHeader from "@/components/creator-profile-header";

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
      navigate("/dashboard");
    }
  }, [error, navigate, toast]);
  
  // Efecto para verificar ideas ya votadas por el usuario cuando se carga la página
  useEffect(() => {
    if (user && data?.ideas) {
      // Función para verificar si el usuario ya ha votado por cada idea
      const checkVotedIdeas = async () => {
        try {
          const votedSet = new Set<number>();
          
          // Para cada idea, hacer una llamada silenciosa de verificación
          for (const idea of data.ideas) {
            try {
              // Intentar votar para verificar (modo silencioso, solo para verificación)
              await apiRequest("POST", `/api/creators/${username}/ideas/${idea.id}/vote?check_only=true`);
            } catch (error) {
              // Si devuelve error de "ya votado", registrar esta idea como votada
              if ((error as Error).message?.includes("Ya has votado")) {
                votedSet.add(idea.id);
              }
            }
          }
          
          // Actualizar el conjunto de ideas votadas
          setVotedIdeas(votedSet);
        } catch (error) {
          console.error("Error al verificar ideas votadas:", error);
        }
      };
      
      checkVotedIdeas();
    }
  }, [user, data?.ideas, username]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { ideas, creator } = data;

  const handleVote = async (ideaId: number) => {
    // Si el usuario no está autenticado, mostrar un mensaje y redireccionar a la página de login
    if (!user) {
      toast({
        title: t('common.loginRequired'),
        description: t('common.loginRequiredDesc'),
        variant: "destructive",
      });
      // Opcionalmente podríamos redirigir al usuario a la página de login
      // navigate("/auth");
      return;
    }
    
    // Si ya votamos por esta idea, no hacer nada
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
      
      const response = await apiRequest("POST", endpoint);
      
      // Actualizar el estado local de votaciones
      setVotedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.add(ideaId);
        return newSet;
      });
      
      // Mostrar animación de éxito
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
      console.error("Vote error details:", error);
      
      // Si el error es porque ya votó, actualizamos el estado local
      if ((error as Error).message?.includes("Ya has votado")) {
        setVotedIdeas(prev => {
          const newSet = new Set(prev);
          newSet.add(ideaId);
          return newSet;
        });
      } else {
        // Otros errores
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
    // Construct the URL with the new format /:username (sin /u/)
    const shareUrl = `${window.location.origin}/${creator.username}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: t('common.copySuccess'),
      description: t('common.copyDesc', { url: shareUrl }),
    });
  };

  // Función para obtener la clase CSS del fondo basada en el profileBackground
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
    // Por defecto, devolvemos el gradient-1
    return "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950";
  };

  return (
    <div className={`container px-4 mx-auto py-8 dark:bg-gray-950 min-h-screen ${getBackgroundClass()}`}>
      {/* Perfil del creador con información y redes sociales */}
      <CreatorProfileHeader creator={creator} />
      
      {/* Controles de utilidad */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => refetch()} 
            aria-label="Refresh leaderboard" 
            className="flex items-center dark:text-gray-300 dark:hover:text-white"
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
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleShare} 
            variant="outline" 
            className="flex items-center gap-2 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white"
          >
            <motion.span
              whileHover={{ 
                rotate: [0, 15, -15, 0],
                transition: { duration: 0.5 }
              }}
              className="inline-block"
            >
              <Share2 className="h-4 w-4" />
            </motion.span>
            {t('common.share')}
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
      
      <div className="flex flex-col lg:flex-row gap-4 mb-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/5 dark:to-blue-500/5 p-4 rounded-lg flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('creator.roadmapDescription')}
          </p>
        </div>
        
        {user && (
          <SuggestIdeaDialog username={creator.username} refetch={refetch} />
        )}
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold dark:text-white">{t('creator.noIdeasYet')}</h2>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            {t('creator.noIdeasDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
          {ideas.map((idea, index) => (
            <Card 
              key={idea.id} 
              className={`overflow-hidden border-l-4 group cursor-pointer ${
                idea.position.current === 1 
                  ? "border-l-yellow-400 dark:border-l-yellow-600" 
                  : idea.position.current === 2
                    ? "border-l-gray-400 dark:border-l-gray-500"
                    : idea.position.current === 3
                      ? "border-l-amber-600 dark:border-l-amber-700"
                      : "border-l-transparent"
              } dark:bg-gray-800/90 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50/50 dark:hover:bg-gray-700/70`}
            >
              <CardHeader className="bg-muted/20 dark:bg-gray-800/50 pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {idea.position.current && idea.position.current <= 3 && (
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold transform transition-all duration-300 shadow-md group-hover:scale-110 ${
                          idea.position.current === 1 
                            ? "bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100 group-hover:shadow-yellow-300/50 dark:group-hover:shadow-yellow-500/30 group-hover:rotate-3" 
                            : idea.position.current === 2
                              ? "bg-gray-400 text-gray-900 dark:bg-gray-500 dark:text-gray-100 group-hover:shadow-gray-300/50 dark:group-hover:shadow-gray-400/30 group-hover:-rotate-3"
                              : "bg-amber-600 text-amber-100 dark:bg-amber-700 group-hover:shadow-amber-300/50 dark:group-hover:shadow-amber-600/30 group-hover:rotate-3"
                        }`}
                      >
                        {idea.position.current}
                      </div>
                    )}
                    <CardTitle className="dark:text-white transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5">{idea.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {idea.position.current && idea.position.current > 3 && (
                      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                        #{idea.position.current}
                      </Badge>
                    )}
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 transition-all duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">{idea.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/30 dark:bg-gray-700/50 rounded-full px-3 py-1 flex items-center transition-all duration-300 group-hover:shadow-md group-hover:bg-muted/60 dark:group-hover:bg-gray-700/80">
                      <ThumbsUp className="h-4 w-4 text-primary dark:text-primary-400 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-600 dark:group-hover:text-primary-300" />
                      <span className="text-sm font-medium dark:text-gray-300 transition-all duration-300 group-hover:font-semibold">
                        <span className="transition-all duration-300 group-hover:text-primary dark:group-hover:text-primary-300">{idea.votes}</span> {t('common.votes')}
                      </span>
                    </div>
                  </div>
                  {user ? (
                    votedIdeas.has(idea.id) ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <Button 
                          size="sm" 
                          disabled={true}
                          className="bg-green-500 dark:bg-green-600 hover:bg-green-500 dark:hover:bg-green-600 dark:text-white transition-all duration-300 opacity-90 hover:opacity-100 shadow-sm hover:shadow-md group-hover:shadow-green-400/20"
                        >
                          <motion.span
                            whileHover={{ rotate: 15 }}
                            className="inline-block mr-2"
                          >
                            <ThumbsUp className="h-4 w-4 text-white" />
                          </motion.span>
                          {t('creator.voted')}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <Button 
                          size="sm" 
                          onClick={() => handleVote(idea.id)}
                          disabled={isVoting[idea.id] || successVote === idea.id}
                          className={`transition-all duration-300 shadow-sm hover:shadow-md ${
                            successVote === idea.id 
                              ? "bg-green-500 hover:bg-green-600 dark:text-white shadow-green-400/20" 
                              : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 dark:text-white hover:shadow-primary/20 active:translate-y-0"
                          }`}
                        >
                          {isVoting[idea.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('common.voting')}
                            </>
                          ) : successVote === idea.id ? (
                            <motion.div 
                              className="flex items-center"
                              animate={{ 
                                scale: [1, 1.2, 1],
                                transition: { duration: 0.5, repeat: 2 }
                              }}
                            >
                              <motion.div
                                animate={{ 
                                  rotate: [0, 10, 0, -10, 0],
                                  transition: { duration: 0.5, repeat: 3 }
                                }}
                                className="mr-2"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </motion.div>
                              <span>{t('creator.votedSuccess')}</span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center">
                              <motion.div
                                whileHover={{ rotate: 15, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="mr-2"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </motion.div>
                              <span>{t('common.vote')}</span>
                            </div>
                          )}
                        </Button>
                        
                        {/* Confetti animation when voting success */}
                        {successVote === idea.id && (
                          <motion.div 
                            className="absolute inset-0 pointer-events-none overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                className={`absolute rounded-full h-1.5 w-1.5 opacity-80 ${
                                  ['bg-primary', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400'][i % 5]
                                }`}
                                initial={{ 
                                  x: "50%", 
                                  y: "50%",
                                  scale: 0
                                }}
                                animate={{ 
                                  x: `${50 + (Math.random() * 80 - 40)}%`, 
                                  y: `${50 + (Math.random() * 80 - 40)}%`,
                                  scale: [0, 1, 0.5],
                                  opacity: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 0.6 + Math.random() * 0.2,
                                  ease: [0.23, 1, 0.32, 1]
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  ) : (
                    <Link href="/auth">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed bg-muted/50 hover:bg-muted hover:border-primary/50 transition-all duration-300 hover:shadow-sm dark:hover:border-primary-400/50"
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:text-primary dark:group-hover:text-primary-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-primary-400/80">{t('login.requiredToVote')}</span>
                        </Button>
                      </motion.div>
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