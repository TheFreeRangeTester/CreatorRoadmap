import type { User, UserResponse } from "./schema";

/**
 * Verifica si un usuario tiene acceso activo a funcionalidades premium
 * Considera el estado de suscripción y fechas de expiración
 */
export function hasActivePremiumAccess(user: User | UserResponse): boolean {
  if (!user) return false;

  const now = new Date();

  // Usuario premium activo - verificar que no haya expirado
  if (user.subscriptionStatus === "premium") {
    // Si no hay fecha de finalización, es premium indefinido
    if (!user.subscriptionEndDate) return true;
    
    // Verificar que la suscripción no haya expirado
    return new Date(user.subscriptionEndDate) > now;
  }

  // Usuario en trial - verificar que no haya expirado
  if (user.subscriptionStatus === "trial") {
    if (!user.trialEndDate) return false;
    
    // El trial es válido si no ha expirado
    return new Date(user.trialEndDate) > now;
  }

  // Usuarios free no tienen acceso premium
  return false;
}

/**
 * Obtiene los días restantes del trial
 */
export function getTrialDaysRemaining(user: User | UserResponse): number {
  if (!user?.trialEndDate || user.subscriptionStatus !== "trial") {
    return 0;
  }

  const now = new Date();
  const endDate = new Date(user.trialEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Verifica si el trial ha expirado
 */
export function isTrialExpired(user: User | UserResponse): boolean {
  if (!user?.trialEndDate || user.subscriptionStatus !== "trial") {
    return false;
  }

  return new Date(user.trialEndDate) <= new Date();
}

/**
 * Verifica si la suscripción premium ha expirado
 */
export function isPremiumExpired(user: User | UserResponse): boolean {
  if (user.subscriptionStatus !== "premium" || !user.subscriptionEndDate) {
    return false;
  }

  return new Date(user.subscriptionEndDate) <= new Date();
}

/**
 * Obtiene el estado detallado del acceso premium del usuario
 */
export function getPremiumAccessStatus(user: User | UserResponse): {
  hasAccess: boolean;
  reason: 'premium' | 'trial' | 'trial_expired' | 'premium_expired' | 'no_subscription';
  daysRemaining?: number;
} {
  if (!user) {
    return { hasAccess: false, reason: 'no_subscription' };
  }

  const now = new Date();

  // Verificar premium
  if (user.subscriptionStatus === "premium") {
    if (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > now) {
      return { hasAccess: true, reason: 'premium' };
    } else {
      return { hasAccess: false, reason: 'premium_expired' };
    }
  }

  // Verificar trial
  if (user.subscriptionStatus === "trial") {
    if (user.trialEndDate && new Date(user.trialEndDate) > now) {
      const daysRemaining = getTrialDaysRemaining(user);
      return { hasAccess: true, reason: 'trial', daysRemaining };
    } else {
      return { hasAccess: false, reason: 'trial_expired' };
    }
  }

  return { hasAccess: false, reason: 'no_subscription' };
}