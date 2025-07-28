import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import ProfileEditor from "@/components/profile-editor";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isLoading, updateRoleMutation } = useAuth();
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
                    {t("common.back")}
                  </Button>
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
                  {t("profile.editProfile")}
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {t("profile.editProfileDesc")}
                </p>
              </div>

              <ProfileEditor />

              {/* Sección para convertirse en creator (solo si es audience) */}
              {user?.userRole === "audience" && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl shadow-sm border border-blue-200 dark:border-indigo-900/50 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        {t("profile.becomeCreator", "¿Quieres ser creador?")}
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        {t(
                          "profile.becomeCreatorDesc",
                          "Como creador, podrás gestionar tu propio leaderboard de ideas y recibir sugerencias de tu audiencia."
                        )}
                      </p>
                    </div>
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 self-start md:self-center"
                      onClick={() => {
                        // Confirmar antes de actualizar el rol
                        const confirmed = window.confirm(
                          t(
                            "profile.becomeCreatorConfirm",
                            "¿Estás seguro de que quieres convertirte en creador? Podrás comenzar a gestionar tu propio leaderboard de ideas."
                          )
                        );
                        if (confirmed) {
                          updateRoleMutation.mutate(undefined, {
                            onSuccess: () => {
                              toast({
                                title: t(
                                  "profile.becomeCreatorSuccess",
                                  "¡Rol actualizado!"
                                ),
                                description: t(
                                  "profile.becomeCreatorSuccessDesc",
                                  "Tu cuenta ha sido actualizada a creador. Serás redirigido al dashboard."
                                ),
                                variant: "default",
                              });

                              // Redireccionar al dashboard después de actualizar el rol
                              setTimeout(() => {
                                setLocation("/dashboard");
                              }, 1500);
                            },
                          });
                        }
                      }}
                    >
                      {t(
                        "profile.becomeCreatorButton",
                        "Convertirme en creador"
                      )}
                    </Button>
                  </div>
                </div>
              )}


            </div>
          </main>
        </div>
      )}
    </>
  );
}
