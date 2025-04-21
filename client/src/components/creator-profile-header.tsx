import { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaGlobe } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileEditor from './profile-editor';
import { UserResponse } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

interface CreatorProfileHeaderProps {
  creator: {
    id: number;
    username: string;
    profileDescription?: string | null;
    logoUrl?: string | null;
    twitterUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    tiktokUrl?: string | null;
    websiteUrl?: string | null;
  };
}

export default function CreatorProfileHeader({ creator }: CreatorProfileHeaderProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === creator.id;
  
  // Obtener las iniciales para el avatar fallback
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="p-6 bg-card rounded-lg shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={creator.logoUrl || undefined} alt={creator.username} />
          <AvatarFallback className="text-2xl">{getInitials(creator.username)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{creator.username}</h1>
            {isOwnProfile && <ProfileEditor />}
          </div>
          
          {creator.profileDescription && (
            <p className="mt-2 text-muted-foreground">{creator.profileDescription}</p>
          )}
          
          <div className="flex flex-wrap gap-3 mt-4">
            {creator.twitterUrl && (
              <a 
                href={creator.twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Twitter / X"
              >
                <FaTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter / X</span>
              </a>
            )}
            
            {creator.instagramUrl && (
              <a 
                href={creator.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            )}
            
            {creator.youtubeUrl && (
              <a 
                href={creator.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="YouTube"
              >
                <FaYoutube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
            )}
            
            {creator.tiktokUrl && (
              <a 
                href={creator.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="TikTok"
              >
                <FaTiktok className="h-5 w-5" />
                <span className="sr-only">TikTok</span>
              </a>
            )}
            
            {creator.websiteUrl && (
              <a 
                href={creator.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Sitio Web"
              >
                <FaGlobe className="h-5 w-5" />
                <span className="sr-only">Sitio Web</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}