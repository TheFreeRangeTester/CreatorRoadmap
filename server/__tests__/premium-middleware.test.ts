import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { requirePremiumAccess, isPremiumOperation, conditionalPremiumAccess } from '../premium-middleware';

// Helper function to create complete mock user
const createMockUser = (overrides: any = {}) => ({
  id: 1,
  username: 'test-user',
  password: 'hashed_password',
  userRole: 'creator',
  profileDescription: null,
  logoUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  tiktokUrl: null,
  threadsUrl: null,
  websiteUrl: null,
  profileBackground: 'gradient-1',
  email: 'test@example.com',
  subscriptionStatus: 'free',
  hasUsedTrial: false,
  trialStartDate: null,
  trialEndDate: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionPlan: null,
  subscriptionStartDate: null,
  subscriptionEndDate: null,
  subscriptionCanceledAt: null,
  ...overrides
});

describe('Premium Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: undefined,
      headers: {},
      isAuthenticated: jest.fn(() => true) as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<any>,
      json: jest.fn().mockReturnThis() as jest.MockedFunction<any>,
    };

    mockNext = jest.fn() as NextFunction;
  });

  describe('requirePremiumAccess', () => {
    it('should allow access for premium users', () => {
      const mockUser = createMockUser({
        username: 'premium-user',
        subscriptionStatus: 'premium',
        subscriptionPlan: 'monthly',
      });
      mockRequest.user = mockUser;

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
      } as any;

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
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Premium access required',
        premiumRequired: true,
        userStatus: 'free',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for canceled subscriptions without end date', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'canceled',
        username: 'canceled-user',
        userRole: 'creator',
        subscriptionEndDate: null,
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access for canceled subscriptions still active', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'canceled',
        username: 'canceled-user',
        userRole: 'creator',
        subscriptionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject access for expired canceled subscriptions', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'canceled',
        username: 'canceled-user',
        userRole: 'creator',
        subscriptionEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access for premium users without expiration date', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'premium',
        username: 'premium-user',
        userRole: 'creator',
        subscriptionEndDate: null,
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for premium users with future expiration date', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'premium',
        username: 'premium-user',
        userRole: 'creator',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject access for expired premium users', () => {
      mockRequest.user = {
        id: 1,
        subscriptionStatus: 'premium',
        username: 'premium-user',
        userRole: 'creator',
        subscriptionEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access for unauthenticated users', () => {
      mockRequest.user = undefined;
      (mockRequest.isAuthenticated as any).mockReturnValue(false);

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentication required',
        premiumRequired: true,
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
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('isPremiumOperation', () => {
    it('should return true for CSV import header', () => {
      mockRequest.headers = {
        'x-csv-import': 'true',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(true);
    });

    it('should return false when CSV import header is not true', () => {
      mockRequest.headers = {
        'x-csv-import': 'false',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false);
    });

    it('should return false for regular operations', () => {
      mockRequest.headers = {};

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false);
    });

    it('should return false when CSV import header is missing', () => {
      mockRequest.headers = {
        'x-other-header': 'true',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false);
    });
  });

  describe('conditionalPremiumAccess', () => {
    it('should apply premium validation when CSV import operation requires it', () => {
      mockRequest.headers = {
        'x-csv-import': 'true',
      };
      const mockUser = createMockUser({
        subscriptionStatus: 'free',
        username: 'free-user',
      });
      mockRequest.user = mockUser;

      conditionalPremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should skip premium validation for regular operations', () => {
      mockRequest.headers = {};
      const mockUser = createMockUser({
        subscriptionStatus: 'free',
        username: 'free-user',
      });
      mockRequest.user = mockUser;

      conditionalPremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow CSV import operations for premium users', () => {
      mockRequest.headers = {
        'x-csv-import': 'true',
      };
      const mockUser = createMockUser({
        subscriptionStatus: 'premium',
        username: 'premium-user',
      });
      mockRequest.user = mockUser;

      conditionalPremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow CSV import operations for trial users', () => {
      mockRequest.headers = {
        'x-csv-import': 'true',
      };
      const mockUser = createMockUser({
        subscriptionStatus: 'trial',
        username: 'trial-user',
        trialEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      mockRequest.user = mockUser;

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
      } as any;

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
      } as any;

      requirePremiumAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive CSV import header', () => {
      mockRequest.headers = {
        'X-CSV-Import': 'true',
      };

      // Note: Express headers are case-insensitive by default, but we check lowercase
      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(false); // Should be false since we check lowercase 'x-csv-import'
    });

    it('should return true only when x-csv-import is exactly "true"', () => {
      mockRequest.headers = {
        'x-csv-import': 'true',
      };

      const result = isPremiumOperation(mockRequest as Request);
      expect(result).toBe(true);
    });
  });
});