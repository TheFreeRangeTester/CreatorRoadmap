import { Request, Response } from 'express';
import { storage } from './storage';

/**
 * Helper functions for testing Stripe payment flows without real charges
 */

export interface TestPaymentData {
  userId: number;
  plan: 'monthly' | 'yearly';
  scenario: 'success' | 'cancel' | 'fail';
}

/**
 * Simula un pago exitoso para testing
 */
export async function simulateSuccessfulPayment(data: TestPaymentData) {
  const { userId, plan } = data;
  
  // Calcular fecha de finalización
  const endDate = new Date();
  if (plan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Actualizar suscripción del usuario
  const updatedUser = await storage.updateUserSubscription(userId, {
    subscriptionStatus: 'premium',
    subscriptionPlan: plan,
    subscriptionEndDate: endDate,
    stripeCustomerId: `test_customer_${userId}`,
    stripeSubscriptionId: `test_sub_${userId}_${Date.now()}`
  });

  return updatedUser;
}

/**
 * Simula la cancelación de una suscripción para testing
 */
export async function simulateSubscriptionCancellation(userId: number) {
  const updatedUser = await storage.updateUserSubscription(userId, {
    subscriptionStatus: 'free',
    subscriptionPlan: undefined,
    subscriptionEndDate: undefined,
    stripeSubscriptionId: undefined
  });

  return updatedUser;
}

/**
 * Genera URLs de testing para simular diferentes escenarios
 */
export function generateTestUrls(baseUrl: string) {
  return {
    success: `${baseUrl}/payment/success?test=true`,
    cancel: `${baseUrl}/payment/cancel?test=true`,
    failure: `${baseUrl}/payment/failure?test=true`
  };
}

/**
 * Valida si estamos en modo de testing
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.STRIPE_TEST_MODE === 'true';
}

/**
 * Simula diferentes escenarios de webhook de Stripe
 */
export function simulateWebhookEvent(eventType: string, data: any) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  const mockEvent = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: timestamp,
    type: eventType,
    data: {
      object: data
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: null,
      idempotency_key: null
    }
  };

  return mockEvent;
}

/**
 * Crea datos de prueba para diferentes tipos de eventos de Stripe
 */
export function createTestEventData(userId: number, plan: 'monthly' | 'yearly') {
  const customerId = `test_customer_${userId}`;
  const subscriptionId = `test_sub_${userId}_${Date.now()}`;
  const currentPeriodEnd = Math.floor(Date.now() / 1000) + (plan === 'monthly' ? 2592000 : 31536000); // 30 days or 365 days

  return {
    subscription: {
      id: subscriptionId,
      object: 'subscription',
      customer: customerId,
      status: 'active',
      current_period_end: currentPeriodEnd,
      metadata: {
        plan: plan,
        userId: userId.toString()
      }
    },
    invoice: {
      id: `in_test_${Date.now()}`,
      object: 'invoice',
      customer: customerId,
      subscription: subscriptionId,
      status: 'paid',
      total: plan === 'monthly' ? 500 : 3600
    },
    checkoutSession: {
      id: `cs_test_${Date.now()}`,
      object: 'checkout.session',
      customer: customerId,
      mode: 'subscription',
      payment_status: 'paid',
      subscription: subscriptionId,
      metadata: {
        plan: plan,
        userId: userId.toString()
      }
    }
  };
}