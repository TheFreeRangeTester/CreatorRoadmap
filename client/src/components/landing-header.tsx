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
      className={`fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <Link href="/auth?direct=true">
                <Button variant="outline">{t("landing.cta.login")}</Button>
              </Link>
              <Link href="/auth?direct=true&register=true">
                <Button>{t("landing.cta.register")}</Button>
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
