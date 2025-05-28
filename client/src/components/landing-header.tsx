import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { HeaderActions } from "@/components/header-actions";

interface LandingHeaderProps {
  className?: string;
}

export function LandingHeader({ className = "" }: LandingHeaderProps) {
  return (
    <header
      className={`fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <NavLinks />
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  );
}
