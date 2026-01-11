/**
 * Pact contract tests for Creators endpoints
 * Using Pact v4 API
 */

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { Matchers } from '@pact-foundation/pact';
import { createPact, publishContracts } from './setup';
import { optionalString, optionalNumber, dateMatcher } from './helpers';

describe('Creators API Contract', () => {
    const pact = createPact();

    beforeAll(() => pact.setup());
    afterAll(async () => {
        // Contracts are published manually using: npm run pact:publish
        // This prevents race conditions when multiple test suites run
    });

    describe('GET /api/creators/:username', () => {
        it('should return creator profile with ideas', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get creator profile by username')
                .given('a creator with username testcreator exists')
                .withRequest('GET', '/api/creators/testcreator')
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            creator: {
                                id: Matchers.integer(),
                                username: Matchers.string(),
                                userRole: Matchers.string(),
                                email: Matchers.string(),
                                profileDescription: Matchers.like(null),
                                logoUrl: Matchers.like(null),
                                twitterUrl: Matchers.like(null),
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
                            },
                            ideas: Matchers.eachLike({
                                id: Matchers.integer(),
                                title: Matchers.string(),
                                description: Matchers.string(),
                                votes: Matchers.integer(),
                                createdAt: dateMatcher(),
                                creatorId: Matchers.integer(),
                                status: Matchers.string(),
                                niche: Matchers.like(null),
                                suggestedBy: Matchers.like(null),
                                suggestedByUsername: Matchers.like(null),
                                position: {
                                    current: Matchers.like(null),
                                    previous: Matchers.like(null),
                                    change: Matchers.integer(),
                                },
                            }),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/creators/testcreator`);
                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.creator).toBeDefined();
                    expect(body.ideas).toBeDefined();
                    expect(Array.isArray(body.ideas)).toBe(true);
                });
        });

        it('should return 404 for non-existent creator', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get non-existent creator')
                .given('no creator exists with username nonexistent')
                .withRequest('GET', '/api/creators/nonexistent')
                .willRespondWith(404, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            message: Matchers.string(),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/creators/nonexistent`);
                    expect(response.status).toBe(404);
                });
        });
    });

    describe('POST /api/creators/:username/suggest', () => {
        it('should suggest an idea to a creator', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to suggest an idea to a creator')
                .given('user is authenticated and creator with username testcreator exists')
                .withRequest('POST', '/api/creators/testcreator/suggest', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        })
                        .jsonBody({
                            title: 'Suggested Idea',
                            description: 'This is a suggested idea',
                        });
                })
                .willRespondWith(201, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            id: Matchers.integer(),
                            title: Matchers.string(),
                            description: Matchers.string(),
                            votes: Matchers.integer(),
                            createdAt: dateMatcher(),
                            creatorId: Matchers.integer(),
                            status: Matchers.string(),
                            niche: optionalString(),
                            suggestedBy: Matchers.integer(),
                            suggestedByUsername: optionalString(),
                            position: {
                                current: optionalNumber(),
                                previous: optionalNumber(),
                                change: Matchers.integer(),
                            },
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/creators/testcreator/suggest`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            title: 'Suggested Idea',
                            description: 'This is a suggested idea',
                        }),
                    });

                    expect(response.status).toBe(201);
                    const body = await response.json();
                    expect(body.title).toBeDefined();
                    expect(body.status).toBeDefined();
                });
        });
    });
});
