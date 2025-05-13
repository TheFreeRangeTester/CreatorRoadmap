import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, RefreshCcw, LogIn } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

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
  transparent = false 
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
        aria-label={t('common.menu', 'Menu')}
        onClick={toggleMenu}
        className={`relative z-50 ${transparent ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' : ''}`}
      >
        {isOpen ? (
          <X className={`h-5 w-5 ${transparent ? 'text-white' : iconColor}`} />
        ) : (
          <Menu className={`h-5 w-5 ${transparent ? 'text-white' : iconColor}`} />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-40 pt-16 ${transparent ? 'bg-gradient-to-b from-blue-600 to-indigo-900' : 'bg-white dark:bg-gray-900'}`}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col items-center gap-6">
              {isCreatorProfile ? (
                // Vista específica para el perfil del creador
                <div className="w-full flex flex-col items-center space-y-6">
                  {onRefresh && (
                    <Button 
                      onClick={handleRefresh}
                      className={`w-full justify-center ${transparent ? 'bg-white/10 text-white hover:bg-white/20' : ''}`}
                      variant={transparent ? "ghost" : "outline"}
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      {t('common.refresh', 'Actualizar')}
                    </Button>
                  )}
                  
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="flex justify-center w-full">
                      <ThemeToggle />
                    </div>
                    <div className="flex justify-center w-full">
                      <LanguageToggle />
                    </div>
                  </div>
                  
                  {user ? (
                    <div className="w-full text-center flex flex-col space-y-4">
                      <div className={`rounded-md text-sm flex items-center justify-center gap-2 py-2.5 ${transparent ? 'bg-white/25 text-white shadow-md border border-white/20' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}>
                        <User className="h-4 w-4 text-blue-200" />
                        <span className="font-semibold text-base">{user.username}</span>
                      </div>
                      
                      <Button 
                        onClick={handleLogout}
                        className="w-full justify-center"
                        variant={transparent ? "ghost" : "outline"}
                        size="sm"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('common.logout', 'Cerrar sesión')}
                      </Button>
                    </div>
                  ) : (
                    <Link to={`/auth?referrer=/creators/${username}`} onClick={() => setIsOpen(false)} className="w-full">
                      <Button 
                        className="w-full justify-center"
                        variant={transparent ? "ghost" : "default"}
                        size="sm"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('common.loginToVote', 'Iniciar sesión para votar')}
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                // Vista para el dashboard y demás páginas
                user ? (
                  <div className="w-full flex flex-col items-center space-y-6">
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 px-4 py-2 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                        <User className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                        <span className="font-medium">{user.username}</span>
                      </Badge>
                    </Link>
                    
                    <div className="flex flex-col items-center space-y-4 w-full">
                      <div className="flex justify-center w-full">
                        <ThemeToggle />
                      </div>
                      <div className="flex justify-center w-full">
                        <LanguageToggle />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleLogout}
                      className="w-full justify-center"
                      variant="outline"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('common.logout', 'Cerrar sesión')}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-6">
                    <div className="flex flex-col items-center space-y-4 w-full">
                      <div className="flex justify-center w-full">
                        <ThemeToggle />
                      </div>
                      <div className="flex justify-center w-full">
                        <LanguageToggle />
                      </div>
                    </div>
                    
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center">
                        {t('common.login', 'Iniciar sesión')}
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};