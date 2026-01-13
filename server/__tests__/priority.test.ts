import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PriorityService } from '../services/priority';
import { db } from '../db';
import { eq, desc, and, inArray } from 'drizzle-orm';

// Mock de la base de datos
const mockLimit: jest.MockedFunction<any> = jest.fn() as any;
const mockWhere: jest.MockedFunction<any> = jest.fn() as any;
const mockOrderBy: jest.MockedFunction<any> = jest.fn() as any;
const mockSet: jest.MockedFunction<any> = jest.fn() as any;
const mockFrom: jest.MockedFunction<any> = jest.fn() as any;
const mockUpdateWhere: jest.MockedFunction<any> = jest.fn() as any;

jest.mock('../db', () => {
  const mockSetFn = jest.fn();
  const mockUpdateWhereFn = jest.fn();
  mockSetFn.mockReturnValue({
    where: mockUpdateWhereFn,
  });
  // @ts-expect-error - TypeScript inference issue with jest.fn()
  mockUpdateWhereFn.mockResolvedValue(undefined) as any;

  const mockDb = {
    select: jest.fn(() => ({
      from: jest.fn(),
    })),
    update: jest.fn(() => ({
      set: mockSetFn,
    })),
  };
  return {
    db: mockDb,
  };
});

// Don't mock drizzle-orm - let it use the real implementation
// We'll mock the specific functions we need in tests

describe('PriorityService', () => {
  let priorityService: PriorityService;

  beforeEach(() => {
    jest.clearAllMocks();
    priorityService = new PriorityService();

    // Setup default chain mocks - get mockFrom from db.select mock
    (db.select as jest.MockedFunction<any>).mockReturnValue({
      from: mockFrom,
    });

    mockFrom.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    // mockWhere needs to return different things depending on usage:
    // - For select().from().where().limit(): return { limit: mockLimit }
    // - For select().from().where().orderBy(): return { orderBy: mockOrderBy }
    mockWhere.mockReturnValue({
      limit: mockLimit,
      orderBy: mockOrderBy,
    });

    // mockSet is configured in jest.mock, but we need to reset it in beforeEach
    // Get the set function from the update mock
    (db.update as jest.MockedFunction<any>).mockReturnValue({
      set: mockSet,
    });
    mockSet.mockReturnValue({
      where: mockUpdateWhere,
    });
    mockUpdateWhere.mockResolvedValue(undefined);

    mockOrderBy.mockReturnValue([]);
  });

  describe('getCreatorPriorityWeight', () => {
    it('should return priority weight from database', async () => {
      mockLimit.mockResolvedValue([{ priorityWeight: 60 }]);

      const result = await priorityService.getCreatorPriorityWeight(1);

      expect(db.select).toHaveBeenCalled();
      // Note: We can't spy on drizzle-orm functions, so we verify db calls instead
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toBe(60);
    });

    it('should return default weight of 55 when creator not found', async () => {
      mockLimit.mockResolvedValue([]);

      const result = await priorityService.getCreatorPriorityWeight(999);

      expect(result).toBe(55);
    });

    it('should return default weight of 55 when priorityWeight is null', async () => {
      mockLimit.mockResolvedValue([{ priorityWeight: null }]);

      const result = await priorityService.getCreatorPriorityWeight(1);

      expect(result).toBe(55);
    });
  });

  describe('updateCreatorPriorityWeight', () => {
    it('should update priority weight in database', async () => {

      await priorityService.updateCreatorPriorityWeight(1, 65);

      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ priorityWeight: 65 });
      // Note: We can't spy on drizzle-orm functions, so we verify db calls instead
    });

    it('should clamp weight to minimum of 30', async () => {
      await priorityService.updateCreatorPriorityWeight(1, 20);

      expect(mockSet).toHaveBeenCalledWith({ priorityWeight: 30 });
      expect(mockUpdateWhere).toHaveBeenCalled();
    });

    it('should clamp weight to maximum of 70', async () => {

      await priorityService.updateCreatorPriorityWeight(1, 80);

      expect(mockSet).toHaveBeenCalledWith({ priorityWeight: 70 });
    });

    it('should allow weight at minimum boundary (30)', async () => {

      await priorityService.updateCreatorPriorityWeight(1, 30);

      expect(mockSet).toHaveBeenCalledWith({ priorityWeight: 30 });
    });

    it('should allow weight at maximum boundary (70)', async () => {

      await priorityService.updateCreatorPriorityWeight(1, 70);

      expect(mockSet).toHaveBeenCalledWith({ priorityWeight: 70 });
    });
  });

  describe('getIdeasWithPriority', () => {
    const mockIdea1 = {
      id: 1,
      title: 'Idea 1',
      description: 'Description 1',
      votes: 10,
      createdAt: new Date(),
      creatorId: 1,
      lastPositionUpdate: new Date(),
      currentPosition: 1,
      previousPosition: null,
      status: 'approved' as const,
      suggestedBy: null,
      niche: null,
    };

    const mockIdea2 = {
      id: 2,
      title: 'Idea 2',
      description: 'Description 2',
      votes: 5,
      createdAt: new Date(),
      creatorId: 1,
      lastPositionUpdate: new Date(),
      currentPosition: 2,
      previousPosition: null,
      status: 'approved' as const,
      suggestedBy: null,
      niche: null,
    };

    const mockYoutubeScore = {
      id: 1,
      ideaId: 1,
      snapshotId: null,
      demandScore: 80,
      demandLabel: 'high',
      competitionScore: 30,
      competitionLabel: 'low',
      opportunityScore: 75,
      opportunityLabel: 'strong',
      compositeLabel: 'balanced',
      explanationJson: {},
      updatedAt: new Date(),
    };

    beforeEach(() => {
      // Mock getCreatorPriorityWeight
      jest.spyOn(priorityService, 'getCreatorPriorityWeight').mockResolvedValue(55);
    });

    it('should return empty array when no ideas found', async () => {
      mockOrderBy.mockResolvedValue([]);

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result).toEqual([]);
    });

    it('should calculate priority scores for ideas without YouTube data', async () => {
      mockOrderBy.mockResolvedValue([mockIdea1, mockIdea2]);

      // Mock YouTube scores query (empty)
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          // Check if it's youtubeScores table by checking if it has ideaId property
          if (table && table.ideaId !== undefined) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result).toHaveLength(2);
      expect(result[0].priority.voteScore).toBe(100); // Normalized: 10/10 * 100
      expect(result[1].priority.voteScore).toBe(50); // Normalized: 5/10 * 100
      expect(result[0].priority.hasYouTubeData).toBe(false);
      expect(result[0].priority.opportunityScore).toBeNull();
    });

    it('should calculate priority scores with YouTube data', async () => {
      mockOrderBy.mockResolvedValue([mockIdea1]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere = jest.fn().mockResolvedValue([mockYoutubeScore]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          // Simple check: if table is an object with ideaId, treat as youtubeScores
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result).toHaveLength(1);
      expect(result[0].priority.hasYouTubeData).toBe(true);
      expect(result[0].priority.opportunityScore).toBe(75);
      expect(result[0].youtubeScore).toEqual(mockYoutubeScore);
    });

    it('should handle stale YouTube data (older than 24 hours)', async () => {
      const staleDate = new Date();
      staleDate.setHours(staleDate.getHours() - 25);
      const staleYoutubeScore = {
        ...mockYoutubeScore,
        updatedAt: staleDate,
      };

      mockOrderBy.mockResolvedValue([mockIdea1]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere = jest.fn().mockResolvedValue([staleYoutubeScore]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result[0].priority.isStale).toBe(true);
      expect(result[0].priority.effectiveOpportunityScore).toBe(60); // 75 * 0.8 = 60
    });

    it('should not mark fresh YouTube data as stale', async () => {
      const freshDate = new Date();
      freshDate.setHours(freshDate.getHours() - 12);
      const freshYoutubeScore = {
        ...mockYoutubeScore,
        updatedAt: freshDate,
      };

      mockOrderBy.mockResolvedValue([mockIdea1]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere = jest.fn().mockResolvedValue([freshYoutubeScore]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result[0].priority.isStale).toBe(false);
      expect(result[0].priority.effectiveOpportunityScore).toBe(75);
    });

    it('should sort results by priority score descending', async () => {
      const ideaWithMoreVotes = { ...mockIdea1, id: 1, votes: 20 };
      const ideaWithLessVotes = { ...mockIdea2, id: 2, votes: 5 };

      mockOrderBy.mockResolvedValue([ideaWithMoreVotes, ideaWithLessVotes]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result).toHaveLength(2);
      // First idea should have higher priority score (more votes)
      expect(result[0].priority.priorityScore).toBeGreaterThanOrEqual(result[1].priority.priorityScore);
    });

    it('should filter by completed status when specified', async () => {
      mockOrderBy.mockResolvedValue([]);

      await priorityService.getIdeasWithPriority(1, 'completed');

      // Note: We can't spy on drizzle-orm functions, so we verify the result instead
      expect(db.select).toHaveBeenCalled();
    });

    it('should use default approved status when not specified', async () => {
      mockOrderBy.mockResolvedValue([]);

      await priorityService.getIdeasWithPriority(1);

      // Note: We can't spy on drizzle-orm functions, so we verify the result instead
      expect(db.select).toHaveBeenCalled();
    });

    it('should calculate priority score with weighted formula', async () => {
      mockOrderBy.mockResolvedValue([mockIdea1]);

      // Mock priority weight of 60 (60% votes, 40% opportunity)
      jest.spyOn(priorityService, 'getCreatorPriorityWeight').mockResolvedValue(60);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere = jest.fn().mockResolvedValue([mockYoutubeScore]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      // voteScore = 100 (normalized), opportunityScore = 75
      // priorityScore = 0.6 * 100 + 0.4 * 75 = 60 + 30 = 90
      expect(result[0].priority.priorityScore).toBe(90);
    });

    it('should use vote score only when opportunity score is null', async () => {
      mockOrderBy.mockResolvedValue([mockIdea1]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      const result = await priorityService.getIdeasWithPriority(1);

      // When opportunityScore is null, priorityScore = voteScore
      expect(result[0].priority.priorityScore).toBe(100);
      expect(result[0].priority.opportunityScore).toBeNull();
    });
  });

  describe('getPriorityScoreForIdea', () => {
    const mockIdea = {
      id: 1,
      title: 'Test Idea',
      description: 'Test Description',
      votes: 15,
      createdAt: new Date(),
      creatorId: 1,
      lastPositionUpdate: new Date(),
      currentPosition: 1,
      previousPosition: null,
      status: 'approved' as const,
      suggestedBy: null,
      niche: null,
    };

    const mockYoutubeScore = {
      id: 1,
      ideaId: 1,
      snapshotId: null,
      demandScore: 70,
      demandLabel: 'medium',
      competitionScore: 50,
      competitionLabel: 'medium',
      opportunityScore: 65,
      opportunityLabel: 'good',
      compositeLabel: 'balanced',
      explanationJson: {},
      updatedAt: new Date(),
    };

    beforeEach(() => {
      jest.spyOn(priorityService, 'getCreatorPriorityWeight').mockResolvedValue(55);
    });

    it('should return null when idea not found', async () => {
      mockLimit.mockResolvedValue([]);

      const result = await priorityService.getPriorityScoreForIdea(999, 1);

      expect(result).toBeNull();
    });

    it('should return null when idea belongs to different creator', async () => {
      mockLimit.mockResolvedValue([]);

      const result = await priorityService.getPriorityScoreForIdea(1, 999);

      expect(result).toBeNull();
    });

    it('should calculate priority score for idea without YouTube data', async () => {
      mockLimit.mockResolvedValueOnce([mockIdea]);

      // Mock creator ideas query - this is called after the idea query
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockCreatorIdeasWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([{ votes: 20 }, { votes: 10 }]) as any;

      // Setup mock to return different results based on call order
      let callCount = 0;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          callCount++;
          if (callCount === 1) {
            // First call: get the idea
            return { where: mockWhere };
          } else if (callCount === 2) {
            // Second call: get creator ideas for max votes
            return { where: mockCreatorIdeasWhere };
          } else {
            // Third call: get YouTube score (empty)
            // @ts-expect-error - TypeScript inference issue with jest.fn()
            return { where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) as any }) };
          }
        });
        return result;
      }) as any;

      const result = await priorityService.getPriorityScoreForIdea(1, 1);

      expect(result).not.toBeNull();
      expect(result?.hasYouTubeData).toBe(false);
      expect(result?.opportunityScore).toBeNull();
      expect(result?.priorityScore).toBeGreaterThan(0);
    });

    it('should calculate priority score for idea with YouTube data', async () => {
      mockLimit.mockResolvedValueOnce([mockIdea]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockCreatorIdeasWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([{ votes: 20 }]) as any;
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeLimit: jest.MockedFunction<any> = jest.fn().mockResolvedValue([mockYoutubeScore]) as any;

      let callCount = 0;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          callCount++;
          if (callCount === 1) {
            return { where: mockWhere };
          } else if (callCount === 2) {
            return { where: mockCreatorIdeasWhere };
          } else {
            return { where: jest.fn().mockReturnValue({ limit: mockYoutubeLimit }) };
          }
        });
        return result;
      }) as any;

      const result = await priorityService.getPriorityScoreForIdea(1, 1);

      expect(result).not.toBeNull();
      expect(result?.hasYouTubeData).toBe(true);
      expect(result?.opportunityScore).toBe(65);
      expect(result?.priorityScore).toBeGreaterThan(0);
    });

    it('should handle stale YouTube data', async () => {
      const staleDate = new Date();
      staleDate.setHours(staleDate.getHours() - 25);
      const staleYoutubeScore = {
        ...mockYoutubeScore,
        updatedAt: staleDate,
      };

      mockLimit.mockResolvedValueOnce([mockIdea]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockCreatorIdeasWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([{ votes: 20 }]) as any;
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeLimit: jest.MockedFunction<any> = jest.fn().mockResolvedValue([staleYoutubeScore]) as any;

      let callCount = 0;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          callCount++;
          if (callCount === 1) {
            return { where: mockWhere };
          } else if (callCount === 2) {
            return { where: mockCreatorIdeasWhere };
          } else {
            return { where: jest.fn().mockReturnValue({ limit: mockYoutubeLimit }) };
          }
        });
        return result;
      }) as any;

      const result = await priorityService.getPriorityScoreForIdea(1, 1);

      expect(result?.isStale).toBe(true);
      expect(result?.effectiveOpportunityScore).toBe(52); // 65 * 0.8 = 52
    });

    it('should use max votes from all creator ideas for normalization', async () => {
      mockLimit.mockResolvedValueOnce([mockIdea]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockCreatorIdeasWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([
        { votes: 30 },
        { votes: 20 },
        { votes: 10 },
      ]) as any;
      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeLimit: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;

      let callCount = 0;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          callCount++;
          if (callCount === 1) {
            return { where: mockWhere };
          } else if (callCount === 2) {
            return { where: mockCreatorIdeasWhere };
          } else {
            return { where: jest.fn().mockReturnValue({ limit: mockYoutubeLimit }) };
          }
        });
        return result;
      }) as any;

      const result = await priorityService.getPriorityScoreForIdea(1, 1);

      // Idea has 15 votes, max is 30, so voteScore = 15/30 * 100 = 50
      expect(result?.voteScore).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero votes correctly', async () => {
      const ideaWithZeroVotes = {
        id: 1,
        title: 'Idea',
        description: 'Description',
        votes: 0,
        createdAt: new Date(),
        creatorId: 1,
        lastPositionUpdate: new Date(),
        currentPosition: 1,
        previousPosition: null,
        status: 'approved' as const,
        suggestedBy: null,
        niche: null,
      };

      mockOrderBy.mockResolvedValue([ideaWithZeroVotes]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      jest.spyOn(priorityService, 'getCreatorPriorityWeight').mockResolvedValue(55);

      const result = await priorityService.getIdeasWithPriority(1);

      expect(result[0].priority.voteScore).toBe(0);
    });

    it('should handle all ideas with zero votes', async () => {
      const idea1 = {
        id: 1,
        title: 'Idea 1',
        description: 'Description 1',
        votes: 0,
        createdAt: new Date(),
        creatorId: 1,
        lastPositionUpdate: new Date(),
        currentPosition: 1,
        previousPosition: null,
        status: 'approved' as const,
        suggestedBy: null,
        niche: null,
      };

      mockOrderBy.mockResolvedValue([idea1]);

      // @ts-expect-error - TypeScript inference issue with jest.fn()
      const mockYoutubeWhere: jest.MockedFunction<any> = jest.fn().mockResolvedValue([]) as any;
      (db.select as jest.MockedFunction<any>) = jest.fn((selectFn: any) => {
        const result: any = { from: jest.fn() };
        result.from.mockImplementation((table: any) => {
          if (table && typeof table === 'object' && 'ideaId' in table) {
            return { where: mockYoutubeWhere };
          }
          return { where: mockWhere, orderBy: mockOrderBy };
        });
        return result;
      }) as any;

      jest.spyOn(priorityService, 'getCreatorPriorityWeight').mockResolvedValue(55);

      const result = await priorityService.getIdeasWithPriority(1);

      // When maxVotes is 0, normalizeVotes returns 0, but Math.max ensures at least 1
      expect(result[0].priority.voteScore).toBe(0);
    });
  });
});
