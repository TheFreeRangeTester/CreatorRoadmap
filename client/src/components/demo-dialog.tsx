import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import demoGifPath from "@assets/DemoGIF.gif";

interface DemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DemoDialog({ open, onOpenChange }: DemoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Demostración de IdeaVote</DialogTitle>
          <DialogDescription>
            Mira cómo funciona nuestra plataforma para creadores de contenido
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <img 
            src={demoGifPath} 
            alt="Demostración de IdeaVote" 
            className="w-full h-auto"
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          En este video podrás ver todas las funcionalidades principales de la plataforma, incluyendo la creación de ideas, el sistema de votación y el panel de control del creador.
        </div>
      </DialogContent>
    </Dialog>
  );
}