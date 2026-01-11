/**
 * Helper functions for Pact consumer tests
 */

import { Matchers } from '@pact-foundation/pact';
import type { UserResponse } from '../../shared/schema';

/**
 * Create a matcher for a date string (ISO8601 format)
 */
export const dateMatcher = () => Matchers.datetime('yyyy-MM-dd\'T\'HH:mm:ss.SSSX', new Date().toISOString());

/**
 * Create a matcher for an optional string
 * Note: In Pact v4, we use Matchers.like(null) for optional fields
 */
export const optionalString = () => Matchers.like(null);

/**
 * Create a matcher for an optional number
 * Note: In Pact v4, we use Matchers.like(null) for optional fields
 */
export const optionalNumber = () => Matchers.like(null);

/**
 * Generate mock user data for tests
 */
export function createMockUser(overrides: Partial<UserResponse> = {}): UserResponse {
    return {
        id: 1,
        username: 'testuser',
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
        subscriptionPlan: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        subscriptionCanceledAt: null,
        ...overrides,
    };
}

/**
 * Generate mock idea data for tests
 */
export function createMockIdea(overrides: any = {}) {
    return {
        id: 1,
        title: 'Test Idea',
        description: 'This is a test idea description',
        votes: 0,
        createdAt: new Date().toISOString(),
        creatorId: 1,
        status: 'approved',
        niche: 'tutorial',
        suggestedBy: null,
        suggestedByUsername: undefined,
        position: {
            current: 1,
            previous: null,
            change: 0,
        },
        ...overrides,
    };
}

/**
 * Create authentication headers for authenticated requests
 */
export function createAuthHeaders(sessionId?: string): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (sessionId) {
        headers['Cookie'] = `connect.sid=${sessionId}`;
    }

    return headers;
}

/**
 * Common response matchers
 */
export const commonMatchers = {
    errorMessage: Matchers.string(),
    message: Matchers.string(),
    id: Matchers.integer(),
    userId: Matchers.integer(),
    creatorId: Matchers.integer(),
    username: Matchers.string(),
    email: Matchers.string(),
    createdAt: dateMatcher(),
    updatedAt: dateMatcher(),
};

