import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { AlertCircle, ExternalLink } from "lucide-react";

export default function FirebaseDomainErrorModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");
  
  useEffect(() => {
    // Verificar si hay un error de Firebase almacenado en sesión
    const hasError = sessionStorage.getItem("firebase_domain_error");
    if (hasError) {
      setCurrentDomain(window.location.hostname);
      setIsOpen(true);
      
      // Limpiamos el error después de mostrarlo
      sessionStorage.removeItem("firebase_domain_error");
    }
  }, []);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            {t('auth.unauthorizedDomain')}
          </DialogTitle>
          <DialogDescription>
            {t('auth.unauthorizedDomainDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 rounded-md text-sm mt-2">
          <p className="font-medium mb-2">Para solucionar este problema:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Ve a la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">consola de Firebase</a></li>
            <li>Selecciona tu proyecto</li>
            <li>Ve a <strong>Authentication &gt; Settings &gt; Authorized domains</strong></li>
            <li>Agrega el siguiente dominio:</li>
          </ol>
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 break-all">
            {currentDomain}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button 
            variant="outline" 
            size="sm"
            className="sm:mt-0"
            onClick={() => setIsOpen(false)}
          >
            Entendido
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              window.open('https://console.firebase.google.com/', '_blank');
            }}
          >
            Ir a Firebase Console <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}