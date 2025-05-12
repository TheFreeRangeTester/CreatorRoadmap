import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { Loader2, ArrowLeft, User, Trophy, RotateCcw } from "lucide-react";
import { Link, useLocation } from "wouter";
import ProfileEditor from "@/components/profile-editor";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isLoading, updateRoleMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { resetAchievements, stats } = useAchievements();
  const { toast } = useToast();

  const handleBack = () => {
    setLocation("/dashboard");
  };
  
  const handleResetAchievements = () => {
    resetAchievements();
    toast({
      title: t('achievements.resetSuccess', 'Achievements Reset'),
      description: t('achievements.resetSuccessDesc', 'All your achievements and stats have been reset successfully.'),
      variant: "default",
    });
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
              
              {/* Sección para convertirse en creator (solo si es audience) */}
              {user?.userRole === "audience" && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl shadow-sm border border-blue-200 dark:border-indigo-900/50 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        {t('profile.becomeCreator', '¿Quieres ser creador?')}
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        {t('profile.becomeCreatorDesc', 'Como creador, podrás gestionar tu propio leaderboard de ideas y recibir sugerencias de tu audiencia.')}
                      </p>
                    </div>
                    <Button 
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 self-start md:self-center"
                      onClick={() => {
                        // Confirmar antes de actualizar el rol
                        const confirmed = window.confirm(t('profile.becomeCreatorConfirm', '¿Estás seguro de que quieres convertirte en creador? Podrás comenzar a gestionar tu propio leaderboard de ideas.'));
                        if (confirmed) {
                          updateRoleMutation.mutate(undefined, {
                            onSuccess: () => {
                              toast({
                                title: t('profile.becomeCreatorSuccess', '¡Rol actualizado!'),
                                description: t('profile.becomeCreatorSuccessDesc', 'Tu cuenta ha sido actualizada a creador. Serás redirigido al dashboard.'),
                                variant: "default",
                              });
                              
                              // Redireccionar al dashboard después de actualizar el rol
                              setTimeout(() => {
                                setLocation("/dashboard");
                              }, 1500);
                            }
                          });
                        }
                      }}
                    >
                      {t('profile.becomeCreatorButton', 'Convertirme en creador')}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Sección de Logros */}
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {t('achievements.title', 'Your Achievements')}
                  </h2>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetAchievements}
                    className="flex items-center gap-1.5 text-muted-foreground border-gray-200 dark:border-gray-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('achievements.reset', 'Reset Achievements')}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">{t('achievements.totalVotes', 'Total Votes')}</div>
                    <div className="text-2xl font-bold">{stats.totalVotes}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">{t('achievements.totalPoints', 'Achievement Points')}</div>
                    <div className="text-2xl font-bold">{stats.totalPoints}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">{t('achievements.loginStreak', 'Login Streak')}</div>
                    <div className="text-2xl font-bold">{stats.loginStreak} {t('achievements.days', 'days')}</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">{t('achievements.unlockedAchievements', 'Unlocked Achievements')}</div>
                    <div className="text-2xl font-bold">{stats.unlockedAchievements?.length || 0}</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {t('achievements.resetInfo', 'Resetting your achievements will clear all your stats and progress. This cannot be undone.')}
                </p>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}