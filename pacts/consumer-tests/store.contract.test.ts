/**
 * Pact contract tests for Store endpoints
 * Using Pact v4 API
 */

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { Matchers } from '@pact-foundation/pact';
import { createPact, publishContracts } from './setup';
import { optionalString, optionalNumber, dateMatcher } from './helpers';

describe('Store API Contract', () => {
    const pact = createPact();

    beforeAll(() => pact.setup());
    afterAll(async () => {
        // Contracts are published manually using: npm run pact:publish
        // This prevents race conditions when multiple test suites run
    });

    describe('GET /api/store/items', () => {
        it('should return list of store items for creator', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get store items')
                .given('user is authenticated as creator and has store items')
                .withRequest('GET', '/api/store/items', (builder) => {
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
                        .jsonBody(Matchers.eachLike({
                            id: Matchers.integer(),
                            creatorId: Matchers.integer(),
                            title: Matchers.string(),
                            description: Matchers.string(),
                            pointsCost: Matchers.integer(),
                            maxQuantity: Matchers.like(null),
                            currentQuantity: Matchers.integer(),
                            isActive: Matchers.boolean(),
                            isAvailable: Matchers.boolean(),
                            createdAt: dateMatcher(),
                            updatedAt: dateMatcher(),
                        }));
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/store/items`, {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(Array.isArray(body)).toBe(true);
                });
        });
    });

    describe('POST /api/store/items', () => {
        it('should create a new store item', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to create a store item')
                .given('user is authenticated as creator with premium access')
                .withRequest('POST', '/api/store/items', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        })
                        .jsonBody({
                            title: 'Test Item',
                            description: 'This is a test store item',
                            pointsCost: 100,
                            maxQuantity: 10,
                        });
                })
                .willRespondWith(201, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            id: Matchers.integer(),
                            creatorId: Matchers.integer(),
                            title: Matchers.string(),
                            description: Matchers.string(),
                            pointsCost: Matchers.integer(),
                            maxQuantity: Matchers.integer(),
                            currentQuantity: Matchers.integer(),
                            isActive: Matchers.boolean(),
                            isAvailable: Matchers.boolean(),
                            createdAt: dateMatcher(),
                            updatedAt: dateMatcher(),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/store/items`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            title: 'Test Item',
                            description: 'This is a test store item',
                            pointsCost: 100,
                            maxQuantity: 10,
                        }),
                    });

                    expect(response.status).toBe(201);
                    const body = await response.json();
                    expect(body.title).toBeDefined();
                    expect(body.pointsCost).toBeDefined();
                });
        });
    });

    describe('GET /api/creators/:username/store', () => {
        it('should return public store items for a creator', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get public store items')
                .given('creator with username testcreator has active store items')
                .withRequest('GET', '/api/creators/testcreator/store')
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody(Matchers.eachLike({
                            id: Matchers.integer(),
                            creatorId: Matchers.integer(),
                            title: Matchers.string(),
                            description: Matchers.string(),
                            pointsCost: Matchers.integer(),
                            maxQuantity: Matchers.like(null),
                            currentQuantity: Matchers.integer(),
                            isActive: Matchers.boolean(),
                            isAvailable: Matchers.boolean(),
                            createdAt: dateMatcher(),
                            updatedAt: dateMatcher(),
                        }));
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/creators/testcreator/store`);
                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(Array.isArray(body)).toBe(true);
                });
        });
    });

    describe('POST /api/creators/:username/store/:itemId/redeem', () => {
        it('should redeem a store item', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to redeem a store item')
                .given('user is authenticated and has enough points, store item exists and is available')
                .withRequest('POST', '/api/creators/testcreator/store/1/redeem', (builder) => {
                    builder.headers({
                        'X-Requested-With': 'XMLHttpRequest',
                        Cookie: 'connect.sid=test-session-id',
                    });
                })
                .willRespondWith(201, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            id: Matchers.integer(),
                            storeItemId: Matchers.integer(),
                            userId: Matchers.integer(),
                            creatorId: Matchers.integer(),
                            pointsSpent: Matchers.integer(),
                            status: Matchers.string(),
                            createdAt: dateMatcher(),
                            completedAt: Matchers.like(null),
                            userUsername: Matchers.string(),
                            userEmail: Matchers.string(),
                            storeItemTitle: Matchers.string(),
                            storeItemDescription: Matchers.string(),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/creators/testcreator/store/1/redeem`, {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(201);
                    const body = await response.json();
                    expect(body.storeItemId).toBeDefined();
                    expect(body.status).toBeDefined();
                });
        });
    });
});
