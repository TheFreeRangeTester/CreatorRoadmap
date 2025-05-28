import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { SharingTipsTooltip } from "./sharing-tips-tooltip";

export default function ShareProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const profileUrl = `${window.location.origin}/${user.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: t("common.copySuccess"),
        description: t("common.copyDesc", { url: profileUrl }),
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying:", error);
      // Fallback para móviles o cuando falla el copiado
      toast({
        title: t("common.copySuccess"),
        description: profileUrl,
        variant: "default",
      });
    }
  };

  const handleViewProfile = () => {
    window.open(profileUrl, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("share.title", { username: user.username }),
          text: t("share.text", { username: user.username }),
          url: profileUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        // Solo copiamos al portapapeles si no es un error de cancelación por parte del usuario
        if (typeof err === "object" && err !== null && "name" in err) {
          const errorName = (err as { name: string }).name;
          if (errorName !== "AbortError") {
            handleCopyLink();
          }
        } else {
          handleCopyLink();
        }
      }
    } else {
      // Si el navegador no soporta Web Share API, copiamos al portapapeles
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 dark:border-primary/10 bg-white dark:bg-gray-900">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2 mb-1">
            <CardTitle className="text-2xl font-bold">
              {t("dashboard.yourPublicProfile", "Tu Perfil Público")}
            </CardTitle>
            <SharingTipsTooltip />
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
            >
              {t("dashboard.publicView", "Enlace público")}
            </Badge>
          </div>
          <CardDescription>
            {t(
              "dashboard.shareProfileDesc",
              "Este enlace dirige a tus seguidores a la versión pública de tu perfil, donde pueden ver y votar por tus ideas de contenido."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
              {profileUrl}
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <span className="font-semibold text-primary">
                {t(
                  "dashboard.aboutPublicProfile",
                  "Acerca de tu perfil público:"
                )}{" "}
              </span>
              {t(
                "dashboard.publicProfileVisibility",
                "Esta página es visible para cualquier persona con el enlace, incluso si no tiene cuenta en la plataforma."
              )}
            </p>
            <p>
              {t(
                "dashboard.visitorVoting",
                "Los visitantes pueden ver tus ideas y votar por ellas, ayudándote a determinar qué contenido crear primero."
              )}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4 flex-wrap">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                {t("dashboard.copied", "Copiado")}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {t("dashboard.copyLink", "Copiar enlace")}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={handleViewProfile}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t("dashboard.viewProfile", "Ver perfil")}
          </Button>

          <Button
            variant="default"
            className="flex-1 w-full sm:flex-none bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 dark:text-white"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t("dashboard.shareProfile", "Compartir perfil")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
