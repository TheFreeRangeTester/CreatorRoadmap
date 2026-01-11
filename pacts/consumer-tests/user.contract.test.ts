/**
 * Pact contract tests for User endpoints
 * Using Pact v4 API
 */

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { Matchers } from '@pact-foundation/pact';
import { createPact, publishContracts } from './setup';
import { optionalString } from './helpers';

describe('User API Contract', () => {
    const pact = createPact();

    beforeAll(() => pact.setup());
    afterAll(async () => {
        // Contracts are published manually using: npm run pact:publish
        // This prevents race conditions when multiple test suites run
    });

    describe('PATCH /api/user/profile', () => {
        it('should update user profile', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to update user profile')
                .given('user is authenticated')
                .withRequest('PATCH', '/api/user/profile', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        })
                        .jsonBody({
                            profileDescription: 'Updated profile description',
                            twitterUrl: 'https://twitter.com/testuser',
                        });
                })
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            id: Matchers.integer(),
                            username: Matchers.string(),
                            userRole: Matchers.string(),
                            email: Matchers.string(),
                            profileDescription: Matchers.string(),
                            logoUrl: Matchers.like(null),
                            twitterUrl: Matchers.string(),
                            instagramUrl: Matchers.like(null),
                            youtubeUrl: Matchers.like(null),
                            tiktokUrl: Matchers.like(null),
                            threadsUrl: Matchers.like(null),
                            websiteUrl: Matchers.like(null),
                            profileBackground: Matchers.string(),
                            subscriptionStatus: Matchers.string(),
                            hasUsedTrial: Matchers.boolean(),
                            trialStartDate: Matchers.like(null),
                            trialEndDate: Matchers.like(null),
                            subscriptionPlan: Matchers.like(null),
                            subscriptionStartDate: Matchers.like(null),
                            subscriptionEndDate: Matchers.like(null),
                            subscriptionCanceledAt: Matchers.like(null),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/user/profile`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            profileDescription: 'Updated profile description',
                            twitterUrl: 'https://twitter.com/testuser',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.profileDescription).toBeDefined();
                });
        });
    });

    describe('GET /api/user/dashboard-stats', () => {
        it('should return dashboard statistics for creator', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get dashboard statistics')
                .given('user is authenticated as creator')
                .withRequest('GET', '/api/user/dashboard-stats', (builder) => {
                    builder.headers({
                        'X-Requested-With': 'XMLHttpRequest',
                        Cookie: 'connect.sid=test-session-id',
                    });
                })
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            totalIdeas: Matchers.integer(),
                            totalVotes: Matchers.integer(),
                            pendingSuggestions: Matchers.integer(),
                            publishedIdeas: Matchers.integer(),
                            pendingRedemptions: Matchers.integer(),
                            topNiche: Matchers.like(null),
                            topNiches: Matchers.eachLike({
                                name: Matchers.string(),
                                votes: Matchers.integer(),
                            }),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/user/dashboard-stats`, {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.totalIdeas).toBeDefined();
                    expect(body.totalVotes).toBeDefined();
                });
        });
    });

    describe('GET /api/user/audience-stats', () => {
        it('should return audience statistics', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get audience statistics')
                .given('user is authenticated')
                .withRequest('GET', '/api/user/audience-stats', (builder) => {
                    builder.headers({
                        'X-Requested-With': 'XMLHttpRequest',
                        Cookie: 'connect.sid=test-session-id',
                    });
                })
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            votesGiven: Matchers.integer(),
                            ideasSuggested: Matchers.integer(),
                            ideasApproved: Matchers.integer(),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/user/audience-stats`, {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.votesGiven).toBeDefined();
                    expect(body.ideasSuggested).toBeDefined();
                });
        });
    });
});
