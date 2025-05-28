import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/mobile-menu";

interface HeaderActionsProps {
  className?: string;
}

export function HeaderActions({ className = "" }: HeaderActionsProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="hidden md:flex gap-2">
        <Link href="/auth?direct=true">
          <Button variant="outline">{t("landing.cta.login")}</Button>
        </Link>
        <Link href="/auth?direct=true&register=true">
          <Button>{t("landing.cta.register")}</Button>
        </Link>
      </div>
      <div className="md:hidden">
        <MobileMenu />
      </div>
    </div>
  );
}
