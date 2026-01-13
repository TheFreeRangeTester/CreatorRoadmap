import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TokenService } from '../services/tokenService';
import * as crypto from 'crypto';
import { db } from '../db';
import { eq, lt } from 'drizzle-orm';

// Mock de crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

// Mock de la base de datos
const mockValues: jest.MockedFunction<any> = jest.fn() as any;
const mockLimit: jest.MockedFunction<any> = jest.fn() as any;
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockDelete = jest.fn();

const mockDb = {
  insert: mockInsert,
  select: mockSelect,
  delete: mockDelete,
};

// Mock de drizzle-orm functions
const mockEq = jest.fn();
const mockLt = jest.fn();

jest.mock('../db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  lt: jest.fn(),
  isTable: jest.fn(),
}));

jest.mock('@shared/schema', () => ({
  passwordResetTokens: {},
}));

describe('TokenService', () => {
  let tokenService: TokenService;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService = new TokenService();

    // Setup mocks
    (db.insert as jest.MockedFunction<any>).mockReturnValue({
      values: mockValues,
    });
    (db.select as jest.MockedFunction<any>).mockReturnValue({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: mockLimit,
        })),
      })),
    });
    (db.delete as jest.MockedFunction<any>).mockReturnValue({
      where: jest.fn(),
    });

    // Mock console.error
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('generateToken', () => {
    it('should generate a random token', () => {
      const mockBuffer = Buffer.alloc(32, 'a'); // 32 bytes filled with 'a'
      (crypto.randomBytes as jest.MockedFunction<any>).mockReturnValue(mockBuffer);

      const token = tokenService.generateToken();

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(token).toBe(mockBuffer.toString('hex'));
      expect(token.length).toBe(64); // 32 bytes * 2 (hex encoding)
    });

    it('should generate different tokens on each call', () => {
      const mockBuffer1 = Buffer.alloc(32, 'a');
      const mockBuffer2 = Buffer.alloc(32, 'b');

      (crypto.randomBytes as jest.MockedFunction<any>)
        .mockReturnValueOnce(mockBuffer1)
        .mockReturnValueOnce(mockBuffer2);

      const token1 = tokenService.generateToken();
      const token2 = tokenService.generateToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with correct hex format', () => {
      const mockBuffer = Buffer.from('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 'hex');
      (crypto.randomBytes as jest.MockedFunction<any>).mockReturnValue(mockBuffer);

      const token = tokenService.generateToken();

      expect(token).toMatch(/^[0-9a-f]+$/i);
      expect(token.length).toBe(64);
    });
  });

  describe('storeToken', () => {
    it('should store token with default expiry of 1 hour', async () => {
      const beforeTime = Date.now();
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', 'test@example.com');

      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();

      const callArgs = mockValues.mock.calls[0][0] as any;
      expect(callArgs.token).toBe('test-token');
      expect(callArgs.email).toBe('test@example.com');

      const afterTime = Date.now();
      const expiresAt = new Date(callArgs.expiresAt).getTime();
      const expectedMin = beforeTime + (1 * 60 * 60 * 1000);
      const expectedMax = afterTime + (1 * 60 * 60 * 1000);

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should store token with custom expiry hours', async () => {
      const beforeTime = Date.now();
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', 'test@example.com', 24);

      const callArgs = mockValues.mock.calls[0][0] as any;
      const expiresAt = new Date(callArgs.expiresAt).getTime();
      const expectedMin = beforeTime + (24 * 60 * 60 * 1000);
      const expectedMax = Date.now() + (24 * 60 * 60 * 1000);

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should store token with correct email', async () => {
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', 'user@example.com');

      const callArgs = mockValues.mock.calls[0][0] as any;
      expect(callArgs.email).toBe('user@example.com');
    });

    it('should store token with correct token value', async () => {
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('my-custom-token-123', 'test@example.com');

      const callArgs = mockValues.mock.calls[0][0] as any;
      expect(callArgs.token).toBe('my-custom-token-123');
    });
  });

  describe('validateToken', () => {
    it('should return valid true for non-expired token', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const mockTokenData = {
        token: 'valid-token',
        email: 'test@example.com',
        expiresAt: futureDate,
        id: 1,
        createdAt: new Date(),
      };

      mockLimit.mockResolvedValue([mockTokenData] as any);

      const result = await tokenService.validateToken('valid-token');

      expect(result.valid).toBe(true);
      expect(result.email).toBe('test@example.com');
    });

    it('should return valid false when token not found', async () => {
      mockLimit.mockResolvedValue([] as any);

      const result = await tokenService.validateToken('non-existent-token');

      expect(result.valid).toBe(false);
      expect(result.email).toBeUndefined();
    });

    it('should return valid false and delete expired token', async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const mockTokenData = {
        token: 'expired-token',
        email: 'test@example.com',
        expiresAt: pastDate,
        id: 1,
        createdAt: new Date(),
      };

      mockLimit.mockResolvedValue([mockTokenData] as any);
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue(undefined as any) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      const result = await tokenService.validateToken('expired-token');

      expect(result.valid).toBe(false);
      expect(result.email).toBeUndefined();
      expect(db.delete).toHaveBeenCalled();
      expect(eq).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockLimit.mockRejectedValue(dbError as any);

      const result = await tokenService.validateToken('test-token');

      expect(result.valid).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error validating token:', dbError);
    });

    it('should return valid false for expired token (past date)', async () => {
      // Use a date clearly in the past to ensure it's expired
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const mockTokenData = {
        token: 'expired-token',
        email: 'test@example.com',
        expiresAt: pastDate,
        id: 1,
        createdAt: new Date(),
      };

      mockLimit.mockResolvedValue([mockTokenData] as any);
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue(undefined as any) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      const result = await tokenService.validateToken('expired-token');

      expect(result.valid).toBe(false);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('deleteToken', () => {
    it('should delete token from database', async () => {
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue(undefined as any) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      await tokenService.deleteToken('token-to-delete');

      expect(db.delete).toHaveBeenCalled();
      expect(eq).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const dbError = new Error('Delete failed');
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockRejectedValue(dbError) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      await expect(tokenService.deleteToken('token-to-delete')).rejects.toThrow();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue(undefined as any) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      await tokenService.cleanupExpiredTokens();

      expect(db.delete).toHaveBeenCalled();
      expect(lt).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      const dbError = new Error('Cleanup failed');
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockRejectedValue(dbError) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      await tokenService.cleanupExpiredTokens();

      expect(console.error).toHaveBeenCalledWith('Error cleaning up expired tokens:', dbError);
    });

    it('should not throw when cleanup succeeds', async () => {
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockDeleteWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue(undefined as any) as any;
      (db.delete as jest.MockedFunction<any>).mockReturnValue({
        where: mockDeleteWhere,
      });

      await expect(tokenService.cleanupExpiredTokens()).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty token string in validateToken', async () => {
      mockLimit.mockResolvedValue([] as any);

      const result = await tokenService.validateToken('');

      expect(result.valid).toBe(false);
    });

    it('should handle empty email in storeToken', async () => {
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', '');

      const callArgs = mockValues.mock.calls[0][0] as any;
      expect(callArgs.email).toBe('');
    });

    it('should handle zero expiry hours', async () => {
      const beforeTime = Date.now();
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', 'test@example.com', 0);

      const callArgs = mockValues.mock.calls[0][0] as any;
      const expiresAt = new Date(callArgs.expiresAt).getTime();
      const expectedMin = beforeTime;
      const expectedMax = Date.now() + 1000; // Small buffer for execution time

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should handle negative expiry hours', async () => {
      const beforeTime = Date.now();
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', 'test@example.com', -1);

      const callArgs = mockValues.mock.calls[0][0] as any;
      const expiresAt = new Date(callArgs.expiresAt).getTime();
      // Should be in the past
      expect(expiresAt).toBeLessThan(beforeTime);
    });

    it('should handle very long expiry hours', async () => {
      const beforeTime = Date.now();
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('test-token', 'test@example.com', 8760); // 1 year

      const callArgs = mockValues.mock.calls[0][0] as any;
      const expiresAt = new Date(callArgs.expiresAt).getTime();
      const expectedMin = beforeTime + (8760 * 60 * 60 * 1000);
      const expectedMax = Date.now() + (8760 * 60 * 60 * 1000);

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });

    it('should handle special characters in token', async () => {
      const specialToken = 'token-with-special-chars-!@#$%^&*()';
      mockLimit.mockResolvedValue([] as any);

      const result = await tokenService.validateToken(specialToken);

      expect(result.valid).toBe(false);
      expect(eq).toHaveBeenCalled();
    });

    it('should handle multiple tokens with same email', async () => {
      mockValues.mockResolvedValue(undefined as any);

      await tokenService.storeToken('token1', 'same@example.com');
      await tokenService.storeToken('token2', 'same@example.com');

      expect(mockValues).toHaveBeenCalledTimes(2);
      expect((mockValues.mock.calls[0][0] as any).email).toBe('same@example.com');
      expect((mockValues.mock.calls[1][0] as any).email).toBe('same@example.com');
    });
  });
});
