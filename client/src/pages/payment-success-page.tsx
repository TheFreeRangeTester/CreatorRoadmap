import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const isTest = urlParams.get('test') === 'true';

  useEffect(() => {
    // Trigger confetti animation on success
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Additional confetti burst after a delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 300);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center border-green-200 shadow-xl">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-400">
              ¡Pago Exitoso!
            </CardTitle>
            
            {isTest && (
              <div className="mt-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium">
                Modo de Prueba
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 text-yellow-600"
              >
                <Crown className="w-5 h-5" />
                <span className="font-semibold">¡Bienvenido a Premium!</span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 dark:text-gray-300"
              >
                Tu suscripción ha sido activada exitosamente. Ahora tienes acceso a todas las características premium.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2"
              >
                <h4 className="font-semibold text-green-800 dark:text-green-400">
                  Características Desbloqueadas:
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Ideas ilimitadas y visibles</li>
                  <li>• Sin marca de agua</li>
                  <li>• Analíticas avanzadas</li>
                  <li>• Soporte prioritario</li>
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
                onClick={() => navigate("/dashboard")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Ir al Dashboard
              </Button>
              
              <Button
                onClick={() => navigate("/subscription")}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Ver Suscripción
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}