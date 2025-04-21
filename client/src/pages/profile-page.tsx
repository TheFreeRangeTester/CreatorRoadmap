import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import ProfileEditor from "@/components/profile-editor";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/");
  };

  // Renderización única para que siempre retorne un elemento
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
          {/* Header */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="mr-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground" 
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('common.back')}
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  {user?.username && (
                    <div className="flex items-center gap-2 mr-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
                  {t('profile.editProfile')}
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {t('profile.editProfileDesc')}
                </p>
              </div>
              
              <ProfileEditor />
            </div>
          </main>
        </div>
      )}
    </>
  );
}