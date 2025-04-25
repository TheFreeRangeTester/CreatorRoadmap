import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Globe, 
  ExternalLink 
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { motion } from "framer-motion";

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
    threadsUrl?: string | null;
    websiteUrl?: string | null;
    profileBackground?: string;
  };
}

export default function CreatorProfileHeader({ creator }: CreatorProfileHeaderProps) {
  const { t } = useTranslation();
  
  // Calcular las iniciales para el avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Avatar */}
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarImage src={creator.logoUrl || undefined} alt={creator.username} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials(creator.username)}
          </AvatarFallback>
        </Avatar>
        
        {/* Información del creador */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
            {creator.username}
          </h1>
          
          {creator.profileDescription && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
              {creator.profileDescription}
            </p>
          )}
          
          {/* Enlaces a redes sociales */}
          <div className="flex flex-wrap gap-3 mt-3">
            {creator.twitterUrl && (
              <motion.a 
                href={creator.twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter size={18} />
              </motion.a>
            )}
            
            {creator.instagramUrl && (
              <motion.a 
                href={creator.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram size={18} />
              </motion.a>
            )}
            
            {creator.youtubeUrl && (
              <motion.a 
                href={creator.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube size={18} />
              </motion.a>
            )}
            
            {creator.tiktokUrl && (
              <motion.a 
                href={creator.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTiktok size={16} />
              </motion.a>
            )}
            
            {creator.threadsUrl && (
              <motion.a 
                href={creator.threadsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaThreads size={16} />
              </motion.a>
            )}
            
            {creator.websiteUrl && (
              <motion.a 
                href={creator.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={16} />
                <span className="text-xs">{t('common.website')}</span>
                <ExternalLink size={12} />
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}