import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, User, Settings } from "lucide-react";
import { useLocation } from "wouter";
import ProfileEditor from "@/components/profile-editor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function DashboardSettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect audience users to landing page
  useEffect(() => {
    if (!isLoading && user && user.userRole !== "creator") {
      toast({
        title: t("dashboard.accessDenied", "Access Denied"),
        description: t("dashboard.creatorRequired", "Necesitás una cuenta de creador para acceder al dashboard."),
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isLoading, setLocation, toast, t]);

  const handleBack = () => {
    setLocation("/dashboard");
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render anything for audience users (they'll be redirected)
  if (!user || user.userRole !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
                {t("common.back")}
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Settings className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">{t("dashboard.settings", "Creator Settings")}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?.username && (
                <div className="flex items-center gap-2 mr-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{user.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
              {t("dashboard.creatorSettings", "Creator Settings")}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("dashboard.creatorSettingsDesc", "Manage your creator profile, leaderboard preferences, and public appearance")}
            </p>
          </div>

          {/* Profile Editor for Creator Settings */}
          <ProfileEditor />

          {/* Creator-specific settings */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t("dashboard.leaderboardPreferences", "Leaderboard Preferences")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("dashboard.leaderboardPreferencesDesc", "Configure how your public leaderboard appears to your audience")}
            </p>
            
            {/* Add more creator-specific settings here */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t("dashboard.moreSettingsComing", "More leaderboard customization options coming soon!")}
              </p>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}