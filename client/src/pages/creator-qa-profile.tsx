import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import AchievementsContainer from "@/components/achievements-container";
import { IdeaResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Share2,
  Plus,
  ThumbsUp,
  Loader2,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
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

export default function CreatorQAProfile() {
  const params = useParams();
  const [, navigate] = useLocation();
  const username = params?.username;
  const [isVoting, setIsVoting] = useState<{ [key: number]: boolean }>({});
  const [successVote, setSuccessVote] = useState<number | null>(null);
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

  // Efecto para verificar ideas ya votadas por el usuario cuando se carga la página
  useEffect(() => {
    if (user && data?.ideas) {
      // Función para verificar si el usuario ya ha votado por cada idea
      const checkVotedIdeas = async () => {
        try {
          const votedSet = new Set<number>();
          const existingVotedIdeas = JSON.parse(
            localStorage.getItem("votedIdeas") || "[]"
          );

          // Añadir todas las ideas de localStorage
          for (const ideaId of existingVotedIdeas) {
            votedSet.add(ideaId);
          }

          // Para cada idea, hacer una llamada silenciosa de verificación
          for (const idea of data.ideas) {
            if (!votedSet.has(idea.id)) {
              try {
                // Intentar votar para verificar (modo silencioso, solo para verificación)
                await apiRequest(
                  "POST",
                  `/api/creators/${username}/ideas/${idea.id}/vote?check_only=true`
                );
                // Si llegamos aquí, el usuario no ha votado por esta idea
              } catch (error) {
                // Si devuelve error de "ya votado", registrar esta idea como votada
                const errorMsg = (error as Error).message || "";
                if (
                  errorMsg.includes("Ya has votado") ||
                  errorMsg.includes("You have already voted") ||
                  errorMsg.includes("already voted")
                ) {
                  votedSet.add(idea.id);

                  // También actualizar localStorage si es necesario
                  if (!existingVotedIdeas.includes(idea.id)) {
                    existingVotedIdeas.push(idea.id);
                    localStorage.setItem(
                      "votedIdeas",
                      JSON.stringify(existingVotedIdeas)
                    );
                  }
                }
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

  // Efecto para manejar votaciones pendientes después de autenticación
  useEffect(() => {
    // Solo ejecutar si el usuario está autenticado y hay datos
    if (user && data?.ideas) {
      const pendingVoteIdeaId = localStorage.getItem("pendingVoteIdeaId");
      const pendingVoteUsername = localStorage.getItem("pendingVoteUsername");

      // Si hay una votación pendiente y corresponde a este perfil
      if (pendingVoteIdeaId && pendingVoteUsername === username) {
        const ideaId = parseInt(pendingVoteIdeaId, 10);

        // Verificar que la idea exista en este perfil
        const ideaExists = data.ideas.some((idea) => idea.id === ideaId);

        if (ideaExists) {
          // Limpiar los datos almacenados para evitar repeticiones
          localStorage.removeItem("pendingVoteIdeaId");
          localStorage.removeItem("pendingVoteUsername");

          // Ejecutar la votación pendiente después de un breve retraso
          // para asegurar que todas las verificaciones de estado se completen
          setTimeout(() => {
            handleVote(ideaId);
          }, 500);
        }
      }
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

  // Ordenar ideas por número de votos (más votados primero)
  const sortedIdeas = [...ideas].sort((a, b) => b.votes - a.votes);

  const handleVote = async (ideaId: number) => {
    // Si el usuario no está autenticado, redirigir a la página de login con estado de regreso
    if (!user) {
      // Guardar la idea en la que el usuario quería votar para recuperarla después
      localStorage.setItem("pendingVoteIdeaId", ideaId.toString());
      localStorage.setItem("pendingVoteUsername", username as string);

      // Redirigir a la página de autenticación, indicando que debe regresar aquí
      navigate(`/auth?referrer=/${username}`);

      return;
    }

    // Si ya votamos por esta idea, no hacer nada
    if (votedIdeas.has(ideaId)) {
      toast({
        title: t("common.alreadyVoted"),
        description: t("common.alreadyVotedDesc"),
        variant: "default",
      });
      return;
    }

    try {
      setIsVoting((prev) => ({ ...prev, [ideaId]: true }));

      const endpoint = `/api/creators/${username}/ideas/${ideaId}/vote`;

      // Importante: incluir las credenciales para que la sesión se mantenga
      const response = await apiRequest("POST", endpoint);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Actualizar el estado local de votaciones
      setVotedIdeas((prev) => {
        const newSet = new Set(prev);
        newSet.add(ideaId);
        return newSet;
      });

      // Guardar en localStorage
      const existingVotedIdeas = JSON.parse(
        localStorage.getItem("votedIdeas") || "[]"
      );
      if (!existingVotedIdeas.includes(ideaId)) {
        existingVotedIdeas.push(ideaId);
        localStorage.setItem("votedIdeas", JSON.stringify(existingVotedIdeas));
      }

      // Mostrar animación de éxito
      setSuccessVote(ideaId);
      setTimeout(() => setSuccessVote(null), 2000);

      // Refetch data to update UI
      await refetch();

      toast({
        title: t("common.thankYou"),
        description: t("common.yourOpinionMatters"),
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
    } catch (error) {
      console.error("Vote error details:", error);

      // Si el error es porque ya votó, actualizamos el estado local
      if (
        (error as Error).message?.includes("Ya has votado") ||
        (error as Error).message?.includes("already voted")
      ) {
        setVotedIdeas((prev) => {
          const newSet = new Set(prev);
          newSet.add(ideaId);
          return newSet;
        });
      } else if (
        (error as Error).message?.includes("401") ||
        (error as Error).message?.includes("Authentication required")
      ) {
        // Error de autenticación - sesión expirada o no válida
        toast({
          title: t("common.sessionExpired"),
          description: t("common.pleaseLoginAgain"),
          variant: "destructive",
        });

        // Almacenar datos para volver a intentar después de iniciar sesión
        localStorage.setItem("pendingVoteIdeaId", ideaId.toString());
        localStorage.setItem("pendingVoteUsername", username as string);

        // Redirigir a autenticación
        setTimeout(() => navigate(`/auth?referrer=/${username}`), 1500);
      } else {
        // Otros errores
        toast({
          title: t("creator.voteError"),
          description: (error as Error).message || t("creator.voteErrorDesc"),
          variant: "destructive",
        });
      }
    } finally {
      setIsVoting((prev) => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/${creator.username}`;

    // Verificar si la API Web Share está disponible y es seguro usarla
    if (navigator.share && window.isSecureContext) {
      try {
        navigator
          .share({
            title: t("share.title", { username: creator.username }),
            text: t("share.text", { username: creator.username }),
            url: shareUrl,
          })
          .catch((error) => {
            console.error("Error sharing:", error);
            copyToClipboard(shareUrl);
          });
      } catch (error) {
        console.error("Error al intentar compartir:", error);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    // Usar un método más seguro para copiar al portapapeles
    try {
      // Intenta usar la API moderna de clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(url)
          .then(() => showShareSuccess(url))
          .catch((err) => {
            console.error("Error al copiar con clipboard API:", err);
            fallbackCopyToClipboard(url);
          });
      } else {
        fallbackCopyToClipboard(url);
      }
    } catch (err) {
      console.error("Error en copyToClipboard:", err);
      toast({
        title: t("common.copyError"),
        description: t("common.copyErrorDesc"),
        variant: "destructive",
      });
    }
  };

  // Método alternativo para navegadores que no soportan clipboard API
  const fallbackCopyToClipboard = (url: string) => {
    try {
      // Crear un elemento textarea temporal
      const textArea = document.createElement("textarea");
      textArea.value = url;

      // Evitar el desplazamiento
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Ejecutar el comando de copia
      const successful = document.execCommand("copy");

      // Limpiar
      document.body.removeChild(textArea);

      if (successful) {
        showShareSuccess(url);
      } else {
        throw new Error(
          t("common.copyExecCommandError", "Could not copy using execCommand")
        );
      }
    } catch (err) {
      console.error("Error en fallbackCopyToClipboard:", err);
      toast({
        title: t("common.copyError"),
        description: t("common.copyManualDesc", { url }),
        variant: "destructive",
      });
    }
  };

  // Mostrar mensaje de éxito cuando se copia la URL
  const showShareSuccess = (url: string) => {
    toast({
      title: t("common.copySuccess"),
      description: t("common.copyDesc", { url }),
      className:
        "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-800",
    });
  };

  // Iniciales para el Avatar Fallback
  const getInitials = () => {
    if (!creator.username) return "??";
    return creator.username.substring(0, 2).toUpperCase();
  };

  // Renderizar ícono de red social si está disponible
  const renderSocialIcon = (
    url: string | null | undefined,
    icon: React.ReactNode,
    label: string
  ) => {
    if (!url) return null;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label={label}
      >
        {icon}
      </a>
    );
  };

  // Aplicar el fondo personalizado si está definido
  const getBackgroundStyle = () => {
    if (!creator.profileBackground) return {};

    // Convertir el formato del fondo para que coincida con las opciones de la interfaz de usuario
    let backgroundKey = creator.profileBackground;

    // Convertir de formato gradient-1 a gradient1 si es necesario
    if (backgroundKey && backgroundKey.includes("-")) {
      backgroundKey = backgroundKey.replace("-", "");
    }

    switch (backgroundKey) {
      case "gradient1":
      case "gradient-1":
        return {
          backgroundImage:
            "linear-gradient(to right bottom, var(--tw-gradient-stops))",
          "--tw-gradient-from": "rgb(249, 250, 251)",
          "--tw-gradient-to": "rgb(243, 244, 246)",
          "--tw-gradient-stops":
            "var(--tw-gradient-from), var(--tw-gradient-to)",
        };
      case "gradient2":
      case "gradient-2":
        return {
          backgroundImage:
            "linear-gradient(to right bottom, rgb(239, 246, 255), rgb(219, 234, 254))",
          "--tw-gradient-from": "rgb(239, 246, 255)",
          "--tw-gradient-to": "rgb(219, 234, 254)",
          "--tw-gradient-stops":
            "var(--tw-gradient-from), var(--tw-gradient-to)",
        };
      case "gradient3":
      case "gradient-3":
        return {
          backgroundImage:
            "linear-gradient(to right bottom, rgb(236, 253, 245), rgb(209, 250, 229))",
          "--tw-gradient-from": "rgb(236, 253, 245)",
          "--tw-gradient-to": "rgb(209, 250, 229)",
          "--tw-gradient-stops":
            "var(--tw-gradient-from), var(--tw-gradient-to)",
        };
      case "gradient4":
      case "gradient-4":
        return {
          backgroundImage:
            "linear-gradient(to right bottom, rgb(254, 242, 242), rgb(254, 226, 226))",
          "--tw-gradient-from": "rgb(254, 242, 242)",
          "--tw-gradient-to": "rgb(254, 226, 226)",
          "--tw-gradient-stops":
            "var(--tw-gradient-from), var(--tw-gradient-to)",
        };
      case "pattern1":
      case "pattern-1":
        return {
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(229, 231, 235) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        };
      case "pattern2":
      case "pattern-2":
        return {
          backgroundImage:
            "linear-gradient(to right, rgb(229, 231, 235) 1px, transparent 1px), linear-gradient(to bottom, rgb(229, 231, 235) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        };
      default:
        return {};
    }
  };

  // Compatibilidad con modo oscuro
  const getDarkModeBackgroundStyle = () => {
    if (!creator.profileBackground) return {};

    // Convertir el formato del fondo para que coincida con las opciones de la interfaz de usuario
    let backgroundKey = creator.profileBackground;

    // Convertir de formato gradient-1 a gradient1 si es necesario
    if (backgroundKey && backgroundKey.includes("-")) {
      backgroundKey = backgroundKey.replace("-", "");
    }

    switch (backgroundKey) {
      case "gradient1":
      case "gradient-1":
        return {
          "--tw-gradient-from": "rgb(17, 24, 39)",
          "--tw-gradient-to": "rgb(31, 41, 55)",
        };
      case "gradient2":
      case "gradient-2":
        return {
          "--tw-gradient-from": "rgb(30, 58, 138)",
          "--tw-gradient-to": "rgb(30, 64, 175)",
        };
      case "gradient3":
      case "gradient-3":
        return {
          "--tw-gradient-from": "rgb(6, 78, 59)",
          "--tw-gradient-to": "rgb(4, 120, 87)",
        };
      case "gradient4":
      case "gradient-4":
        return {
          "--tw-gradient-from": "rgb(127, 29, 29)",
          "--tw-gradient-to": "rgb(153, 27, 27)",
        };
      case "pattern1":
      case "pattern-1":
        return {
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(75, 85, 99) 1px, transparent 0)",
        };
      case "pattern2":
      case "pattern-2":
        return {
          backgroundImage:
            "linear-gradient(to right, rgb(75, 85, 99) 1px, transparent 1px), linear-gradient(to bottom, rgb(75, 85, 99) 1px, transparent 1px)",
        };
      default:
        return {};
    }
  };

  // Función para obtener el tema actual
  const getThemeStyles = () => {
    if (typeof window === "undefined") return getBackgroundStyle();

    // Comprueba si el tema es oscuro
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return { ...getBackgroundStyle(), ...getDarkModeBackgroundStyle() };
    }

    return getBackgroundStyle();
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Inter,system-ui,sans-serif] pb-16"
      style={getThemeStyles()}
    >
      {/* Contenedor para animaciones de logros (solo en esta página) */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AchievementsContainer />
      </div>
      {/* Header con controles y estado de usuario */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-10">
        {user && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
              {t("common.greeting", "👋🏻Hi")} {user.username}
            </span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.logoUrl || ""} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {user.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.userRole === "audience" && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-2">
                {t("roles.audience", "Audience member")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sección de Perfil */}
      <div className="container mx-auto px-4 py-4 pt-16">
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden max-w-2xl mx-auto mb-6">
          <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
            {/* Etiqueta de perfil público */}
            <Badge
              variant="outline"
              className="mb-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 text-xs"
            >
              {t("creator.publicProfileView", "Perfil Público")}
            </Badge>

            <div className="flex items-center gap-4 w-full">
              <Avatar className="w-16 h-16 ring-2 ring-primary/10">
                <AvatarImage
                  src={creator.logoUrl || ""}
                  alt={creator.username}
                />
                <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary dark:bg-primary-900/30 dark:text-primary-300">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {creator.username}
                </h1>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {creator.profileDescription ||
                    t(
                      "creator.defaultProfileDescription",
                      "QA Engineer and content creator focused on software testing, automation, and quality control best practices."
                    )}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  {renderSocialIcon(
                    creator.twitterUrl,
                    <svg
                      className="h-3.5 w-3.5 fill-current text-blue-400"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>,
                    "Twitter"
                  )}
                  {renderSocialIcon(
                    creator.instagramUrl,
                    <svg
                      className="h-3.5 w-3.5 fill-current text-pink-500"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>,
                    "Instagram"
                  )}
                  {renderSocialIcon(
                    creator.youtubeUrl,
                    <svg
                      className="h-3.5 w-3.5 fill-current text-red-500"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>,
                    "YouTube"
                  )}
                  {renderSocialIcon(
                    creator.tiktokUrl,
                    <svg
                      className="h-3.5 w-3.5 fill-current text-gray-900 dark:text-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>,
                    "TikTok"
                  )}
                  {renderSocialIcon(
                    creator.threadsUrl,
                    <svg
                      className="h-3.5 w-3.5 fill-current text-gray-900 dark:text-white"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22.001 7.203v.17a5.91 5.91 0 0 1-1.163 3.62 9.301 9.301 0 0 1-3.318 2.79 11.973 11.973 0 0 1-4.408 1.28 9.05 9.05 0 0 1-1.222.07v.7c.032 1.433.422 2.772 1.043 3.97.67 1.24 1.554 2.41 2.42 3.53l-1.514.49c-.54-1.26-1.43-2.5-2.34-3.2a7.64 7.64 0 0 0-5.642-2.39c-1.983 0-3.853.722-5.4 2.13l-1.057-1.2a9.31 9.31 0 0 1 6.457-2.62c1.985 0 3.813.63 5.362 1.84-1.003-1.23-1.74-2.85-1.943-4.74h-.24c-1.75 0-3.42-.43-4.952-1.26-1.46-.89-2.66-2.18-3.39-3.74-.29-.6-.5-1.22-.617-1.87A6.57 6.57 0 0 1 .76 5.3v-.17a6.82 6.82 0 0 1 1.923-4.77A6.15 6.15 0 0 1 7.186 0h9.63a6.14 6.14 0 0 1 4.498 1.97 6.82 6.82 0 0 1 1.922 4.8zm-2.52.17a4.8 4.8 0 0 0-1.41-3.43 4.53 4.53 0 0 0-3.325-1.39h-9.63a4.54 4.54 0 0 0-3.327 1.39 4.8 4.8 0 0 0-1.412 3.43v.17a4.8 4.8 0 0 0 1.412 3.43 4.53 4.53 0 0 0 3.327 1.37h.2c.16 0 .316-.05.473-.08.11-.02.22-.05.326-.08.14-.04.28-.08.42-.13s.27-.1.4-.17c.142-.07.276-.15.414-.23s.26-.17.385-.26c.125-.1.247-.2.363-.3s.224-.22.332-.34a4.9 4.9 0 0 0 .69-1c.085-.18.156-.35.217-.54.065-.2.123-.41.156-.62.033-.24.064-.48.07-.72v-.6a11.13 11.13 0 0 0-.243-2.35 11.59 11.59 0 0 0-.705-2.22 12.15 12.15 0 0 0-1.133-2.04c-.224-.33-.457-.65-.7-.95a10.77 10.77 0 0 0-.807-.91 2.518 2.518 0 0 1 1.632.27c.478.25.868.67 1.12 1.15a2.9 2.9 0 0 1-.003 2.6c-.27.56-.72 1.03-1.25 1.34-.53.32-1.15.48-1.75.48v2.39c.635 0 1.23-.13 1.83-.23a9.5 9.5 0 0 0 3.56-1.48c1.01-.72 1.87-1.67 2.49-2.78a5.46 5.46 0 0 0 .79-2.85z" />
                    </svg>,
                    "Threads"
                  )}
                  {renderSocialIcon(
                    creator.websiteUrl,
                    <ExternalLink className="h-3.5 w-3.5 text-gray-900 dark:text-white" />,
                    "Website"
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Votaciones */}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            🗳️ {t("creator.voteHeaderTitle")}
          </h2>

          <div className="flex gap-2">
            <Button
              onClick={() => setSuggestDialogOpen(true)}
              variant={user ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1.5 ${
                !user ? "border-dashed" : ""
              }`}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user
                  ? t("suggestIdea.button")
                  : t("suggestIdea.loginToSuggest", "Login to suggest")}
              </span>
              <span className="sm:hidden">
                {user
                  ? t("common.suggest", "Suggest")
                  : t("common.login", "Login")}
              </span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("common.share", "Share")}
              </span>
            </Button>
          </div>
        </div>

        {sortedIdeas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {t("ideas.noSuggestedIdeas", "No suggested ideas yet")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t(
                "suggestIdea.beFirstToSuggest",
                "Be the first to suggest a content idea"
              )}
            </p>
            <Button onClick={() => setSuggestDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("suggestIdea.button", "Suggest idea")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                whileHover={{ scale: 1.02 }}
                className="will-change-transform"
              >
                <Card
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    index < 3
                      ? "border-l-4 " +
                        (index === 0
                          ? "border-l-yellow-500"
                          : index === 1
                          ? "border-l-gray-400"
                          : "border-l-amber-600")
                      : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex p-4">
                      <div className="flex-shrink-0 w-16 sm:w-20 flex flex-col items-center justify-center mr-4 border-r dark:border-gray-700">
                        <div
                          className={`text-2xl sm:text-3xl font-bold ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-500"
                              : index === 2
                              ? "text-amber-600"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {idea.votes}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {idea.votes === 1
                            ? t("badges.vote", "vote")
                            : t("badges.votes", "votes")}
                        </div>
                        {index < 3 && (
                          <Badge
                            className={`mt-2 ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : index === 1
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                          >
                            #{index + 1}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-400 transition-colors">
                          {idea.title}
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t dark:border-gray-700 p-3 flex justify-end">
                    {user ? (
                      votedIdeas.has(idea.id) ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            disabled
                            className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-md transition-all duration-300 ring-2 ring-green-200 dark:ring-green-800 pulse-success"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {t("common.voted", "Voted")}
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            size="sm"
                            className={`${
                              successVote === idea.id
                                ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg scale-105 pulse-success"
                                : "bg-blue-500 hover:bg-blue-600"
                            } 
                            text-white transition-all duration-300 shadow-md`}
                            onClick={() => handleVote(idea.id)}
                            disabled={isVoting[idea.id]}
                          >
                            {isVoting[idea.id] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ThumbsUp className="h-4 w-4 mr-2" />
                            )}
                            {t("common.vote", "Vote")}
                          </Button>
                        </motion.div>
                      )
                    ) : (
                      <Link href={`/auth?referrer=/${username}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-dashed border-gray-300 dark:border-gray-600 hover:bg-primary/10 dark:hover:bg-primary-900/20 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary-400/50 float-animation"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t("common.loginToVote", "Login to vote")}
                          </Button>
                        </motion.div>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal to suggest an idea */}
      <SuggestIdeaModal
        username={creator.username}
        open={suggestDialogOpen}
        onOpenChange={setSuggestDialogOpen}
        onSuccess={async () => {
          await refetch();
        }}
      />
    </div>
  );
}
