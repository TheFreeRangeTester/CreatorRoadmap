import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export const BottomBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 h-16">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
};
