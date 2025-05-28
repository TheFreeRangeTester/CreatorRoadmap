import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, RefreshCcw, LogIn } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

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
    <div className="md:hidden">
      <Button
        variant={transparent ? "ghost" : "ghost"}
        size="icon"
        aria-label={t("common.menu", "Menu")}
        onClick={toggleMenu}
        className={`relative z-[60] ${
          transparent
            ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            : ""
        }`}
      >
        {isOpen ? (
          <X className={`h-5 w-5 ${transparent ? "text-white" : iconColor}`} />
        ) : (
          <Menu
            className={`h-5 w-5 ${transparent ? "text-white" : iconColor}`}
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
            className={`fixed inset-0 z-50 pt-16 ${
              transparent
                ? "bg-gradient-to-b from-blue-600 to-indigo-900"
                : "bg-white dark:bg-gray-900"
            }`}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col items-center gap-6">
              {isCreatorProfile ? (
                // Vista específica para el perfil del creador
                <div className="w-full flex flex-col items-center space-y-6">
                  {onRefresh && (
                    <Button
                      onClick={handleRefresh}
                      className={`w-full justify-center ${
                        transparent
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : ""
                      }`}
                      variant={transparent ? "ghost" : "outline"}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      {t("common.refresh", "Actualizar")}
                    </Button>
                  )}

                  {user ? (
                    <Button
                      onClick={handleLogout}
                      className="w-full justify-center"
                      variant={transparent ? "ghost" : "outline"}
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("common.logout", "Cerrar sesión")}
                    </Button>
                  ) : (
                    <Link
                      to={`/auth?referrer=/creators/${username}`}
                      onClick={() => setIsOpen(false)}
                      className="w-full"
                    >
                      <Button
                        className="w-full justify-center"
                        variant={transparent ? "ghost" : "default"}
                        size="sm"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {t("common.loginToVote", "Iniciar sesión para votar")}
                      </Button>
                    </Link>
                  )}
                </div>
              ) : // Vista para el dashboard y demás páginas
              user ? (
                <div className="w-full flex flex-col items-center space-y-6">
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-center"
                    variant="outline"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("common.logout", "Cerrar sesión")}
                  </Button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-6">
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-center max-w-xs">
                      <LogIn className="h-4 w-4 mr-2" />
                      {t("common.login", "Iniciar sesión")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
