import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Construction, ArrowLeft } from "lucide-react";

interface ConstructionPageProps {
  title: string;
  subtitle?: string;
}

export default function ConstructionPage({ title, subtitle }: ConstructionPageProps) {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="mx-auto bg-white dark:bg-gray-800 h-32 w-32 rounded-full flex items-center justify-center shadow-md">
            <Construction className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            {title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {currentLanguage.startsWith('es') 
              ? "Esta página está en construcción." 
              : "This page is under construction."}
          </p>
          
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          
          <div className="pt-4">
            <Link href="/">
              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <ArrowLeft className="h-4 w-4" />
                {currentLanguage.startsWith('es') 
                  ? "Volver a la página principal" 
                  : "Back to home page"}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}