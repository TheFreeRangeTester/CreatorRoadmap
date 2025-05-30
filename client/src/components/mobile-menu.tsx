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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
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
            className="fixed inset-0 z-50 bg-background md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {t("common.menu", "Menú")}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="text-foreground"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 px-4 py-6">
                <div className="flex flex-col gap-6">
                  {user ? (
                    <div className="w-full flex flex-col items-center space-y-6">
                      {/* User info for mobile */}
                      <div className="w-full flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg">
                        <User className="h-5 w-5" />
                        <span className="font-medium">{user.username}</span>
                      </div>

                      {/* Solo mostrar perfil/dashboard si es creador */}
                      {user.userRole === "creator" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button
                            className="w-full justify-center"
                            variant="outline"
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
                        className="w-full justify-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        variant="outline"
                        size="lg"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        {t("common.logout", "Cerrar sesión")}
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center space-y-6">
                      <Link href="/auth?direct=true">
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          size="lg"
                          onClick={toggleMenu}
                        >
                          <LogIn className="h-5 w-5" />
                          {t("landing.cta.login")}
                        </Button>
                      </Link>
                      <Link href="/auth?direct=true&register=true">
                        <Button
                          className="w-full justify-start gap-2"
                          size="lg"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
