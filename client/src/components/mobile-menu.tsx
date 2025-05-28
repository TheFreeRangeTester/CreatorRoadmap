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
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>

                  {isCreatorProfile ? (
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
                          <RefreshCcw className="h-5 w-5 mr-2" />
                          {t("common.refresh", "Actualizar")}
                        </Button>
                      )}

                      {user ? (
                        <Button
                          onClick={handleLogout}
                          className="w-full justify-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          variant="outline"
                          size="lg"
                        >
                          <LogOut className="h-5 w-5 mr-2" />
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
                            size="lg"
                          >
                            <LogIn className="h-5 w-5 mr-2" />
                            {t(
                              "common.loginToVote",
                              "Iniciar sesión para votar"
                            )}
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : user ? (
                    <div className="w-full flex flex-col items-center space-y-6">
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button
                          className="w-full justify-center max-w-xs"
                          variant="outline"
                          size="lg"
                        >
                          <User className="h-5 w-5 mr-2" />
                          <span className="font-medium">{user.username}</span>
                        </Button>
                      </Link>

                      <Button
                        onClick={handleLogout}
                        className="w-full justify-center max-w-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
