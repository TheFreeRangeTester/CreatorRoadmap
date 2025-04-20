import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  
  const setLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguageLabel = () => {
    switch(i18n.language) {
      case 'es':
        return 'ES';
      case 'en':
      default:
        return 'EN';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="outline" size="sm" className="px-2 py-1.5 h-9 gap-1.5 dark:text-gray-300 dark:border-gray-700 dark:hover:text-white">
            <motion.span
              whileHover={{ 
                rotate: [0, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
              className="inline-block"
            >
              <Globe className="h-4 w-4" />
            </motion.span>
            <span className="text-xs font-medium">{getCurrentLanguageLabel()}</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={i18n.language === 'en' ? "bg-primary/10 text-primary" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('es')}
          className={i18n.language === 'es' ? "bg-primary/10 text-primary" : ""}
        >
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}