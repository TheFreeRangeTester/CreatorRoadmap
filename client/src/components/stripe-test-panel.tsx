import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Settings,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

interface StripeTestPanelProps {
  isVisible?: boolean;
}

export default function StripeTestPanel({ isVisible = true }: StripeTestPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [testCards, setTestCards] = useState<any>(null);

  // Mutation para simular pagos
  const simulatePaymentMutation = useMutation({
    mutationFn: async (data: { plan: 'monthly' | 'yearly', scenario: 'success' | 'cancel' | 'fail' }) => {
      const response = await fetch('/api/stripe/test/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment simulation failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      if (data.success) {
        if (data.confetti) {
          // Trigger confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        
        toast({
          title: "Pago Simulado Exitoso",
          description: data.message,
          variant: "default",
        });
      } else if (data.cancelled) {
        toast({
          title: "Pago Cancelado",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error en Simulación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para simular cancelación de suscripción
  const simulateCancellationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stripe/test/simulate-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Cancellation simulation failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Suscripción Cancelada",
        description: data.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en Cancelación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para obtener tarjetas de prueba
  const getTestCardsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stripe/test/cards');
      return response.json();
    },
    onSuccess: (data) => {
      setTestCards(data);
    }
  });

  const handleSimulatePayment = (scenario: 'success' | 'cancel' | 'fail') => {
    simulatePaymentMutation.mutate({
      plan: selectedPlan,
      scenario
    });
  };

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-2 border-dashed border-orange-300 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <TestTube className="w-5 h-5" />
          Panel de Testing de Stripe
        </CardTitle>
        <CardDescription>
          Simula diferentes escenarios de pago sin realizar cobros reales
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Selección de Plan */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Plan a Simular</label>
          <Select value={selectedPlan} onValueChange={(value: 'monthly' | 'yearly') => setSelectedPlan(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual ($5/mes)</SelectItem>
              <SelectItem value="yearly">Anual ($36/año)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Escenarios de Pago */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Escenarios de Pago</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => handleSimulatePayment('success')}
              disabled={simulatePaymentMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Pago Exitoso
            </Button>
            
            <Button
              onClick={() => handleSimulatePayment('cancel')}
              disabled={simulatePaymentMutation.isPending}
              variant="outline"
              className="flex items-center gap-2 border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              <XCircle className="w-4 h-4" />
              Pago Cancelado
            </Button>
            
            <Button
              onClick={() => handleSimulatePayment('fail')}
              disabled={simulatePaymentMutation.isPending}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Pago Fallido
            </Button>
          </div>
        </div>

        <Separator />

        {/* Simulador de Cancelación */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Gestión de Suscripción</h4>
          
          <Button
            onClick={() => simulateCancellationMutation.mutate()}
            disabled={simulateCancellationMutation.isPending}
            variant="outline"
            className="w-full flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4" />
            Simular Cancelación de Suscripción
          </Button>
        </div>

        <Separator />

        {/* Tarjetas de Prueba */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Tarjetas de Prueba de Stripe</h4>
            <Button
              onClick={() => getTestCardsMutation.mutate()}
              disabled={getTestCardsMutation.isPending}
              size="sm"
              variant="outline"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Ver Tarjetas
            </Button>
          </div>
          
          {testCards && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {testCards.instructions}
              </div>
              
              <div className="grid gap-2">
                {Object.entries(testCards.testCards).map(([key, card]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                    <div>
                      <span className="font-mono">{card.number}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.description}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Información Adicional */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">¿Cómo funciona?</p>
              <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-400">
                <li>• Los pagos exitosos activan automáticamente las características premium</li>
                <li>• Los pagos cancelados no modifican el estado del usuario</li>
                <li>• Los pagos fallidos muestran mensajes de error realistas</li>
                <li>• Las cancelaciones revierten al plan gratuito</li>
                <li>• Incluye animaciones de confetti para pagos exitosos</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}