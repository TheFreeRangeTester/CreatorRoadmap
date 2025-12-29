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
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { hasActivePremiumAccess } from "@shared/premium-utils";
import YouTubeOpportunityPanel from "./youtube-opportunity-panel";

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
  labelKey: string;
  placeholderKey: string;
  icon: typeof Eye;
  emoji?: string;
}

export default function VideoTemplateModal({
  isOpen,
  onClose,
  idea,
}: VideoTemplateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isPremium = user ? hasActivePremiumAccess(user) : false;

  // Define sections with translation keys and emojis
  const sections: Section[] = [
    { key: "hook", labelKey: "videoScript.sections.hook", placeholderKey: "videoScript.sections.hookPlaceholder", icon: Eye, emoji: "🎣" },
    { key: "teaser", labelKey: "videoScript.sections.teaser", placeholderKey: "videoScript.sections.teaserPlaceholder", icon: Eye, emoji: "✨" },
    { key: "valorAudiencia", labelKey: "videoScript.sections.valueForAudience", placeholderKey: "videoScript.sections.valueForAudiencePlaceholder", icon: Eye, emoji: "💎" },
    { key: "pointsToCover", labelKey: "videoScript.sections.pointsToCover", placeholderKey: "videoScript.sections.pointsToCoverPlaceholder", icon: Eye, emoji: "📋" },
    { key: "visualsNeeded", labelKey: "videoScript.sections.visualsNeeded", placeholderKey: "videoScript.sections.visualsNeededPlaceholder", icon: Eye, emoji: "🎬" },
    { key: "bonus", labelKey: "videoScript.sections.bonus", placeholderKey: "videoScript.sections.bonusPlaceholder", icon: Eye, emoji: "🎁" },
    { key: "outro", labelKey: "videoScript.sections.outro", placeholderKey: "videoScript.sections.outroPlaceholder", icon: Eye, emoji: "👋" },
  ];

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
    onSuccess: async () => {
      toast({
        title: t("videoScript.saveSuccess"),
        description: t("videoScript.saveSuccessDesc"),
      });
      // Invalidate and refetch the query to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/video-templates/${idea.id}`] });
      await queryClient.refetchQueries({ queryKey: [`/api/video-templates/${idea.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: t("videoScript.saveError"),
        description: error.message || t("videoScript.saveErrorDesc"),
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
      title: t("videoScript.exportSuccess"),
      description: t("videoScript.exportSuccessDesc"),
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
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            data-testid={`toggle-${section.key}`}
          >
            <span className="font-semibold flex items-center gap-2">
              {section.emoji && <span>{section.emoji}</span>}
              {t(section.labelKey)} ({items.length})
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
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
              placeholder={t(section.placeholderKey)}
              onKeyPress={(e) => e.key === "Enter" && handleAddItem(section.key)}
              className="flex-1 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary/50 text-gray-900 dark:text-white"
              data-testid={`input-new-${section.key}`}
            />
            <Button
              onClick={() => handleAddItem(section.key)}
              size="sm"
              variant="outline"
              className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              data-testid={`button-add-${section.key}`}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("videoScript.add")}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            {t("videoScript.title")}
          </DialogTitle>
          <DialogDescription>
            {t("videoScript.description")}
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
                {t("videoScript.videoIdea")}
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

            {/* YouTube Opportunity Panel */}
            <YouTubeOpportunityPanel
              ideaId={idea.id}
              isPremium={isPremium}
              audienceVotes={idea.voteCount ?? 0}
            />

            {/* Video Title */}
            <div className="space-y-2">
              <Label htmlFor="video-title" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Video className="w-4 h-4" />
                {t("videoScript.videoTitle")}
              </Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder={t("videoScript.videoTitlePlaceholder")}
                className="w-full"
                data-testid="input-video-title"
              />
            </div>

            {/* Thumbnail Notes */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail-notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Image className="w-4 h-4" />
                {t("videoScript.thumbnailNotes")}
              </Label>
              <Textarea
                id="thumbnail-notes"
                value={thumbnailNotes}
                onChange={(e) => setThumbnailNotes(e.target.value)}
                placeholder={t("videoScript.thumbnailNotesPlaceholder")}
                className="w-full min-h-[80px]"
                data-testid="input-thumbnail-notes"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {t("videoScript.scriptStructure")}
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
                className="flex-1 border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-all duration-200 disabled:opacity-50"
                data-testid="button-save-template"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("videoScript.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("videoScript.save")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportMarkdown}
                variant="outline"
                className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                data-testid="button-export-template"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("videoScript.exportMD")}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                data-testid="button-close-template"
              >
                {t("videoScript.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
