import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { IdeaResponse, suggestIdeaSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Share2, RefreshCcw, ThumbsUp, Loader2, UserPlus, PlusCircle, Lightbulb, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
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
  const [successVote, setSuccessVote] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleVote = async (ideaId: number) => {
    // Si el usuario no está autenticado, mostrar un mensaje y redireccionar a la página de login
    if (!user) {
      toast({
        title: "Inicia sesión para votar",
        description: "Necesitas una cuenta para poder votar por ideas.",
        variant: "destructive",
      });
      // Opcionalmente podríamos redirigir al usuario a la página de login
      // navigate("/auth");
      return;
    }
    
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
    // Construct the URL with the new format /:username
    const shareUrl = `${window.location.origin}/${creator.username}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Roadmap de Contenido de ${creator.username}`,
        text: `¡Echa un vistazo al roadmap de contenido de ${creator.username} y vota por lo que quieres ver próximamente!`,
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
      title: "Enlace copiado",
      description: `Enlace compartible: ${shareUrl}`,
    });
  };

  return (
    <div className="container px-4 mx-auto py-8 dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
            {creator.username}
          </h1>
          <div className="flex flex-col space-y-1">
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Roadmap de Contenido
            </p>
            <p className="text-muted-foreground dark:text-gray-400">
              Vota por el contenido que quieres ver próximamente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => refetch()} aria-label="Refresh leaderboard" className="flex items-center dark:text-gray-300 dark:hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
          <ThemeToggle />
          {user ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              <UserPlus className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Link href="/auth">
              <Button size="sm" variant="default" className="text-xs">
                Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/5 dark:to-blue-500/5 p-4 rounded-lg flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Este roadmap muestra las ideas ordenadas por votos. Tu opinión ayuda a determinar qué contenido se creará primero.
          </p>
        </div>
        
        {user && (
          <SuggestIdeaDialog username={creator.username} refetch={refetch} />
        )}
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold dark:text-white">Sin ideas todavía</h2>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            Este creador aún no ha agregado ideas de contenido.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ideas.map((idea, index) => (
            <Card 
              key={idea.id} 
              className={`overflow-hidden border-l-4 ${
                idea.position.current === 1 
                  ? "border-l-yellow-400 dark:border-l-yellow-600" 
                  : idea.position.current === 2
                    ? "border-l-gray-400 dark:border-l-gray-500"
                    : idea.position.current === 3
                      ? "border-l-amber-600 dark:border-l-amber-700"
                      : "border-l-transparent"
              } dark:bg-gray-800/90 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              <CardHeader className="bg-muted/20 dark:bg-gray-800/50 pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {idea.position.current && idea.position.current <= 3 && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                        idea.position.current === 1 
                          ? "bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100" 
                          : idea.position.current === 2
                            ? "bg-gray-400 text-gray-900 dark:bg-gray-500 dark:text-gray-100"
                            : "bg-amber-600 text-amber-100 dark:bg-amber-700"
                      }`}>
                        {idea.position.current}
                      </div>
                    )}
                    <CardTitle className="dark:text-white">{idea.title}</CardTitle>
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
                      let badgeText = "Igual";
                      if (previous === null) {
                        badgeText = "Nuevo";
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
                    <div className="bg-muted/30 dark:bg-gray-700/50 rounded-full px-3 py-1 flex items-center">
                      <ThumbsUp className="h-4 w-4 text-primary dark:text-primary-400 mr-2" />
                      <span className="text-sm font-medium dark:text-gray-300">{idea.votes} votos</span>
                    </div>
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
                          Votando...
                        </>
                      ) : successVote === idea.id ? (
                        <>
                          <ThumbsUp className="h-4 w-4 mr-2 animate-bounce" />
                          ¡Votado!
                        </>
                      ) : (
                        <>Votar</>
                      )}
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed bg-muted/50 hover:bg-muted"
                      >
                        <span className="text-xs text-gray-600 dark:text-gray-400">Inicia sesión para votar</span>
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

interface SuggestIdeaDialogProps {
  username: string;
  refetch: () => Promise<any>;
}

function SuggestIdeaDialog({ username, refetch }: SuggestIdeaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Crear formulario
  const form = useForm({
    resolver: zodResolver(suggestIdeaSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  });
  
  // Crear mutation para enviar sugerencia
  const suggestMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      try {
        const response = await apiRequest(
          "POST", 
          `/api/creators/${username}/suggest`,
          data
        );
        return await response.json();
      } catch (error) {
        console.error("Error al sugerir idea:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Cerrar el diálogo
      setIsOpen(false);
      // Mostrar mensaje de éxito
      toast({
        title: "Gracias por tu sugerencia",
        description: "Tu idea ha sido enviada al creador para su aprobación.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      // Resetear el formulario
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar sugerencia",
        description: error.message || "Ocurrió un error al enviar tu sugerencia",
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(values: { title: string; description: string }) {
    suggestMutation.mutate(values);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div>
        <Button 
          variant="secondary" 
          className="h-full shadow-sm flex items-center gap-2"
          onClick={() => {
            // Solo abre el diálogo si el usuario está autenticado
            if (user) {
              setIsOpen(true);
            } else {
              toast({
                title: "Inicia sesión para sugerir ideas",
                description: "Necesitas una cuenta para poder sugerir ideas a este creador.",
                variant: "destructive",
              });
              // Opcionalmente podríamos redirigir al usuario a la página de login
              // navigate("/auth");
            }
          }}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Sugerir idea</span>
        </Button>
      </div>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Sugerir idea a {username}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la idea</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Escribe un título conciso" 
                      {...field} 
                      className="dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe con detalle tu idea para el creador"
                      {...field}
                      rows={4}
                      className="resize-none dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={suggestMutation.isPending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                disabled={suggestMutation.isPending}
              >
                {suggestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar sugerencia"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}