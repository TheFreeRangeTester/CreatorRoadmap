import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CreatorControlsProps {
  onAddIdea: () => void;
}

export default function CreatorControls({ onAddIdea }: CreatorControlsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-neutral-800">Creator Dashboard</h2>
        <Button
          onClick={onAddIdea}
          className="mt-3 sm:mt-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Idea
        </Button>
      </div>
    </div>
  );
}
