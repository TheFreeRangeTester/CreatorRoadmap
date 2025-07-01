import { describe, it, expect } from '@jest/globals';
import {
  insertUserSchema,
  userResponseSchema,
  insertIdeaSchema,
  suggestIdeaSchema,
  updateIdeaSchema,
  ideaResponseSchema,
  insertVoteSchema,
  insertPublicLinkSchema,
  publicLinkResponseSchema,
  updateProfileSchema,
  createCheckoutSessionSchema,
  updateSubscriptionSchema,
} from '../schema';

describe('User Schemas', () => {
  describe('insertUserSchema', () => {
    it('should validate a valid user input', () => {
      const validUser = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        userRole: 'creator' as const,
      };
      
      const result = insertUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject username with invalid characters', () => {
      const invalidUser = {
        username: 'test@user',
        password: 'password123',
        email: 'test@example.com',
      };
      
      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('solo puede contener letras');
      }
    });

    it('should reject short username', () => {
      const invalidUser = {
        username: 'ab',
        password: 'password123',
        email: 'test@example.com',
      };
      
      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('al menos 3 caracteres');
      }
    });

    it('should reject short password', () => {
      const invalidUser = {
        username: 'testuser',
        password: '12345',
        email: 'test@example.com',
      };
      
      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('al menos 6 caracteres');
      }
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        username: 'testuser',
        password: 'password123',
        email: 'invalid-email',
      };
      
      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('email válido');
      }
    });

    it('should default userRole to audience when not provided', () => {
      const user = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };
      
      const result = insertUserSchema.safeParse(user);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userRole).toBe('audience');
      }
    });
  });

  describe('userResponseSchema', () => {
    it('should validate a complete user response', () => {
      const userResponse = {
        id: 1,
        username: 'testuser',
        userRole: 'creator' as const,
        profileDescription: 'A test user',
        logoUrl: 'https://example.com/logo.png',
        twitterUrl: 'https://twitter.com/testuser',
        email: 'test@example.com',
        subscriptionStatus: 'premium' as const,
        hasUsedTrial: true,
        profileBackground: 'gradient-2',
      };
      
      const result = userResponseSchema.safeParse(userResponse);
      expect(result.success).toBe(true);
    });

    it('should handle nullable fields', () => {
      const userResponse = {
        id: 1,
        username: 'testuser',
        userRole: 'audience' as const,
        profileDescription: null,
        logoUrl: null,
        subscriptionStatus: 'free' as const,
        hasUsedTrial: false,
      };
      
      const result = userResponseSchema.safeParse(userResponse);
      expect(result.success).toBe(true);
    });
  });
});

describe('Idea Schemas', () => {
  describe('insertIdeaSchema', () => {
    it('should validate a valid idea', () => {
      const validIdea = {
        title: 'Test Idea',
        description: 'This is a test idea description',
      };
      
      const result = insertIdeaSchema.safeParse(validIdea);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidIdea = {
        title: '',
        description: 'Valid description',
      };
      
      const result = insertIdeaSchema.safeParse(invalidIdea);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Title is required');
      }
    });

    it('should reject title longer than 100 characters', () => {
      const invalidIdea = {
        title: 'A'.repeat(101),
        description: 'Valid description',
      };
      
      const result = insertIdeaSchema.safeParse(invalidIdea);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('100 characters or less');
      }
    });

    it('should reject description longer than 280 characters', () => {
      const invalidIdea = {
        title: 'Valid title',
        description: 'A'.repeat(281),
      };
      
      const result = insertIdeaSchema.safeParse(invalidIdea);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('280 characters or less');
      }
    });
  });

  describe('suggestIdeaSchema', () => {
    it('should validate suggestion with creatorId', () => {
      const validSuggestion = {
        title: 'Suggested Idea',
        description: 'This is a suggested idea',
        creatorId: 1,
      };
      
      const result = suggestIdeaSchema.safeParse(validSuggestion);
      expect(result.success).toBe(true);
    });

    it('should require creatorId', () => {
      const invalidSuggestion = {
        title: 'Suggested Idea',
        description: 'This is a suggested idea',
      };
      
      const result = suggestIdeaSchema.safeParse(invalidSuggestion);
      expect(result.success).toBe(false);
    });
  });

  describe('ideaResponseSchema', () => {
    it('should validate complete idea response', () => {
      const ideaResponse = {
        id: 1,
        title: 'Test Idea',
        description: 'Test description',
        votes: 5,
        createdAt: new Date(),
        creatorId: 1,
        position: {
          current: 1,
          previous: 2,
          change: 1,
        },
        status: 'approved' as const,
        suggestedBy: null,
      };
      
      const result = ideaResponseSchema.safeParse(ideaResponse);
      expect(result.success).toBe(true);
    });
  });
});

describe('Vote Schemas', () => {
  describe('insertVoteSchema', () => {
    it('should validate vote with ideaId', () => {
      const validVote = {
        ideaId: 1,
      };
      
      const result = insertVoteSchema.safeParse(validVote);
      expect(result.success).toBe(true);
    });

    it('should require ideaId', () => {
      const invalidVote = {};
      
      const result = insertVoteSchema.safeParse(invalidVote);
      expect(result.success).toBe(false);
    });
  });
});

describe('Public Link Schemas', () => {
  describe('insertPublicLinkSchema', () => {
    it('should validate minimal public link', () => {
      const validLink = {};
      
      const result = insertPublicLinkSchema.safeParse(validLink);
      expect(result.success).toBe(true);
    });

    it('should validate with expiration date', () => {
      const validLink = {
        expiresAt: '2025-12-31T23:59:59.000Z',
      };
      
      const result = insertPublicLinkSchema.safeParse(validLink);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expiresAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('publicLinkResponseSchema', () => {
    it('should validate complete public link response', () => {
      const linkResponse = {
        id: 1,
        token: 'abc123',
        creatorId: 1,
        createdAt: new Date(),
        isActive: true,
        expiresAt: null,
        url: 'https://example.com/public/abc123',
      };
      
      const result = publicLinkResponseSchema.safeParse(linkResponse);
      expect(result.success).toBe(true);
    });
  });
});

describe('Profile Update Schema', () => {
  describe('updateProfileSchema', () => {
    it('should validate profile update with all fields', () => {
      const profileUpdate = {
        profileDescription: 'Updated description',
        logoUrl: 'https://example.com/new-logo.png',
        twitterUrl: 'https://twitter.com/updated',
        instagramUrl: 'https://instagram.com/updated',
        youtubeUrl: 'https://youtube.com/updated',
        tiktokUrl: 'https://tiktok.com/updated',
        threadsUrl: 'https://threads.net/updated',
        websiteUrl: 'https://example.com',
        profileBackground: 'gradient-3',
        userRole: 'creator' as const,
        email: 'updated@example.com',
      };
      
      const result = updateProfileSchema.safeParse(profileUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject description longer than 500 characters', () => {
      const profileUpdate = {
        profileDescription: 'A'.repeat(501),
      };
      
      const result = updateProfileSchema.safeParse(profileUpdate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('500 caracteres o menos');
      }
    });

    it('should allow null values for optional fields', () => {
      const profileUpdate = {
        profileDescription: null,
        logoUrl: null,
        twitterUrl: null,
      };
      
      const result = updateProfileSchema.safeParse(profileUpdate);
      expect(result.success).toBe(true);
    });
  });
});

describe('Subscription Schemas', () => {
  describe('createCheckoutSessionSchema', () => {
    it('should validate checkout session with required plan', () => {
      const checkoutSession = {
        plan: 'monthly' as const,
      };
      
      const result = createCheckoutSessionSchema.safeParse(checkoutSession);
      expect(result.success).toBe(true);
    });

    it('should validate with optional URLs', () => {
      const checkoutSession = {
        plan: 'yearly' as const,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };
      
      const result = createCheckoutSessionSchema.safeParse(checkoutSession);
      expect(result.success).toBe(true);
    });

    it('should reject invalid plan', () => {
      const checkoutSession = {
        plan: 'invalid',
      };
      
      const result = createCheckoutSessionSchema.safeParse(checkoutSession);
      expect(result.success).toBe(false);
    });
  });

  describe('updateSubscriptionSchema', () => {
    it('should validate subscription update', () => {
      const subscriptionUpdate = {
        subscriptionStatus: 'premium' as const,
        hasUsedTrial: true,
        subscriptionPlan: 'monthly' as const,
      };
      
      const result = updateSubscriptionSchema.safeParse(subscriptionUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const subscriptionUpdate = {
        subscriptionStatus: 'trial' as const,
      };
      
      const result = updateSubscriptionSchema.safeParse(subscriptionUpdate);
      expect(result.success).toBe(true);
    });
  });
});