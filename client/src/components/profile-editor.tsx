import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Twitter,
  Instagram,
  Youtube,
  Globe,
  Loader2,
  RefreshCw,
  Settings,
  PaintBucket,
  CheckIcon,
  Share2,
  Copy,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";

type UpdateProfile = {
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

export default function ProfileEditor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState<UpdateProfile>({
    profileDescription: user?.profileDescription || "",
    logoUrl: user?.logoUrl || "",
    twitterUrl: user?.twitterUrl || "",
    instagramUrl: user?.instagramUrl || "",
    youtubeUrl: user?.youtubeUrl || "",
    tiktokUrl: user?.tiktokUrl || "",
    threadsUrl: user?.threadsUrl || "",
    websiteUrl: user?.websiteUrl || "",
    profileBackground: user?.profileBackground || "gradient-1",
  });

  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        profileDescription: user.profileDescription || "",
        logoUrl: user.logoUrl || "",
        twitterUrl: user.twitterUrl || "",
        instagramUrl: user.instagramUrl || "",
        youtubeUrl: user.youtubeUrl || "",
        tiktokUrl: user.tiktokUrl || "",
        threadsUrl: user.threadsUrl || "",
        websiteUrl: user.websiteUrl || "",
        profileBackground: user.profileBackground || "gradient-1",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const response = await apiRequest("/api/user/profile", { 
        method: "PATCH", 
        body: JSON.stringify(data) 
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDesc"),
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });

      // Refrescar los datos del usuario
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsFormDirty(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("profile.updateError"),
        description: error.message || t("profile.updateErrorDesc"),
        variant: "destructive",
      });
    },
  });

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Preparar datos para actualizar el perfil
    const updateData: UpdateProfile = {
      profileDescription: profileData.profileDescription || undefined,
      logoUrl: profileData.logoUrl ? profileData.logoUrl : null,
      twitterUrl: profileData.twitterUrl ? profileData.twitterUrl : null,
      instagramUrl: profileData.instagramUrl ? profileData.instagramUrl : null,
      youtubeUrl: profileData.youtubeUrl ? profileData.youtubeUrl : null,
      tiktokUrl: profileData.tiktokUrl ? profileData.tiktokUrl : null,
      threadsUrl: profileData.threadsUrl ? profileData.threadsUrl : null,
      websiteUrl: profileData.websiteUrl ? profileData.websiteUrl : null,
      profileBackground: profileData.profileBackground || "gradient-1",
    };

    updateProfileMutation.mutate(updateData);
  }

  function resetForm() {
    if (user) {
      setProfileData({
        profileDescription: user.profileDescription || "",
        logoUrl: user.logoUrl || "",
        twitterUrl: user.twitterUrl || "",
        instagramUrl: user.instagramUrl || "",
        youtubeUrl: user.youtubeUrl || "",
        tiktokUrl: user.tiktokUrl || "",
        threadsUrl: user.threadsUrl || "",
        websiteUrl: user.websiteUrl || "",
        profileBackground: user.profileBackground || "gradient-1",
      });
      setIsFormDirty(false);
    }
  }

  // Calcular las iniciales para el avatar fallback
  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
  };

  if (!user) return null;

  return (
    <Card className="shadow-md border-t-4 border-t-primary rounded-md bg-white dark:bg-gray-900 w-full max-w-none">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/20 space-y-3 pb-6 px-4 sm:px-6 pt-6">
        <div className="w-full overflow-hidden">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center justify-center gap-2 break-words leading-relaxed text-center">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="break-words">{t("profile.editProfile")}</span>
          </CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed break-words">
          {t("profile.editProfileDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Perfil y Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-md">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
                  <AvatarImage
                    src={profileData.logoUrl || undefined}
                    alt={user.username}
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/50 dark:to-blue-900/50 text-primary">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-grow sm:ml-4 w-full">
                <Label htmlFor="logoUrl" className="font-medium">
                  {t("profile.logoUrl")}
                </Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={profileData.logoUrl || ""}
                  onChange={handleChange}
                  placeholder={t("profile.logoUrlPlaceholder")}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("profile.logoUrlHelp")}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md">
              <Label htmlFor="profileDescription" className="font-medium">
                {t("profile.description")}
              </Label>
              <Textarea
                id="profileDescription"
                name="profileDescription"
                value={profileData.profileDescription || ""}
                onChange={handleChange}
                placeholder={t("profile.descriptionPlaceholder")}
                className="mt-2 resize-none"
                rows={4}
              />
            </div>

            {/* Compartir Perfil */}
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-lg">
                  {t("profile.shareProfile")}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {t("profile.shareProfileDesc")}
              </p>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border">
                <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                  {window.location.origin}/{user.username.toLowerCase()}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/${user.username.toLowerCase()}`;
                    navigator.clipboard.writeText(url).then(() => {
                      toast({
                        title: t("profile.linkCopied", "¡Enlace copiado!"),
                        description: t("profile.linkCopiedDesc", "El enlace de tu perfil se copió al portapapeles"),
                        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
                      });
                    }).catch(() => {
                      toast({
                        title: t("profile.copyError", "Error al copiar"),
                        description: t("profile.copyErrorDesc", "No se pudo copiar el enlace"),
                        variant: "destructive",
                      });
                    });
                  }}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {t("common.copy", "Copiar")}
                </Button>
              </div>
            </div>

            {/* Fondo del perfil */}
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md">
              <div className="flex items-center gap-2 mb-4">
                <PaintBucket className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-lg">
                  {t("profile.background") || "Fondo del perfil"}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {t("profile.backgroundDesc") ||
                  "Elige un fondo para tu perfil público. El patrón se adaptará automáticamente al modo claro/oscuro."}
              </p>

              <RadioGroup
                value={profileData.profileBackground}
                onValueChange={(value) => {
                  setProfileData((prev) => ({
                    ...prev,
                    profileBackground: value,
                  }));
                  setIsFormDirty(true);
                }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative">
                  <RadioGroupItem
                    value="gradient-1"
                    id="gradient-1"
                    className="absolute right-2 top-2"
                  />
                  <div className="w-full h-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded overflow-hidden"></div>
                  <label
                    htmlFor="gradient-1"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t("profile.gradient1") || "Sutil"}
                  </label>
                </div>

                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative">
                  <RadioGroupItem
                    value="gradient-2"
                    id="gradient-2"
                    className="absolute right-2 top-2"
                  />
                  <div className="w-full h-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded overflow-hidden"></div>
                  <label
                    htmlFor="gradient-2"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t("profile.gradient2") || "Azul/Índigo"}
                  </label>
                </div>

                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative">
                  <RadioGroupItem
                    value="gradient-3"
                    id="gradient-3"
                    className="absolute right-2 top-2"
                  />
                  <div className="w-full h-16 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 rounded overflow-hidden"></div>
                  <label
                    htmlFor="gradient-3"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t("profile.gradient3") || "Verde/Teal"}
                  </label>
                </div>

                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative">
                  <RadioGroupItem
                    value="gradient-4"
                    id="gradient-4"
                    className="absolute right-2 top-2"
                  />
                  <div className="w-full h-16 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 rounded overflow-hidden"></div>
                  <label
                    htmlFor="gradient-4"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t("profile.gradient4") || "Rosa/Naranja"}
                  </label>
                </div>

                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative">
                  <RadioGroupItem
                    value="pattern-1"
                    id="pattern-1"
                    className="absolute right-2 top-2"
                  />
                  <div
                    className="w-full h-16 bg-gray-50 dark:bg-gray-900 rounded overflow-hidden"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, gray 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                  <label
                    htmlFor="pattern-1"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t("profile.pattern1") || "Puntos"}
                  </label>
                </div>

                <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative">
                  <RadioGroupItem
                    value="pattern-2"
                    id="pattern-2"
                    className="absolute right-2 top-2"
                  />
                  <div
                    className="w-full h-16 bg-gray-50 dark:bg-gray-900 rounded overflow-hidden"
                    style={{
                      backgroundImage:
                        "linear-gradient(gray 1px, transparent 1px), linear-gradient(to right, gray 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                  <label
                    htmlFor="pattern-2"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t("profile.pattern2") || "Cuadrícula"}
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Enlaces sociales */}
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md">
              <h3 className="font-medium text-lg mb-4">
                {t("profile.socialLinks")}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Twitter className="h-4 w-4 text-blue-500 group-focus-within:text-blue-600" />
                  </div>
                  <Input
                    name="twitterUrl"
                    value={profileData.twitterUrl || ""}
                    onChange={handleChange}
                    placeholder={t(
                      "profile.twitterPlaceholder",
                      "Tu nombre de usuario (ej: johndoe)"
                    )}
                    className="pl-10"
                  />
                </div>

                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Instagram className="h-4 w-4 text-pink-500 group-focus-within:text-pink-600" />
                  </div>
                  <Input
                    name="instagramUrl"
                    value={profileData.instagramUrl || ""}
                    onChange={handleChange}
                    placeholder={t(
                      "profile.instagramPlaceholder",
                      "Tu nombre de usuario (ej: johndoe)"
                    )}
                    className="pl-10"
                  />
                </div>

                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Youtube className="h-4 w-4 text-red-500 group-focus-within:text-red-600" />
                  </div>
                  <Input
                    name="youtubeUrl"
                    value={profileData.youtubeUrl || ""}
                    onChange={handleChange}
                    placeholder={t(
                      "profile.youtubePlaceholder",
                      "Tu nombre de usuario (ej: johndoe)"
                    )}
                    className="pl-10"
                  />
                </div>

                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaTiktok className="h-3.5 w-3.5 text-gray-800 dark:text-gray-300 group-focus-within:text-gray-900 dark:group-focus-within:text-white" />
                  </div>
                  <Input
                    name="tiktokUrl"
                    value={profileData.tiktokUrl || ""}
                    onChange={handleChange}
                    placeholder={t(
                      "profile.tiktokPlaceholder",
                      "Tu nombre de usuario (ej: johndoe)"
                    )}
                    className="pl-10"
                  />
                </div>

                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaThreads className="h-3.5 w-3.5 text-gray-800 dark:text-gray-300 group-focus-within:text-gray-900 dark:group-focus-within:text-white" />
                  </div>
                  <Input
                    name="threadsUrl"
                    value={profileData.threadsUrl || ""}
                    onChange={handleChange}
                    placeholder={t(
                      "profile.threadsPlaceholder",
                      "Tu nombre de usuario (ej: johndoe)"
                    )}
                    className="pl-10"
                  />
                </div>

                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Globe className="h-4 w-4 text-primary group-focus-within:text-primary-600" />
                  </div>
                  <Input
                    name="websiteUrl"
                    value={profileData.websiteUrl || ""}
                    onChange={handleChange}
                    placeholder={t(
                      "profile.websitePlaceholder",
                      "URL completa de tu sitio web"
                    )}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 px-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetForm}
              disabled={!isFormDirty || updateProfileMutation.isPending}
              className="w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 min-w-[120px]"
            >
              <RefreshCw className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{t("common.reset")}</span>
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!isFormDirty || updateProfileMutation.isPending}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-600 hover:to-blue-700 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  <span>{t("common.saving")}</span>
                </>
              ) : (
                <span>{t("common.save")}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
