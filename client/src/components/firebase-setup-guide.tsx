import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Copy, Check, Info, AlertCircle } from "lucide-react";

export default function FirebaseSetupGuide({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [activeTab, setActiveTab] = useState("domain");
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  
  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;
  
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Guía de configuración de Firebase
          </DialogTitle>
          <DialogDescription>
            Sigue estos pasos para configurar correctamente la autenticación con Google en tu aplicación
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="domain" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="domain">
              Paso 1: Dominio autorizado
            </TabsTrigger>
            <TabsTrigger value="redirect">
              Paso 2: URI de redirección
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="domain" className="space-y-4">
            <div className="p-4 border border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200 rounded-md text-sm mt-4">
              <p className="font-medium mb-2">Para autorizar tu dominio:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Ve a la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">consola de Firebase</a></li>
                <li>Selecciona tu proyecto</li>
                <li>Ve a <strong>Authentication &gt; Settings &gt; Authorized domains</strong></li>
                <li>Haz clic en "Add domain"</li>
                <li>Agrega tu dominio:</li>
              </ol>
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between">
                <code>{currentDomain}</code>
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(currentDomain, "domain")}
                >
                  {copied["domain"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <div></div>
              <Button onClick={() => setActiveTab("redirect")}>
                Siguiente: URI de redirección
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="redirect" className="space-y-4">
            <div className="p-4 border border-purple-200 bg-purple-50 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-200 rounded-md text-sm mt-4">
              <p className="font-medium mb-2">Para configurar las URIs de redirección:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Ve a la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">consola de Firebase</a></li>
                <li>Selecciona tu proyecto</li>
                <li>Ve a <strong>Project Settings (⚙️) &gt; General</strong></li>
                <li>Desplázate hasta tu aplicación web y anota el ID de cliente OAuth</li>
                <li>Ve a la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google Cloud Console</a></li>
                <li>Selecciona el mismo proyecto</li>
                <li>Ve a <strong>APIs & Services &gt; Credentials</strong></li>
                <li>Encuentra y edita el ID de cliente OAuth</li>
                <li>En la sección <strong>Authorized redirect URIs</strong>, agrega estas URLs:</li>
              </ol>
              <div className="mt-2 space-y-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between">
                  <code>{currentOrigin}/__/auth/handler</code>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(`${currentOrigin}/__/auth/handler`, "redirect1")}
                  >
                    {copied["redirect1"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between">
                  <code>https://{currentDomain}/__/auth/handler</code>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(`https://${currentDomain}/__/auth/handler`, "redirect2")}
                  >
                    {copied["redirect2"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between">
                  <code>http://{currentDomain}/__/auth/handler</code>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(`http://${currentDomain}/__/auth/handler`, "redirect3")}
                  >
                    {copied["redirect3"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 rounded-md text-sm mt-2">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>Es importante agregar <strong>todas</strong> las URLs de redirección, ya que Firebase puede intentar usar cualquiera de ellas dependiendo del contexto.</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("domain")}>
                Volver: Dominio autorizado
              </Button>
              <Button 
                onClick={() => {
                  window.open('https://console.cloud.google.com/', '_blank');
                }}
                className="gap-2"
              >
                Ir a Google Cloud Console <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar guía
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}