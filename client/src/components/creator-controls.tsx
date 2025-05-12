import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreatorControlsProps {
  onAddIdea: () => void;
}

export default function CreatorControls({ onAddIdea }: CreatorControlsProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 dark:bg-neutral-800">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white">
          {t('dashboard.creatorDashboard', 'Creator Dashboard')}
        </h2>
        <Button
          onClick={onAddIdea}
          className="mt-3 sm:mt-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          {t('ideas.addIdea', 'Add New Idea')}
        </Button>
      </div>
    </div>
  );
}
