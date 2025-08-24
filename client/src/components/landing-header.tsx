import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { useAuth } from "@/hooks/use-auth";
import { User, LogOut } from "lucide-react";

interface LandingHeaderProps {
  className?: string;
}

export function LandingHeader({ className = "" }: LandingHeaderProps) {
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Force page reload to clear any cached state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      className={`fixed w-full bg-gradient-to-b from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-50 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-6">
            {/* Show different content based on authentication state */}
            {user ? (
              <>
                {/* Desktop authenticated state */}
                <div className="hidden md:flex gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                  {user.userRole === "creator" && (
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-800 dark:to-blue-700 hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-700 dark:hover:to-blue-600"
                      >
                        {t("common.dashboard", "Dashboard")}
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? t("common.logging_out", "Cerrando...") : t("common.logout", "Cerrar sesión")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Desktop unauthenticated state */}
                <div className="hidden md:flex gap-2">
                  <Link href="/auth?direct=true">
                    <Button
                      variant="outline"
                      onClick={() => localStorage.setItem('attemptingCreatorLogin', 'true')}
                      className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600"
                    >
                      {t("landing.cta.login")}
                    </Button>
                  </Link>
                  <Link href="/auth?direct=true&register=true">
                    <Button className="bg-gradient-to-r from-primary via-blue-500 to-primary hover:from-primary/90 hover:via-blue-600 hover:to-primary/90 text-white">
                      {t("landing.cta.register")}
                    </Button>
                  </Link>
                </div>
              </>
            )}
            
            {/* Desktop toggles */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            {/* Mobile menu */}
            <div className="md:hidden">
              <MobileMenu transparent={true} onLogout={user ? handleLogout : undefined} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
