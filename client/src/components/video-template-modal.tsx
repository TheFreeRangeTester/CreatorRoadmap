import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { IdeaResponse, VideoTemplateResponse } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  X,
  Save,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Eye,
} from "lucide-react";

// Template item type
type TemplateItem = {
  text: string;
  completed: boolean;
};

interface VideoTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: IdeaResponse;
}

export default function VideoTemplateModal({
  isOpen,
  onClose,
  idea,
}: VideoTemplateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [pointsToCover, setPointsToCover] = useState<TemplateItem[]>([]);
  const [visualsNeeded, setVisualsNeeded] = useState<TemplateItem[]>([]);
  const [newPoint, setNewPoint] = useState("");
  const [newVisual, setNewVisual] = useState("");
  const [isPointsOpen, setIsPointsOpen] = useState(true);
  const [isVisualsOpen, setIsVisualsOpen] = useState(true);

  // Fetch existing template
  const { data: template, isLoading } = useQuery<VideoTemplateResponse>({
    queryKey: [`/api/video-templates/${idea.id}`],
    enabled: isOpen,
  });

  // Load template data when it's fetched
  useEffect(() => {
    if (template) {
      setPointsToCover(template.pointsToCover || []);
      setVisualsNeeded(template.visualsNeeded || []);
    } else {
      setPointsToCover([]);
      setVisualsNeeded([]);
    }
  }, [template]);

  // Create or update template mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ideaId: idea.id,
        pointsToCover,
        visualsNeeded,
      };

      if (template) {
        // Update existing template
        return await apiRequest(`/api/video-templates/${idea.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        // Create new template
        return await apiRequest("/api/video-templates", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Template guardado",
        description: "Tu plantilla de planificación ha sido guardada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/video-templates/${idea.id}`] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el template.",
        variant: "destructive",
      });
    },
  });

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      setPointsToCover([...pointsToCover, { text: newPoint.trim(), completed: false }]);
      setNewPoint("");
    }
  };

  const handleRemovePoint = (index: number) => {
    setPointsToCover(pointsToCover.filter((_, i) => i !== index));
  };

  const handleTogglePoint = (index: number) => {
    setPointsToCover(pointsToCover.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddVisual = () => {
    if (newVisual.trim()) {
      setVisualsNeeded([...visualsNeeded, { text: newVisual.trim(), completed: false }]);
      setNewVisual("");
    }
  };

  const handleRemoveVisual = (index: number) => {
    setVisualsNeeded(visualsNeeded.filter((_, i) => i !== index));
  };

  const handleToggleVisual = (index: number) => {
    setVisualsNeeded(visualsNeeded.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleExportMarkdown = () => {
    const markdown = `# ${idea.title}

## Descripción
${idea.description}

## Puntos a cubrir
${pointsToCover.map((point, i) => `${i + 1}. ${point.completed ? '~~' + point.text + '~~' : point.text} ${point.completed ? '✓' : ''}`).join("\n")}

## Visuales necesarios
${visualsNeeded.map((visual, i) => `- ${visual.completed ? '~~' + visual.text + '~~' : visual.text} ${visual.completed ? '✓' : ''}`).join("\n")}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${idea.title.replace(/[^a-z0-9]/gi, "_")}_template.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Template exportado como Markdown.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            Planificación de Video
          </DialogTitle>
          <DialogDescription>
            Organiza los detalles de tu video antes de producirlo
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Idea del video (prellenado) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Idea del video
              </Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {idea.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {idea.description}
                </p>
              </div>
            </div>

            {/* Puntos a cubrir */}
            <Collapsible open={isPointsOpen} onOpenChange={setIsPointsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  data-testid="toggle-points"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Puntos a cubrir ({pointsToCover.length})
                  </span>
                  {isPointsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                <div className="space-y-2">
                  {pointsToCover.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group"
                      data-testid={`point-${index}`}
                    >
                      <Checkbox
                        checked={point.completed}
                        onCheckedChange={() => handleTogglePoint(index)}
                        className="mt-0.5"
                        data-testid={`checkbox-point-${index}`}
                      />
                      <span className={`flex-1 text-sm ${
                        point.completed 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {index + 1}. {point.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePoint(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`remove-point-${index}`}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newPoint}
                    onChange={(e) => setNewPoint(e.target.value)}
                    placeholder="Agregar punto a cubrir..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddPoint()}
                    className="flex-1"
                    data-testid="input-new-point"
                  />
                  <Button
                    onClick={handleAddPoint}
                    size="sm"
                    variant="outline"
                    data-testid="button-add-point"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Visuales necesarios */}
            <Collapsible open={isVisualsOpen} onOpenChange={setIsVisualsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  data-testid="toggle-visuals"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Visuales necesarios ({visualsNeeded.length})
                  </span>
                  {isVisualsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                <div className="space-y-2">
                  {visualsNeeded.map((visual, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group"
                      data-testid={`visual-${index}`}
                    >
                      <Checkbox
                        checked={visual.completed}
                        onCheckedChange={() => handleToggleVisual(index)}
                        className="mt-0.5"
                        data-testid={`checkbox-visual-${index}`}
                      />
                      <span className={`flex-1 text-sm ${
                        visual.completed 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        • {visual.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVisual(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`remove-visual-${index}`}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newVisual}
                    onChange={(e) => setNewVisual(e.target.value)}
                    placeholder="Ej: captura de pantalla, demo del feature..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddVisual()}
                    className="flex-1"
                    data-testid="input-new-visual"
                  />
                  <Button
                    onClick={handleAddVisual}
                    size="sm"
                    variant="outline"
                    data-testid="button-add-visual"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1"
                data-testid="button-save-template"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportMarkdown}
                variant="outline"
                data-testid="button-export-template"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar MD
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                data-testid="button-close-template"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
