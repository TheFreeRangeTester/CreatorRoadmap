import { Button } from "@/components/ui/button";
import { Lightbulb, PlusCircle } from "lucide-react";
import { Link } from "wouter";

interface EmptyStateProps {
  onAddIdea?: () => void;
}

export default function EmptyState({ onAddIdea }: EmptyStateProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow text-center">
      <Lightbulb className="mx-auto h-12 w-12 text-neutral-400" />
      <h3 className="mt-2 text-sm font-medium text-neutral-700">No ideas yet</h3>
      <p className="mt-1 text-sm text-neutral-500">Get started by creating a new idea.</p>
      <div className="mt-6">
        {onAddIdea ? (
          <Button onClick={onAddIdea}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add an idea
          </Button>
        ) : (
          <Link href="/auth">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Login to add an idea
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
