import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DemoDialog({ open, onOpenChange }: DemoDialogProps) {
  // Podríamos cargar el GIF de forma diferida (lazy-loading)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga para evitar que la imagen parpadee
    if (open) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Demo Interactiva de IdeaVote</DialogTitle>
          <DialogDescription>
            Así es como funciona nuestra plataforma para creadores de contenido y su audiencia
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {isLoading ? (
              <div className="h-[420px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              // Aquí va el GIF cuando lo tengamos disponible
              <div className="bg-gray-50 dark:bg-gray-900 aspect-video flex items-center justify-center p-4">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  [Demo GIF - Placeholder]
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>✓ Votación en tiempo real:</strong> Tu audiencia puede votar por el contenido que más les interesa</p>
            <p><strong>✓ Leaderboard dinámico:</strong> Visualiza cómo las ideas suben y bajan de posición</p>
            <p><strong>✓ Sugerencias de la comunidad:</strong> Tu audiencia puede proponer ideas directamente</p>
            <p><strong>✓ Enlaces compartibles:</strong> Comparte tu leaderboard en redes sociales y sitios web</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}