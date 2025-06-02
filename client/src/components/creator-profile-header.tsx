import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Twitter, Instagram, Youtube, Globe, ExternalLink } from "lucide-react";
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

export default function CreatorProfileHeader({
  creator,
}: CreatorProfileHeaderProps) {
  const { t } = useTranslation();

  // Calcular las iniciales para el avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Componente más compacto para la vista pública
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
          <AvatarImage
            src={creator.logoUrl || undefined}
            alt={creator.username}
          />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {getInitials(creator.username)}
          </AvatarFallback>
        </Avatar>

        {/* Información del creador */}
        <div>
          <h2 className="text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
            {creator.username}
          </h2>

          {/* Enlaces a redes sociales en formato compacto */}
          <div className="flex flex-wrap gap-1.5">
            {creator.twitterUrl && (
              <SocialLink
                href={creator.twitterUrl}
                icon={<Twitter size={15} />}
                name="Twitter"
                hoverClass="hover:text-blue-500 dark:hover:text-blue-400"
              />
            )}

            {creator.instagramUrl && (
              <SocialLink
                href={creator.instagramUrl}
                icon={<Instagram size={15} />}
                name="Instagram"
                hoverClass="hover:text-pink-500 dark:hover:text-pink-400"
              />
            )}

            {creator.youtubeUrl && (
              <SocialLink
                href={creator.youtubeUrl}
                icon={<Youtube size={15} />}
                name="YouTube"
                hoverClass="hover:text-red-500 dark:hover:text-red-400"
              />
            )}

            {creator.tiktokUrl && (
              <SocialLink
                href={creator.tiktokUrl}
                icon={<FaTiktok size={14} />}
                name="TikTok"
                hoverClass="hover:text-black dark:hover:text-white"
              />
            )}

            {creator.threadsUrl && (
              <SocialLink
                href={creator.threadsUrl}
                icon={<FaThreads size={14} />}
                name="Threads"
                hoverClass="hover:text-black dark:hover:text-white"
              />
            )}

            {creator.websiteUrl && (
              <SocialLink
                href={creator.websiteUrl}
                icon={<Globe size={15} />}
                name={t("common.website")}
                hoverClass="hover:text-primary dark:hover:text-primary-400"
                hasExternalIcon
              />
            )}
          </div>
        </div>
      </div>

      {creator.profileDescription && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {creator.profileDescription}
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para los links sociales
function SocialLink({
  href,
  icon,
  name,
  hoverClass = "hover:text-gray-900 dark:hover:text-white",
  hasExternalIcon = false,
}: {
  href: string;
  icon: React.ReactNode;
  name: string;
  hoverClass?: string;
  hasExternalIcon?: boolean;
}) {
  // Asegurarse de que la URL comience con http:// o https://
  const formattedUrl =
    href.startsWith("http://") || href.startsWith("https://")
      ? href
      : `https://${href}`;

  return (
    <motion.a
      href={formattedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-gray-500 dark:text-gray-400 ${hoverClass} transition-colors bg-gray-100 dark:bg-gray-700/50 rounded-md p-1.5`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={name}
    >
      <span className="flex items-center">
        {icon}
        {hasExternalIcon && (
          <ExternalLink size={10} className="ml-0.5 opacity-70" />
        )}
      </span>
    </motion.a>
  );
}
