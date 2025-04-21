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
    <Card>
      <CardHeader className="bg-muted/30 dark:bg-gray-800/50 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t('profile.editProfile')}</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>{t('profile.editProfileDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-20 w-20 mb-3 border-2 border-primary/20">
                <AvatarImage src={profileData.logoUrl || undefined} alt={user.username} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full">
                <Label htmlFor="logoUrl" className="text-sm font-medium">
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
            
            <div>
              <Label htmlFor="profileDescription" className="text-sm font-medium">
                {t('profile.description')}
              </Label>
              <Textarea
                id="profileDescription"
                name="profileDescription"
                value={profileData.profileDescription || ""}
                onChange={handleChange}
                placeholder={t('profile.descriptionPlaceholder')}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t('profile.socialLinks')}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Twitter className="h-4 w-4 text-blue-500 mr-2" />
                  <Input
                    name="twitterUrl"
                    value={profileData.twitterUrl || ""}
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
                
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 text-pink-500 mr-2" />
                  <Input
                    name="instagramUrl"
                    value={profileData.instagramUrl || ""}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                
                <div className="flex items-center">
                  <Youtube className="h-4 w-4 text-red-500 mr-2" />
                  <Input
                    name="youtubeUrl"
                    value={profileData.youtubeUrl || ""}
                    onChange={handleChange}
                    placeholder="https://youtube.com/@yourusername"
                  />
                </div>
                
                <div className="flex items-center">
                  <FaTiktok className="h-3.5 w-3.5 mr-2.5 ml-0.5" />
                  <Input
                    name="tiktokUrl"
                    value={profileData.tiktokUrl || ""}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@yourusername"
                  />
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-primary mr-2" />
                  <Input
                    name="websiteUrl"
                    value={profileData.websiteUrl || ""}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <CardFooter className="px-0 pt-6 pb-0 flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={resetForm}
              disabled={!isFormDirty || updateProfileMutation.isPending}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {t('common.reset')}
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={!isFormDirty || updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}