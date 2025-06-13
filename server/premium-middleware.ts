import type { Request, Response, NextFunction } from "express";
import { hasActivePremiumAccess } from "@shared/premium-utils";

/**
 * Middleware para verificar si el usuario tiene acceso premium activo
 */
export function requirePremiumAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      message: "Authentication required",
      premiumRequired: true 
    });
  }

  // Convertir el usuario a formato compatible con las utilidades premium
  const userForPremiumCheck = {
    subscriptionStatus: req.user.subscriptionStatus as "free" | "trial" | "premium",
    trialEndDate: req.user.trialEndDate,
    subscriptionEndDate: req.user.subscriptionEndDate
  };

  if (!hasActivePremiumAccess(userForPremiumCheck)) {
    return res.status(403).json({ 
      message: "Premium access required",
      premiumRequired: true,
      userStatus: req.user.subscriptionStatus
    });
  }

  next();
}

/**
 * Función para verificar si una operación requiere acceso premium
 * Basado en el contexto de la solicitud (como headers específicos)
 */
export function isPremiumOperation(req: Request): boolean {
  // Si viene con header indicando que es importación CSV, es premium
  const isCsvImport = req.headers['x-csv-import'] === 'true';
  
  // Aquí se pueden agregar más condiciones para otras funcionalidades premium
  return isCsvImport;
}

/**
 * Middleware condicional que solo aplica validación premium si la operación lo requiere
 */
export function conditionalPremiumAccess(req: Request, res: Response, next: NextFunction) {
  if (isPremiumOperation(req)) {
    return requirePremiumAccess(req, res, next);
  }
  
  next();
}