import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Globe, 
  Loader2,
  RefreshCw,
  Settings
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";

type UpdateProfile = {
  profileDescription?: string | null;
  logoUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
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
    websiteUrl: user?.websiteUrl || "",
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
        websiteUrl: user.websiteUrl || "",
      });
    }
  }, [user]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccessDesc'),
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-800",
      });
      
      // Refrescar los datos del usuario
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsFormDirty(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('profile.updateError'),
        description: error.message || t('profile.updateErrorDesc'),
        variant: "destructive",
      });
    },
  });
  
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
  }
  
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Filtrar los campos vacíos para convertirlos en null
    const filteredData: UpdateProfile = {};
    Object.entries(profileData).forEach(([key, value]) => {
      filteredData[key as keyof UpdateProfile] = value || null;
    });
    
    updateProfileMutation.mutate(filteredData);
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
        websiteUrl: user.websiteUrl || "",
      });
      setIsFormDirty(false);
    }
  }
  
  // Calcular las iniciales para el avatar fallback
  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };
  
  if (!user) return null;
  
  return (
    <Card className="shadow-md border-t-4 border-t-primary rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/20 space-y-1 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            {t('profile.editProfile')}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">{t('profile.editProfileDesc')}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Perfil y Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
                  <AvatarImage src={profileData.logoUrl || undefined} alt={user.username} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/50 dark:to-blue-900/50 text-primary">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-grow sm:ml-4 w-full">
                <Label htmlFor="logoUrl" className="font-medium">
                  {t('profile.logoUrl')}
                </Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={profileData.logoUrl || ""}
                  onChange={handleChange}
                  placeholder={t('profile.logoUrlPlaceholder')}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('profile.logoUrlHelp')}
                </p>
              </div>
            </div>
            
            {/* Descripción */}
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg">
              <Label htmlFor="profileDescription" className="font-medium">
                {t('profile.description')}
              </Label>
              <Textarea
                id="profileDescription"
                name="profileDescription"
                value={profileData.profileDescription || ""}
                onChange={handleChange}
                placeholder={t('profile.descriptionPlaceholder')}
                className="mt-2 resize-none"
                rows={4}
              />
            </div>
            
            {/* Enlaces sociales */}
            <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg">
              <h3 className="font-medium text-lg mb-4">{t('profile.socialLinks')}</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group relative rounded-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Twitter className="h-4 w-4 text-blue-500 group-focus-within:text-blue-600" />
                  </div>
                  <Input
                    name="twitterUrl"
                    value={profileData.twitterUrl || ""}
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourusername"
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
                    placeholder="https://instagram.com/yourusername"
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
                    placeholder="https://youtube.com/@yourusername"
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
                    placeholder="https://tiktok.com/@yourusername"
                    className="pl-10"
                  />
                </div>
                
                <div className="group relative rounded-md sm:col-span-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Globe className="h-4 w-4 text-primary group-focus-within:text-primary-600" />
                  </div>
                  <Input
                    name="websiteUrl"
                    value={profileData.websiteUrl || ""}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={resetForm}
              disabled={!isFormDirty || updateProfileMutation.isPending}
              className="px-4"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              {t('common.reset')}
            </Button>
            <Button 
              type="submit" 
              size="lg"
              disabled={!isFormDirty || updateProfileMutation.isPending}
              className="px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-600 hover:to-blue-700"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}