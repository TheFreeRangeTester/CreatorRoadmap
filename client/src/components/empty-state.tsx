import { Button } from "@/components/ui/button";
import { Lightbulb, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAddIdea?: () => void;
}

export default function EmptyState({ onAddIdea }: EmptyStateProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:shadow-gray-900/30 text-center">
      <Lightbulb className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
      <h3 className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {t('ideas.noIdeasYet', 'No ideas yet')}
      </h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {t('ideas.getStarted', 'Get started by creating a new idea.')}
      </p>
      <div className="mt-6">
        {onAddIdea ? (
          <Button onClick={onAddIdea} className="dark:text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('ideas.addIdea', 'Add an idea')}
          </Button>
        ) : (
          <Link href="/auth">
            <Button className="dark:text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('ideas.loginToAdd', 'Login to add an idea')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
