import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentFailurePage() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const isTest = urlParams.get('test') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center border-red-200 shadow-xl w-full max-w-none overflow-hidden">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </motion.div>
            
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-400 break-words">
              Pago Fallido
            </CardTitle>
            
            {isTest && (
              <div className="mt-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
                Modo de Prueba
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-300"
              >
                No pudimos procesar tu pago. Por favor, verifica tu información de pago e intenta nuevamente.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2 text-left"
              >
                <h4 className="font-semibold text-red-800 dark:text-red-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Posibles causas:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Fondos insuficientes en la tarjeta</li>
                  <li>• Información de tarjeta incorrecta</li>
                  <li>• Tarjeta vencida o bloqueada</li>
                  <li>• Límite de transacción excedido</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2"
              >
                <h4 className="font-semibold text-blue-800 dark:text-blue-400">
                  Recomendaciones:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Verifica que los datos de tu tarjeta sean correctos</li>
                  <li>• Asegúrate de tener fondos suficientes</li>
                  <li>• Contacta a tu banco si el problema persiste</li>
                </ul>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <Button
                onClick={() => navigate("/subscription")}
                className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <CreditCard className="w-4 h-4" />
                Intentar de Nuevo
              </Button>
              
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}