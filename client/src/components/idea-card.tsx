import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Minus, Plus, Pencil, Trash2, ThumbsUp, Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeaResponse } from "@shared/schema";

interface IdeaCardProps {
  idea: IdeaResponse;
  onVote: (ideaId: number) => void;
  onEdit?: (idea: IdeaResponse) => void;
  onDelete?: (ideaId: number) => void;
  isVoting: boolean;
}

export default function IdeaCard({ idea, onVote, onEdit, onDelete, isVoting }: IdeaCardProps) {
  // Check if user has already voted for this idea
  const [hasVoted, setHasVoted] = useState(false);

  // Load voting state from localStorage
  useEffect(() => {
    const votedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
    setHasVoted(votedIdeas.includes(idea.id));
  }, [idea.id]);

  // When successfully voting, update localStorage
  const handleVote = () => {
    if (!hasVoted && !isVoting) {
      onVote(idea.id);
      // Optimistically update UI
      const votedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]");
      votedIdeas.push(idea.id);
      localStorage.setItem("votedIdeas", JSON.stringify(votedIdeas));
      setHasVoted(true);
    }
  };

  // Determine position indicator style and icon
  const getPositionIndicator = () => {
    const { current, previous, change } = idea.position;
    
    // Si no hay posición previa, es una idea nueva
    if (previous === null) {
      return {
        className: "bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300",
        icon: <Plus className="w-3 h-3 mr-1" />,
        text: "New",
      };
    } 
    
    // Si el cambio es positivo (subió de posición)
    if (change !== null && change > 0) {
      return {
        className: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        icon: <ArrowUp className="w-3 h-3 mr-1" />,
        text: change.toString(),
      };
    } 
    
    // Si el cambio es negativo (bajó de posición)
    if (change !== null && change < 0) {
      return {
        className: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        icon: <ArrowDown className="w-3 h-3 mr-1" />,
        text: Math.abs(change).toString(),
      };
    } 
    
    // Si no cambió de posición o el cambio es 0
    return {
      className: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
      icon: <Minus className="w-3 h-3 mr-1" />,
      text: "Same",
    };
  };

  const position = getPositionIndicator();

  return (
    <Card className="idea-card transition-all hover:shadow-md hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">{idea.title}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${position.className}`}>
            {position.icon}
            {position.text}
          </span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">{idea.description}</p>
        
        {/* Mostrar badge si la idea fue sugerida por otro usuario */}
        {idea.suggestedByUsername && (
          <div className="mb-4">
            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 flex items-center gap-1">
              <User className="h-3 w-3" />
              Sugerido por {idea.suggestedByUsername}
            </Badge>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Solo mostrar el botón de voto cuando NO estamos en el dashboard del creador */}
            {!onEdit && !onDelete && (
              <button
                className={`flex items-center px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800 min-w-[70px] transition-all ${
                  hasVoted
                    ? "bg-neutral-100 dark:bg-gray-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                    : "bg-primary-50 dark:bg-primary-900/50 text-primary dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800/70"
                }`}
                onClick={handleVote}
                disabled={hasVoted || isVoting}
              >
                {isVoting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    <span>Voting</span>
                  </span>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {hasVoted ? "Voted" : "Vote"}
                  </>
                )}
              </button>
            )}
            <span className={`${!onEdit && !onDelete ? 'ml-2' : ''} text-sm font-semibold text-neutral-700 dark:text-neutral-300`}>
              {idea.votes} {idea.votes === 1 ? "vote" : "votes"}
            </span>
          </div>
          
          {/* Edit and Delete actions for creators */}
          {(onEdit || onDelete) && (
            <div className="flex space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(idea)}
                  className="p-1 text-neutral-400 hover:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-300"
                  aria-label="Edit idea"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(idea.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                  aria-label="Delete idea"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
