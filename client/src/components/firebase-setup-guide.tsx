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
            Sigue estos pasos para configurar correctamente la autenticación con Google en tu aplicación.
            Este error ocurre porque Google requiere que autorices explícitamente las URLs de redirección.
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
              
              <div className="mt-4 flex items-start p-2 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Si estás usando Google Auth dentro de Replit, es posible que necesites autorizar los dominios para los entornos de 
                  desarrollo y producción. Recuerda que el dominio de desarrollo de Replit puede cambiar.
                </p>
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
                <li>Desplázate hasta tu aplicación web</li>
                <li>Haz clic en "Configuración de SDK" y anota el ID de cliente OAuth (algo como "xyz123.apps.googleusercontent.com")</li>
                <li>Ve a la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google Cloud Console</a></li>
                <li>Selecciona el mismo proyecto</li>
                <li>En el menú lateral izquierdo, navega a <strong>API y servicios &gt; Credenciales</strong></li>
                <li>Encuentra el ID de cliente OAuth que anotaste y haz clic en él</li>
                <li>En <strong>"URI de redireccionamiento autorizados"</strong>, haz clic en "AÑADIR URI"</li>
                <li>Agrega estas URIs de redirección:</li>
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
              
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> Solución al error "redirect_uri_mismatch"
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                  Este error ocurre porque Firebase intenta redireccionar a una URL que Google no reconoce como autorizada.
                  Después de agregar las URLs, haz lo siguiente:
                </p>
                <ol className="text-xs text-red-700 dark:text-red-300 pl-4 list-decimal space-y-1">
                  <li>Guarda los cambios en Google Cloud Platform</li>
                  <li>Espera aproximadamente 5-10 minutos para que los cambios se propaguen</li>
                  <li>Borra la caché del navegador o prueba en modo incógnito</li>
                  <li>Intenta iniciar sesión nuevamente</li>
                </ol>
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