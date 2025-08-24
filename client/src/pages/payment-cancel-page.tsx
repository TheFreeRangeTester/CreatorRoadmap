import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentCancelPage() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const isTest = urlParams.get('test') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center border-gray-200 shadow-xl w-full max-w-none overflow-hidden">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-gray-600" />
              </div>
            </motion.div>
            
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 break-words">
              Pago Cancelado
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
                Has cancelado el proceso de pago. Tu suscripción no ha sido modificada.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2"
              >
                <h4 className="font-semibold text-blue-800 dark:text-blue-400">
                  ¿Necesitas ayuda?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Si tuviste problemas durante el proceso de pago o tienes preguntas sobre los planes premium, no dudes en contactarnos.
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                onClick={() => navigate("/subscription")}
                className="w-full flex items-center gap-2"
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