/**
 * Pact contract tests for Authentication endpoints
 * Using Pact v4 API
 */

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { Matchers } from '@pact-foundation/pact';
import { createPact, publishContracts } from './setup';
import { createMockUser, optionalString } from './helpers';

describe('Authentication API Contract', () => {
    const pact = createPact();

    beforeAll(() => pact.setup());
    afterAll(async () => {
        // Contracts are published manually using: npm run pact:publish
        // This prevents race conditions when multiple test suites run
    });

    describe('POST /api/auth/login', () => {
        it('should handle successful login', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to login with valid credentials')
                .given('a user exists with username testuser and password testpass')
                .withRequest('POST', '/api/auth/login', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        })
                        .jsonBody({
                            username: 'testuser',
                            password: 'testpass',
                        });
                })
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'Set-Cookie': Matchers.string(),
                        })
                        .jsonBody({
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
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            username: 'testuser',
                            password: 'testpass',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.username).toBeDefined();
                });
        });

        it('should handle invalid credentials', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to login with invalid credentials')
                .given('a user does not exist or password is incorrect')
                .withRequest('POST', '/api/auth/login', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        })
                        .jsonBody({
                            username: 'wronguser',
                            password: 'wrongpass',
                        });
                })
                .willRespondWith(401, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            message: Matchers.string(),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            username: 'wronguser',
                            password: 'wrongpass',
                        }),
                    });

                    expect(response.status).toBe(401);
                    const body = await response.json();
                    expect(body.message).toBeDefined();
                });
        });
    });

    describe('POST /api/auth/register', () => {
        it('should handle successful registration', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to register a new user')
                .given('no user exists with username newuser')
                .withRequest('POST', '/api/auth/register', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        })
                        .jsonBody({
                            username: 'newuser',
                            password: 'password123',
                            email: 'newuser@example.com',
                        });
                })
                .willRespondWith(201, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'Set-Cookie': Matchers.string(),
                        })
                        .jsonBody({
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
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            username: 'newuser',
                            password: 'password123',
                            email: 'newuser@example.com',
                        }),
                    });

                    expect(response.status).toBe(201);
                    const body = await response.json();
                    expect(body.username).toBeDefined();
                    expect(body.email).toBeDefined();
                });
        });
    });

    describe('GET /api/user', () => {
        it('should return authenticated user', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get current user')
                .given('user is authenticated')
                .withRequest('GET', '/api/user', (builder) => {
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
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/user`, {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.id).toBeDefined();
                    expect(body.username).toBeDefined();
                });
        });

        it('should return 401 for unauthenticated user', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get current user without authentication')
                .given('user is not authenticated')
                .withRequest('GET', '/api/user', (builder) => {
                    builder.headers({
                        'X-Requested-With': 'XMLHttpRequest',
                    });
                })
                .willRespondWith(401, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            message: Matchers.string(),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/user`, {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(401);
                    const body = await response.json();
                    expect(body.message).toBeDefined();
                });
        });
    });
});
