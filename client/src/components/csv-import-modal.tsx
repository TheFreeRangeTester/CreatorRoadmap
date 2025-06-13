import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (count: number) => void;
}

interface ParsedIdea {
  title: string;
  description?: string;
  rowNumber: number;
  isValid: boolean;
  errors: string[];
}

// Validation schema for each idea
const ideaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(280, "Description too long").optional(),
});

export default function CSVImportModal({
  open,
  onOpenChange,
  onImportSuccess,
}: CSVImportModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedIdeas, setParsedIdeas] = useState<ParsedIdea[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (csvText: string): ParsedIdea[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error(t("csvImport.errors.emptyFile", "File is empty"));
    }

    const header = lines[0].toLowerCase().trim();
    
    // Validate header
    if (!header.includes('title')) {
      throw new Error(t("csvImport.errors.missingTitleColumn", "Missing 'title' column in header"));
    }

    const headerCols = header.split(',').map(col => col.trim());
    const titleIndex = headerCols.findIndex(col => col === 'title');
    const descriptionIndex = headerCols.findIndex(col => col === 'description');

    const ideas: ParsedIdea[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      const rowNumber = i + 1;
      
      const title = cols[titleIndex] || '';
      const description = descriptionIndex >= 0 ? (cols[descriptionIndex] || '') : '';

      const errors: string[] = [];
      
      // Validate using Zod schema
      try {
        const validationData = {
          title,
          description: description && description.trim() !== '' ? description : undefined
        };
        ideaSchema.parse(validationData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(...error.errors.map(err => err.message));
        }
      }

      ideas.push({
        title,
        description: description && description.trim() !== '' ? description : undefined,
        rowNumber,
        isValid: errors.length === 0,
        errors,
      });
    }

    return ideas;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedIdeas(parsed);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: t("csvImport.errors.parseError", "Error parsing CSV"),
        description: (error as Error).message,
        variant: "destructive",
      });
      setParsedIdeas([]);
      setShowPreview(false);
    } finally {
      setIsProcessing(false);
    }
  }, [t, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    const validIdeas = parsedIdeas.filter(idea => idea.isValid);
    
    if (validIdeas.length === 0) {
      toast({
        title: t("csvImport.errors.noValidIdeas", "No valid ideas to import"),
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Import each valid idea
      for (const idea of validIdeas) {
        const response = await fetch('/api/ideas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSV-Import': 'true',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: idea.title,
            description: idea.description,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to import idea: ${idea.title}`);
        }
      }

      toast({
        title: t("csvImport.success.title", "Ideas imported successfully"),
        description: t("csvImport.success.description", "{{count}} ideas have been imported to your dashboard", { count: validIdeas.length }),
      });

      onImportSuccess(validIdeas.length);
      handleClose();
    } catch (error) {
      toast({
        title: t("csvImport.errors.importError", "Error importing ideas"),
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedIdeas([]);
    setShowPreview(false);
    setIsProcessing(false);
    setIsImporting(false);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csvContent = "title,description\nHow to grow a TikTok account,Practical tips and tricks for new creators\nBest time to post Instagram videos,\nEvergreen content ideas,Content that never goes out of style for YouTube and blogs";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ideas-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validIdeas = parsedIdeas.filter(idea => idea.isValid);
  const invalidIdeas = parsedIdeas.filter(idea => !idea.isValid);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("csvImport.title", "Import Ideas from CSV")}
          </DialogTitle>
          <DialogDescription>
            {t("csvImport.description", "Upload a CSV file to import multiple ideas at once")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showPreview ? (
            <>
              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-lg">
                    {t("csvImport.dropHere", "Drop your CSV file here...")}
                  </p>
                ) : (
                  <>
                    <p className="text-lg mb-2">
                      {t("csvImport.dragDrop", "Drag and drop your CSV file here, or click to select")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("csvImport.fileTypes", "Supports .csv files only")}
                    </p>
                  </>
                )}
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">
                      {t("csvImport.template.title", "Need a template?")}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t("csvImport.template.description", "Download a sample CSV file to get started")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("csvImport.template.download", "Download Template")}
                  </Button>
                </div>
              </div>

              {/* Format Info */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t("csvImport.format.title", "CSV Format:")}</strong><br />
                  {t("csvImport.format.description", "Your CSV must have a 'title' column (required) and optionally a 'description' column. Title max 100 characters, description max 280 characters.")}
                </AlertDescription>
              </Alert>

              {isProcessing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  {t("csvImport.processing", "Processing file...")}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Preview Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {t("csvImport.preview.title", "Import Preview")}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                    <X className="h-4 w-4 mr-2" />
                    {t("common.back", "Back")}
                  </Button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        {t("csvImport.preview.validIdeas", "Valid Ideas")}: {validIdeas.length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-700 dark:text-red-300">
                        {t("csvImport.preview.invalidIdeas", "Invalid Ideas")}: {invalidIdeas.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ideas List */}
                <ScrollArea className="h-64 border rounded-lg">
                  <div className="p-4 space-y-3">
                    {parsedIdeas.map((idea, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          idea.isValid
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={idea.isValid ? "default" : "destructive"} className="text-xs">
                                {t("csvImport.preview.row", "Row")} {idea.rowNumber}
                              </Badge>
                              {idea.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <h4 className="font-medium">{idea.title || t("csvImport.preview.emptyTitle", "(Empty title)")}</h4>
                            {idea.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {idea.description}
                              </p>
                            )}
                            {idea.errors.length > 0 && (
                              <div className="mt-2">
                                {idea.errors.map((error, errorIndex) => (
                                  <p key={errorIndex} className="text-sm text-red-600 dark:text-red-400">
                                    • {error}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Import Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={validIdeas.length === 0 || isImporting}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("csvImport.importing", "Importing...")}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t("csvImport.importButton", "Import {{count}} Ideas", { count: validIdeas.length })}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}