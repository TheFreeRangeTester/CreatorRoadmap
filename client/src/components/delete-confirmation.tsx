import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmationProps) {
  const { t } = useTranslation();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <AlertDialogTitle>{t('ideas.deleteTitle', 'Delete idea')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t('ideas.confirmDelete', 'Are you sure you want to delete this idea? This action cannot be undone and all votes will be lost.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 min-w-[100px]"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('ideas.deleting', 'Deleting...')}
              </span>
            ) : t('ideas.delete', 'Delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
