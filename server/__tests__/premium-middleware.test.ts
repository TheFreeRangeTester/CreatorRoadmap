import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { requirePremiumAccess, isPremiumOperation, conditionalPremiumAccess } from '../premium-middleware';

describe('Premium Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: undefined,
      headers: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<any>,
      json: jest.fn().mockReturnThis() as jest.MockedFunction<any>,
    };
    
    mockNext = jest.fn() as NextFunction;
  });

  describe('requirePremiumAccess', () => {
    it('should allow access for premium users', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'premium',
        username: 'premium-user',
        userRole: 'creator',
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for trial users', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'trial',
        username: 'trial-user',
        userRole: 'creator',
        trialEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject access for free users', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'free',
        username: 'free-user',
        userRole: 'creator',
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Esta característica requiere una suscripción premium',
        requiresPremium: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for canceled subscriptions', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'canceled',
        username: 'canceled-user',
        userRole: 'creator',
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for unauthenticated users', () => {
      mockRequest.user = undefined;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Debes iniciar sesión para acceder a esta característica',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for expired trial users', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'trial',
        username: 'expired-trial-user',
        userRole: 'creator',
        trialEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('isPremiumOperation', () => {
    it('should return true for premium operation headers', () => {
      mockRequest.headers = {
        'x-premium-operation': 'true',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(true);
    });

    it('should return true for bulk operations', () => {
      mockRequest.headers = {
        'x-bulk-operation': 'true',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(true);
    });

    it('should return true for advanced features', () => {
      mockRequest.headers = {
        'x-advanced-feature': 'csv-import',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(true);
    });

    it('should return false for regular operations', () => {
      mockRequest.headers = {};

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false);
    });

    it('should return false when premium headers are false', () => {
      mockRequest.headers = {
        'x-premium-operation': 'false',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false);
    });
  });

  describe('conditionalPremiumAccess', () => {
    it('should apply premium validation when operation requires it', () => {
      mockRequest.headers = {
        'x-premium-operation': 'true',
      };
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'free',
        username: 'free-user',
        userRole: 'creator',
      };

      conditionalPremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should skip premium validation for regular operations', () => {
      mockRequest.headers = {};
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'free',
        username: 'free-user',
        userRole: 'creator',
      };

      conditionalPremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow premium operations for premium users', () => {
      mockRequest.headers = {
        'x-premium-operation': 'true',
      };
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'premium',
        username: 'premium-user',
        userRole: 'creator',
      };

      conditionalPremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing trialEndDate for trial users', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'trial',
        username: 'trial-user',
        userRole: 'creator',
        // trialEndDate is undefined
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle invalid date for trialEndDate', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'trial',
        username: 'trial-user',
        userRole: 'creator',
        trialEndDate: 'invalid-date' as any,
      };

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive headers', () => {
      mockRequest.headers = {
        'X-Premium-Operation': 'TRUE',
      };

      // Note: Express headers are case-insensitive by default
      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false); // Should be false since we check lowercase
    });

    it('should handle multiple premium operation indicators', () => {
      mockRequest.headers = {
        'x-premium-operation': 'true',
        'x-bulk-operation': 'true',
        'x-advanced-feature': 'analytics',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(true);
    });
  });
});