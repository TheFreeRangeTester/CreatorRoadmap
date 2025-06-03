import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, RefreshCcw, LogIn, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

interface MobileMenuProps {
  onLogout?: () => void;
  isCreatorProfile?: boolean;
  onRefresh?: () => void;
  username?: string;
  iconColor?: string;
  transparent?: boolean;
}

export const MobileMenu = ({
  onLogout,
  isCreatorProfile = false,
  onRefresh,
  username,
  iconColor = "text-gray-700 dark:text-gray-200",
  transparent = false,
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        // Default logout behavior if no onLogout prop is provided
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsOpen(false);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant={transparent ? "ghost" : "ghost"}
        size="icon"
        aria-label={t("common.menu", "Menu")}
        onClick={toggleMenu}
        className={`relative z-[60] ${
          transparent
            ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            : "bg-background hover:bg-accent"
        }`}
      >
        {isOpen ? (
          <X className={`h-6 w-6 ${transparent ? "text-white" : iconColor}`} />
        ) : (
          <Menu
            className={`h-6 w-6 ${transparent ? "text-white" : iconColor}`}
          />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("common.menu", "Menú")}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 px-6 py-8 bg-white/80 dark:bg-gray-900/80">
                <div className="flex flex-col gap-6">
                  {user ? (
                    <div className="w-full flex flex-col items-center space-y-6">
                      {/* User info for mobile */}
                      <div className="w-full flex items-center gap-3 text-gray-800 dark:text-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">{user.username}</span>
                      </div>

                      {/* Solo mostrar perfil/dashboard si es creador */}
                      {user.userRole === "creator" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button
                            className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg"
                            size="lg"
                          >
                            <User className="h-5 w-5 mr-2" />
                            {t("common.back", "Dashboard")}
                          </Button>
                        </Link>
                      )}

                      {/* Mostrar perfil solo si es creador y estamos en su perfil */}
                      {user.userRole === "creator" &&
                        isCreatorProfile &&
                        user.username === username && (
                          <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                          >
                            <Button
                              className="w-full justify-center"
                              variant="outline"
                              size="lg"
                            >
                              <User className="h-5 w-5 mr-2" />
                              {t("common.profile", "Settings")}
                            </Button>
                          </Link>
                        )}

                      {/* Botón de refrescar para todos los usuarios autenticados */}
                      {isCreatorProfile && onRefresh && (
                        <Button
                          onClick={handleRefresh}
                          className="w-full justify-center"
                          variant="outline"
                          size="lg"
                        >
                          <RefreshCcw className="h-5 w-5 mr-2" />
                          {t("common.refresh", "Refresh")}
                        </Button>
                      )}

                      <Button
                        onClick={handleLogout}
                        className="w-full justify-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                        variant="outline"
                        size="lg"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        {t("common.logout", "Cerrar sesión")}
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center space-y-4">
                      <Link href="/auth?direct=true" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full justify-center gap-3 h-14 text-base font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={toggleMenu}
                        >
                          <LogIn className="h-5 w-5" />
                          {t("landing.cta.login")}
                        </Button>
                      </Link>
                      <Link href="/auth?direct=true&register=true" className="w-full">
                        <Button
                          className="w-full justify-center gap-3 h-14 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                          onClick={toggleMenu}
                        >
                          <User className="h-5 w-5" />
                          {t("landing.cta.register")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bottom section with toggles */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 p-6">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Idioma:</span>
                    <LanguageToggle />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tema:</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
