import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UpdateProfile } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Check, X } from "lucide-react";

export default function ProfileEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<UpdateProfile>({
    profileDescription: user?.profileDescription || "",
    logoUrl: user?.logoUrl || "",
    twitterUrl: user?.twitterUrl || "",
    instagramUrl: user?.instagramUrl || "",
    youtubeUrl: user?.youtubeUrl || "",
    tiktokUrl: user?.tiktokUrl || "",
    websiteUrl: user?.websiteUrl || ""
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  }

  function resetForm() {
    setFormData({
      profileDescription: user?.profileDescription || "",
      logoUrl: user?.logoUrl || "",
      twitterUrl: user?.twitterUrl || "",
      instagramUrl: user?.instagramUrl || "",
      youtubeUrl: user?.youtubeUrl || "",
      tiktokUrl: user?.tiktokUrl || "",
      websiteUrl: user?.websiteUrl || ""
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar perfil</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar perfil de creador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="profileDescription">Descripción del perfil</Label>
            <Textarea 
              id="profileDescription"
              name="profileDescription"
              value={formData.profileDescription || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Describe quién eres y qué tipo de contenido creas"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del Logo o Avatar</Label>
            <Input 
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl || ""}
              onChange={handleChange}
              placeholder="https://ejemplo.com/mi-logo.png"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Sitio Web</Label>
            <Input 
              id="websiteUrl"
              name="websiteUrl"
              value={formData.websiteUrl || ""}
              onChange={handleChange}
              placeholder="https://miwebsite.com"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input 
                id="twitterUrl"
                name="twitterUrl"
                value={formData.twitterUrl || ""}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input 
                id="instagramUrl"
                name="instagramUrl"
                value={formData.instagramUrl || ""}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube</Label>
              <Input 
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl || ""}
                onChange={handleChange}
                placeholder="https://youtube.com/@channel"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tiktokUrl">TikTok</Label>
              <Input 
                id="tiktokUrl"
                name="tiktokUrl"
                value={formData.tiktokUrl || ""}
                onChange={handleChange}
                placeholder="https://tiktok.com/@username"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4 flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={updateProfileMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}