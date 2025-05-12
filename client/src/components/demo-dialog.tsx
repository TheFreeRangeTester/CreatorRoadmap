import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import demoGifPath from "@assets/DemoGIF.gif";
import { useTranslation } from "react-i18next";

interface DemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DemoDialog({ open, onOpenChange }: DemoDialogProps) {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('landing.demo.title')}</DialogTitle>
          <DialogDescription>
            {t('landing.demo.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <img 
            src={demoGifPath} 
            alt={t('landing.demo.alt')} 
            className="w-full h-auto"
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('landing.demo.details')}
        </div>
      </DialogContent>
    </Dialog>
  );
}