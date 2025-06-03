import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

interface LandingHeaderProps {
  className?: string;
}

export function LandingHeader({ className = "" }: LandingHeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className={`fixed w-full bg-gradient-to-b from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-50 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <Link href="/auth?direct=true">
                <Button
                  variant="outline"
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
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
