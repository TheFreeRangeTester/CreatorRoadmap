import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import ProfileEditor from "@/components/profile-editor";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  // Renderización única para que siempre retorne un elemento
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
            {t('profile.editProfile')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('profile.editProfileDesc')}
          </p>
          
          <div className="max-w-xl">
            <ProfileEditor />
          </div>
        </div>
      )}
    </>
  );
}