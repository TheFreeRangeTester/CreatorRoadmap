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
import { Textarea } from "@/components/ui/textarea";
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
  Video,
  Image,
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

// Section configuration for reusable collapsible sections
interface Section {
  key: string;
  label: string;
  icon: typeof Eye;
  placeholder: string;
}

const sections: Section[] = [
  { key: "hook", label: "HOOK", icon: Eye, placeholder: "Ej: pregunta intrigante, dato sorprendente..." },
  { key: "teaser", label: "TEASER", icon: Eye, placeholder: "Ej: adelanto del contenido principal..." },
  { key: "valorAudiencia", label: "VALOR PARA AUDIENCIA", icon: Eye, placeholder: "Ej: aprenderán a..., les ayudará con..." },
  { key: "pointsToCover", label: "PUNTOS A CUBRIR", icon: Eye, placeholder: "Agregar punto a cubrir..." },
  { key: "visualsNeeded", label: "VISUALES NECESARIOS", icon: Eye, placeholder: "Ej: captura de pantalla, demo del feature..." },
  { key: "bonus", label: "BONUS / EXTRA", icon: Eye, placeholder: "Ej: tip adicional, recurso descargable..." },
  { key: "outro", label: "OUTRO / CTA", icon: Eye, placeholder: "Ej: llamado a la acción, invitación a suscribirse..." },
];

export default function VideoTemplateModal({
  isOpen,
  onClose,
  idea,
}: VideoTemplateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Text fields
  const [videoTitle, setVideoTitle] = useState("");
  const [thumbnailNotes, setThumbnailNotes] = useState("");

  // All sections state
  const [hook, setHook] = useState<TemplateItem[]>([]);
  const [teaser, setTeaser] = useState<TemplateItem[]>([]);
  const [valorAudiencia, setValorAudiencia] = useState<TemplateItem[]>([]);
  const [pointsToCover, setPointsToCover] = useState<TemplateItem[]>([]);
  const [visualsNeeded, setVisualsNeeded] = useState<TemplateItem[]>([]);
  const [bonus, setBonus] = useState<TemplateItem[]>([]);
  const [outro, setOutro] = useState<TemplateItem[]>([]);

  // New item inputs for each section
  const [newInputs, setNewInputs] = useState<Record<string, string>>({
    hook: "",
    teaser: "",
    valorAudiencia: "",
    pointsToCover: "",
    visualsNeeded: "",
    bonus: "",
    outro: "",
  });

  // Collapsible state for each section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hook: true,
    teaser: true,
    valorAudiencia: true,
    pointsToCover: true,
    visualsNeeded: true,
    bonus: true,
    outro: true,
  });

  // Fetch existing template
  const { data: template, isLoading } = useQuery<VideoTemplateResponse>({
    queryKey: [`/api/video-templates/${idea.id}`],
    enabled: isOpen,
  });

  // Load template data when it's fetched
  useEffect(() => {
    if (template) {
      setVideoTitle(template.videoTitle || "");
      setThumbnailNotes(template.thumbnailNotes || "");
      setHook(template.hook || []);
      setTeaser(template.teaser || []);
      setValorAudiencia(template.valorAudiencia || []);
      setPointsToCover(template.pointsToCover || []);
      setVisualsNeeded(template.visualsNeeded || []);
      setBonus(template.bonus || []);
      setOutro(template.outro || []);
    } else {
      setVideoTitle("");
      setThumbnailNotes("");
      setHook([]);
      setTeaser([]);
      setValorAudiencia([]);
      setPointsToCover([]);
      setVisualsNeeded([]);
      setBonus([]);
      setOutro([]);
    }
  }, [template]);

  // Map section keys to their state and setters
  const getSectionData = (key: string): [TemplateItem[], (items: TemplateItem[]) => void] => {
    const map: Record<string, [TemplateItem[], (items: TemplateItem[]) => void]> = {
      hook: [hook, setHook],
      teaser: [teaser, setTeaser],
      valorAudiencia: [valorAudiencia, setValorAudiencia],
      pointsToCover: [pointsToCover, setPointsToCover],
      visualsNeeded: [visualsNeeded, setVisualsNeeded],
      bonus: [bonus, setBonus],
      outro: [outro, setOutro],
    };
    return map[key] || [[], () => {}];
  };

  // Create or update template mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ideaId: idea.id,
        videoTitle,
        thumbnailNotes,
        hook,
        teaser,
        valorAudiencia,
        pointsToCover,
        visualsNeeded,
        bonus,
        outro,
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

  const handleAddItem = (sectionKey: string) => {
    const input = newInputs[sectionKey];
    if (input.trim()) {
      const [items, setItems] = getSectionData(sectionKey);
      setItems([...items, { text: input.trim(), completed: false }]);
      setNewInputs({ ...newInputs, [sectionKey]: "" });
    }
  };

  const handleRemoveItem = (sectionKey: string, index: number) => {
    const [items, setItems] = getSectionData(sectionKey);
    setItems(items.filter((_, i) => i !== index));
  };

  const handleToggleItem = (sectionKey: string, index: number) => {
    const [items, setItems] = getSectionData(sectionKey);
    setItems(items.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleExportMarkdown = () => {
    const formatItems = (items: TemplateItem[], prefix: string = "-") => {
      return items.map((item, i) => 
        `${prefix} ${item.completed ? '~~' + item.text + '~~' : item.text} ${item.completed ? '✓' : ''}`
      ).join("\n");
    };

    const markdown = `# ${videoTitle || idea.title}

## Idea original
${idea.title}
${idea.description}

${videoTitle ? `## Título del video\n${videoTitle}\n` : ''}
${thumbnailNotes ? `## Miniatura\n${thumbnailNotes}\n` : ''}
${hook.length > 0 ? `## HOOK\n${formatItems(hook)}\n` : ''}
${teaser.length > 0 ? `## TEASER\n${formatItems(teaser)}\n` : ''}
${valorAudiencia.length > 0 ? `## VALOR PARA AUDIENCIA\n${formatItems(valorAudiencia)}\n` : ''}
${pointsToCover.length > 0 ? `## PUNTOS A CUBRIR\n${formatItems(pointsToCover.map((p, i) => ({ ...p, text: `${i + 1}. ${p.text}` })))}\n` : ''}
${visualsNeeded.length > 0 ? `## VISUALES NECESARIOS\n${formatItems(visualsNeeded)}\n` : ''}
${bonus.length > 0 ? `## BONUS / EXTRA\n${formatItems(bonus)}\n` : ''}
${outro.length > 0 ? `## OUTRO / CTA\n${formatItems(outro)}\n` : ''}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(videoTitle || idea.title).replace(/[^a-z0-9]/gi, "_")}_template.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Template exportado como Markdown.",
    });
  };

  const renderSection = (section: Section) => {
    const [items] = getSectionData(section.key);
    const isOpen = openSections[section.key];
    const Icon = section.icon;

    return (
      <Collapsible 
        key={section.key}
        open={isOpen} 
        onOpenChange={(open) => setOpenSections({ ...openSections, [section.key]: open })}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            data-testid={`toggle-${section.key}`}
          >
            <span className="font-semibold flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {section.label} ({items.length})
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-3">
          <div className="space-y-2">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md group"
                data-testid={`${section.key}-${index}`}
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggleItem(section.key, index)}
                  className="mt-0.5"
                  data-testid={`checkbox-${section.key}-${index}`}
                />
                <span className={`flex-1 text-sm ${
                  item.completed 
                    ? 'line-through text-gray-400 dark:text-gray-500' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {section.key === 'pointsToCover' ? `${index + 1}. ` : '• '}{item.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(section.key, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`remove-${section.key}-${index}`}
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newInputs[section.key]}
              onChange={(e) => setNewInputs({ ...newInputs, [section.key]: e.target.value })}
              placeholder={section.placeholder}
              onKeyPress={(e) => e.key === "Enter" && handleAddItem(section.key)}
              className="flex-1"
              data-testid={`input-new-${section.key}`}
            />
            <Button
              onClick={() => handleAddItem(section.key)}
              size="sm"
              variant="outline"
              data-testid={`button-add-${section.key}`}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            Guión Completo de Video
          </DialogTitle>
          <DialogDescription>
            Planifica todos los detalles de tu video antes de producirlo
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
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {idea.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {idea.description}
                </p>
              </div>
            </div>

            {/* Video Title */}
            <div className="space-y-2">
              <Label htmlFor="video-title" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Título del video
              </Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ej: Cómo crear una IA en 10 minutos | Tutorial completo"
                className="w-full"
                data-testid="input-video-title"
              />
            </div>

            {/* Thumbnail Notes */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail-notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Miniatura (qué debería tener)
              </Label>
              <Textarea
                id="thumbnail-notes"
                value={thumbnailNotes}
                onChange={(e) => setThumbnailNotes(e.target.value)}
                placeholder="Ej: Fondo con gradiente azul-morado, texto grande 'IA EN 10 MIN', mi foto con expresión sorprendida..."
                className="w-full min-h-[80px]"
                data-testid="input-thumbnail-notes"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Estructura del guión
              </h3>
              <div className="space-y-4">
                {sections.map(renderSection)}
              </div>
            </div>

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
