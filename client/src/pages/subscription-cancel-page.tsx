import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, HeartHandshake } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SubscriptionCancelPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-md w-full"
      >
        <Card className="text-center shadow-xl border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              Pago Cancelado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <HeartHandshake className="w-5 h-5 text-orange-500" />
                <span>No te preocupes</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                El proceso de pago fue cancelado. Tu cuenta permanece sin cambios y puedes intentar nuevamente cuando estés listo.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Si tienes alguna pregunta sobre nuestros planes o necesitas asistencia, no dudes en contactarnos.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate("/subscription")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Suscripción
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                Ir al Dashboard
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Siempre puedes cambiar de opinión y suscribirte más tarde.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}