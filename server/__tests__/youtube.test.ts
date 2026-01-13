import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { YouTubeService } from '../services/youtube';
import { db } from '../db';
import { eq, and, gte } from 'drizzle-orm';

// Mock de la base de datos
const mockLimit: jest.MockedFunction<any> = jest.fn() as any;
const mockWhere: jest.MockedFunction<any> = jest.fn() as any;
const mockSelect: jest.MockedFunction<any> = jest.fn() as any;
const mockFrom: jest.MockedFunction<any> = jest.fn() as any;
const mockInsert: jest.MockedFunction<any> = jest.fn() as any;
const mockValues: jest.MockedFunction<any> = jest.fn() as any;
const mockReturning: jest.MockedFunction<any> = jest.fn() as any;
const mockUpdate: jest.MockedFunction<any> = jest.fn() as any;
const mockSet: jest.MockedFunction<any> = jest.fn() as any;

// Mock de drizzle-orm functions
const mockEq = jest.fn();
const mockAnd = jest.fn();
const mockGte = jest.fn();

jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  gte: jest.fn(),
  desc: jest.fn(),
}));

jest.mock('@shared/schema', () => ({
  youtubeSnapshots: {},
  youtubeScores: {},
  youtubeApiUsage: {},
  youtubeUserUsage: {},
  ideas: {},
}));

// Mock de fetch global
global.fetch = jest.fn() as jest.MockedFunction<any>;

describe('YouTubeService', () => {
  let youtubeService: YouTubeService;
  let originalEnv: NodeJS.ProcessEnv;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    jest.clearAllMocks();

    // Guardar estado original
    originalEnv = { ...process.env };
    originalConsoleLog = console.log;
    originalConsoleError = console.error;

    // Mock console
    console.log = jest.fn();
    console.error = jest.fn();

    // Setup default mocks - will be overridden in individual tests
    (db.select as jest.MockedFunction<any>).mockImplementation(() => {
      const chain = {
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
      };
      return chain;
    });

    (db.insert as jest.MockedFunction<any>).mockReturnValue({
      values: mockValues,
    });
    mockValues.mockReturnValue({
      returning: mockReturning,
    });

    (db.update as jest.MockedFunction<any>).mockReturnValue({
      set: mockSet,
    });
    mockSet.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      returning: mockReturning,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with API key from environment', () => {
      process.env.YOUTUBE_API_KEY = 'test-api-key-123';
      const service = new YouTubeService();

      expect(service.isConfigured()).toBe(true);
    });

    it('should initialize without API key when not set', () => {
      delete process.env.YOUTUBE_API_KEY;
      const service = new YouTubeService();

      expect(service.isConfigured()).toBe(false);
    });

    it('should return false when API key is empty string', () => {
      process.env.YOUTUBE_API_KEY = '';
      const service = new YouTubeService();

      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('isConfigured', () => {
    it('should return true when API key is set', () => {
      process.env.YOUTUBE_API_KEY = 'test-key';
      const service = new YouTubeService();

      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when API key is not set', () => {
      delete process.env.YOUTUBE_API_KEY;
      const service = new YouTubeService();

      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('getQuotaUsageToday', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return sum of units used today', async () => {
      const mockUsage = [
        { unitsUsed: 100, requestCount: 1 },
        { unitsUsed: 200, requestCount: 2 },
      ];

      // getQuotaUsageToday uses .where() without .limit()
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          // @ts-expect-error - TypeScript inference issue with jest.fn()
          where: jest.fn().mockResolvedValue(mockUsage),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getQuotaUsageToday();

      expect(result).toBe(300);
      expect(gte).toHaveBeenCalled();
    });

    it('should return 0 when no usage today', async () => {
      // getQuotaUsageToday uses .where() without .limit()
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          // @ts-expect-error - TypeScript inference issue with jest.fn()
          where: jest.fn().mockResolvedValue([]),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getQuotaUsageToday();

      expect(result).toBe(0);
    });

    it('should handle single usage entry', async () => {
      // getQuotaUsageToday uses .where() without .limit()
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          // @ts-expect-error - TypeScript inference issue with jest.fn()
          where: jest.fn().mockResolvedValue([{ unitsUsed: 50, requestCount: 1 }]),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getQuotaUsageToday();

      expect(result).toBe(50);
    });
  });

  describe('canMakeRequest', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return true when quota is available', async () => {
      mockLimit.mockResolvedValue([{ unitsUsed: 100 }]);
      jest.spyOn(YouTubeService.prototype, 'getQuotaUsageToday').mockResolvedValue(100);

      const service = new YouTubeService();
      const result = await service.canMakeRequest(100);

      expect(result).toBe(true);
    });

    it('should return false when quota would be exceeded', async () => {
      jest.spyOn(YouTubeService.prototype, 'getQuotaUsageToday').mockResolvedValue(8950);

      const service = new YouTubeService();
      const result = await service.canMakeRequest(100);

      expect(result).toBe(false);
    });

    it('should return true when exactly at limit', async () => {
      jest.spyOn(YouTubeService.prototype, 'getQuotaUsageToday').mockResolvedValue(8900);

      const service = new YouTubeService();
      const result = await service.canMakeRequest(100);

      expect(result).toBe(true);
    });
  });

  describe('getUserDailyUsage', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return request count for user today', async () => {
      const mockUsage = [{ requestCount: 5 }];
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn: jest.MockedFunction<any> = jest.fn().mockResolvedValue(mockUsage) as any;
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: limitFn,
          })),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getUserDailyUsage(1);

      expect(result).toBe(5);
      expect(eq).toHaveBeenCalled();
      expect(and).toHaveBeenCalled();
    });

    it('should return 0 when user has no usage today', async () => {
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: limitFn,
          })),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getUserDailyUsage(1);

      expect(result).toBe(0);
    });
  });

  describe('canUserMakeRequest', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return true when user is under limit', async () => {
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(5);

      const service = new YouTubeService();
      const result = await service.canUserMakeRequest(1);

      expect(result).toBe(true);
    });

    it('should return false when user is at limit', async () => {
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(10);

      const service = new YouTubeService();
      const result = await service.canUserMakeRequest(1);

      expect(result).toBe(false);
    });

    it('should return false when user exceeds limit', async () => {
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(15);

      const service = new YouTubeService();
      const result = await service.canUserMakeRequest(1);

      expect(result).toBe(false);
    });
  });

  describe('getUserRemainingRequests', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return remaining requests', async () => {
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(3);

      const service = new YouTubeService();
      const result = await service.getUserRemainingRequests(1);

      expect(result).toBe(7); // 10 - 3
    });

    it('should return 0 when user is at limit', async () => {
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(10);

      const service = new YouTubeService();
      const result = await service.getUserRemainingRequests(1);

      expect(result).toBe(0);
    });

    it('should not return negative values', async () => {
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(15);

      const service = new YouTubeService();
      const result = await service.getUserRemainingRequests(1);

      expect(result).toBe(0);
    });
  });

  describe('getCachedScore', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return null when no score exists', async () => {
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: limitFn,
          })),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getCachedScore(1);

      expect(result.score).toBeNull();
      expect(result.snapshot).toBeNull();
      expect(result.isFresh).toBe(false);
    });

    it('should return score with fresh snapshot', async () => {
      const freshDate = new Date();
      freshDate.setHours(freshDate.getHours() - 12); // 12 hours ago

      const mockScore = {
        id: 1,
        ideaId: 1,
        snapshotId: 1,
        demandScore: 75,
        opportunityScore: 80,
      };
      const mockSnapshot = {
        id: 1,
        ideaId: 1,
        fetchedAt: freshDate,
      };

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn1: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockScore]) as any;
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn2: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockSnapshot]) as any;

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: limitFn1,
            })),
          })),
        })
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: limitFn2,
            })),
          })),
        });

      const service = new YouTubeService();
      const result = await service.getCachedScore(1);

      expect(result.score).toEqual(mockScore);
      expect(result.snapshot).toEqual(mockSnapshot);
      expect(result.isFresh).toBe(true);
    });

    it('should return score with stale snapshot', async () => {
      const staleDate = new Date();
      staleDate.setHours(staleDate.getHours() - 50); // 50 hours ago

      const mockScore = {
        id: 1,
        ideaId: 1,
        snapshotId: 1,
        demandScore: 75,
      };
      const mockSnapshot = {
        id: 1,
        ideaId: 1,
        fetchedAt: staleDate,
      };

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn1: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockScore]) as any;
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn2: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockSnapshot]) as any;

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: limitFn1,
            })),
          })),
        })
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: limitFn2,
            })),
          })),
        });

      const service = new YouTubeService();
      const result = await service.getCachedScore(1);

      expect(result.isFresh).toBe(false);
    });

    it('should handle score without snapshot', async () => {
      const mockScore = {
        id: 1,
        ideaId: 1,
        snapshotId: null,
      };

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn1: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockScore]) as any;
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn2: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;

      (db.select as jest.MockedFunction<any>)
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: limitFn1,
            })),
          })),
        })
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            where: jest.fn(() => ({
              limit: limitFn2,
            })),
          })),
        });

      const service = new YouTubeService();
      const result = await service.getCachedScore(1);

      expect(result.score).toEqual(mockScore);
      expect(result.snapshot).toBeNull();
      expect(result.isFresh).toBe(false);
    });
  });

  describe('fetchAndScore', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should return error when API key not configured', async () => {
      delete process.env.YOUTUBE_API_KEY;
      const service = new YouTubeService();

      const result = await service.fetchAndScore(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('YouTube API key not configured');
    });

    it('should return cached score when fresh and not forcing refresh', async () => {
      const mockScore = { id: 1, ideaId: 1, snapshotId: 1 };
      const mockSnapshot = { id: 1, ideaId: 1, fetchedAt: new Date() };

      jest.spyOn(YouTubeService.prototype, 'getCachedScore').mockResolvedValue({
        score: mockScore as any,
        snapshot: mockSnapshot as any,
        isFresh: true,
      });

      const service = new YouTubeService();
      const result = await service.fetchAndScore(1);

      expect(result.success).toBe(true);
      expect(result.score).toEqual(mockScore);
      expect(result.snapshot).toEqual(mockSnapshot);
    });

    it('should return error when user rate limit exceeded', async () => {
      const mockScore = { id: 1, ideaId: 1, snapshotId: 1 };
      const mockSnapshot = { id: 1, ideaId: 1, fetchedAt: new Date(Date.now() - 50 * 60 * 60 * 1000) };

      jest.spyOn(YouTubeService.prototype, 'getCachedScore').mockResolvedValue({
        score: mockScore as any,
        snapshot: mockSnapshot as any,
        isFresh: false,
      });
      jest.spyOn(YouTubeService.prototype, 'canUserMakeRequest').mockResolvedValue(false);
      jest.spyOn(YouTubeService.prototype, 'getUserRemainingRequests').mockResolvedValue(0);

      const service = new YouTubeService();
      const result = await service.fetchAndScore(1, false, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Daily analysis limit reached');
      expect(result.rateLimitInfo).toEqual({ remaining: 0, limit: 10 });
    });

    it('should return error when idea not found', async () => {
      const mockScore = { id: 1, ideaId: 1, snapshotId: 1 };
      const mockSnapshot = { id: 1, ideaId: 1, fetchedAt: new Date(Date.now() - 50 * 60 * 60 * 1000) };

      jest.spyOn(YouTubeService.prototype, 'getCachedScore').mockResolvedValue({
        score: mockScore as any,
        snapshot: mockSnapshot as any,
        isFresh: false,
      });
      jest.spyOn(YouTubeService.prototype, 'canUserMakeRequest').mockResolvedValue(true);
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>).mockReturnValueOnce({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: limitFn,
          })),
        })),
      }); // No idea found

      const service = new YouTubeService();
      const result = await service.fetchAndScore(999, false, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Idea not found');
    });

    it('should return error when quota exceeded', async () => {
      const mockScore = { id: 1, ideaId: 1, snapshotId: 1 };
      const mockSnapshot = { id: 1, ideaId: 1, fetchedAt: new Date(Date.now() - 50 * 60 * 60 * 1000) };
      const mockIdea = { id: 1, title: 'Test Idea', votes: 10, niche: null };

      jest.spyOn(YouTubeService.prototype, 'getCachedScore').mockResolvedValue({
        score: mockScore as any,
        snapshot: mockSnapshot as any,
        isFresh: false,
      });
      jest.spyOn(YouTubeService.prototype, 'canUserMakeRequest').mockResolvedValue(true);
      jest.spyOn(YouTubeService.prototype, 'canMakeRequest').mockResolvedValue(false);

      // Mock idea query - this happens before quota check in the actual code
      // The idea query uses .limit(1), so we need to mock that chain
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const limitFn: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockIdea]) as any;

      // Reset db.select mock and configure for this test
      (db.select as jest.MockedFunction<any>).mockReset();
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn(() => ({
          where: jest.fn(() => ({
            limit: limitFn,
          })),
        })),
      });

      const service = new YouTubeService();
      const result = await service.fetchAndScore(1, false, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Daily YouTube API quota exceeded');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      process.env.YOUTUBE_API_KEY = 'test-key';
    });

    it('should handle empty usage array in getQuotaUsageToday', async () => {
      // Clear any spies that might interfere
      jest.restoreAllMocks();

      // getQuotaUsageToday uses .where() without .limit()
      (db.select as jest.MockedFunction<any>).mockReset();
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn(() => ({
          // @ts-expect-error - TypeScript inference issue with jest.fn()
          where: jest.fn().mockResolvedValue([]),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getQuotaUsageToday();

      expect(result).toBe(0);
    });

    it('should handle multiple usage entries with zero units', async () => {
      // Clear any spies that might interfere
      jest.restoreAllMocks();

      // getQuotaUsageToday uses .where() without .limit()
      (db.select as jest.MockedFunction<any>).mockReset();
      (db.select as jest.MockedFunction<any>).mockReturnValue({
        from: jest.fn(() => ({
          // @ts-expect-error - TypeScript inference issue with jest.fn()
          where: jest.fn().mockResolvedValue([
            { unitsUsed: 0, requestCount: 1 },
            { unitsUsed: 0, requestCount: 2 },
          ]),
        })),
      });

      const service = new YouTubeService();
      const result = await service.getQuotaUsageToday();

      expect(result).toBe(0);
    });

    it('should handle getUserRemainingRequests with zero usage', async () => {
      // Clear any previous mocks and spies to avoid interference
      jest.clearAllMocks();
      jest.restoreAllMocks();
      jest.spyOn(YouTubeService.prototype, 'getUserDailyUsage').mockResolvedValue(0);

      const service = new YouTubeService();
      const result = await service.getUserRemainingRequests(1);

      expect(result).toBe(10); // USER_DAILY_LIMIT is 10
    });
  });
});
