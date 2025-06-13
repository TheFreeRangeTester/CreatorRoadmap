// Tipo base para las propiedades de suscripción necesarias
type SubscriptionUser = {
  subscriptionStatus: "free" | "trial" | "premium";
  trialEndDate?: Date | null;
  subscriptionEndDate?: Date | null;
};

/**
 * Verifica si un usuario tiene acceso activo a funcionalidades premium
 * Considera el estado de suscripción y fechas de expiración
 */
export function hasActivePremiumAccess(user: SubscriptionUser | null | undefined): boolean {
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
export function getTrialDaysRemaining(user: SubscriptionUser | null | undefined): number {
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
export function isTrialExpired(user: SubscriptionUser | null | undefined): boolean {
  if (!user?.trialEndDate || user.subscriptionStatus !== "trial") {
    return false;
  }

  return new Date(user.trialEndDate) <= new Date();
}

/**
 * Verifica si la suscripción premium ha expirado
 */
export function isPremiumExpired(user: SubscriptionUser | null | undefined): boolean {
  if (!user || user.subscriptionStatus !== "premium" || !user.subscriptionEndDate) {
    return false;
  }

  return new Date(user.subscriptionEndDate) <= new Date();
}

/**
 * Obtiene el estado detallado del acceso premium del usuario
 */
export function getPremiumAccessStatus(user: SubscriptionUser | null | undefined): {
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