import { useTranslation } from "react-i18next";

interface NavLinksProps {
  className?: string;
}

export function NavLinks({ className = "" }: NavLinksProps) {
  const { t } = useTranslation();

  return (
    <div className={`hidden md:flex items-center gap-6 ${className}`}>
      <a
        href="#features"
        className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
      >
        {t("landing.menu.features")}
      </a>
      <a
        href="#pricing"
        className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
      >
        {t("landing.menu.pricing")}
      </a>
      <a
        href="#testimonials"
        className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
      >
        {t("landing.menu.testimonials")}
      </a>
    </div>
  );
}
