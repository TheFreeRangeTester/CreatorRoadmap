/**
 * Pact contract tests for Ideas endpoints
 * Using Pact v4 API
 */

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { Matchers } from '@pact-foundation/pact';
import { createPact, publishContracts } from './setup';
import { dateMatcher, optionalString, optionalNumber } from './helpers';

describe('Ideas API Contract', () => {
    const pact = createPact();

    beforeAll(() => pact.setup());
    afterAll(async () => {
        // Contracts are published manually using: npm run pact:publish
        // This prevents race conditions when multiple test suites run
    });

    describe('GET /api/ideas', () => {
        it('should return list of ideas for authenticated creator', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get all ideas')
                .given('user is authenticated as creator and has ideas')
                .withRequest('GET', '/api/ideas', (builder) => {
                    builder.headers({
                        'X-Requested-With': 'XMLHttpRequest',
                        Cookie: 'connect.sid=test-session-id',
                    });
                })
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'Cache-Control': Matchers.string(),
                        })
                        .jsonBody(Matchers.eachLike({
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
                        }));
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/ideas`, {
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

    describe('GET /api/ideas/:id', () => {
        it('should return a single idea', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get idea by id')
                .given('an idea with id 1 exists')
                .withRequest('GET', '/api/ideas/1')
                .willRespondWith(200, (builder) => {
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
                            niche: Matchers.like(null),
                            suggestedBy: Matchers.like(null),
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/ideas/1`);
                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.id).toBeDefined();
                });
        });

        it('should return 404 for non-existent idea', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to get non-existent idea')
                .given('no idea exists with id 999')
                .withRequest('GET', '/api/ideas/999')
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
                    const response = await fetch(`${mockServer.url}/api/ideas/999`);
                    expect(response.status).toBe(404);
                });
        });
    });

    describe('POST /api/ideas', () => {
        it('should create a new idea', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to create a new idea')
                .given('user is authenticated as creator')
                .withRequest('POST', '/api/ideas', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        })
                        .jsonBody({
                            title: 'New Idea',
                            description: 'This is a new idea',
                            niche: 'tutorial',
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
                            niche: Matchers.string(),
                            suggestedBy: Matchers.like(null),
                            suggestedByUsername: Matchers.like(null),
                            position: {
                                current: Matchers.like(null),
                                previous: Matchers.like(null),
                                change: Matchers.integer(),
                            },
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/ideas`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            title: 'New Idea',
                            description: 'This is a new idea',
                            niche: 'tutorial',
                        }),
                    });

                    expect(response.status).toBe(201);
                    const body = await response.json();
                    expect(body.title).toBeDefined();
                });
        });
    });

    describe('PUT /api/ideas/:id', () => {
        it('should update an existing idea', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to update an idea')
                .given('user is authenticated as creator and owns idea with id 1')
                .withRequest('PUT', '/api/ideas/1', (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        })
                        .jsonBody({
                            title: 'Updated Idea',
                            description: 'Updated description',
                        });
                })
                .willRespondWith(200, (builder) => {
                    builder
                        .headers({
                            'Content-Type': 'application/json',
                        })
                        .jsonBody({
                            id: Matchers.integer(1),
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
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/ideas/1`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            title: 'Updated Idea',
                            description: 'Updated description',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const body = await response.json();
                    expect(body.title).toBeDefined();
                });
        });
    });

    describe('DELETE /api/ideas/:id', () => {
        it('should delete an idea', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to delete an idea')
                .given('user is authenticated as creator and owns idea with id 1')
                .withRequest('DELETE', '/api/ideas/1', (builder) => {
                    builder.headers({
                        'X-Requested-With': 'XMLHttpRequest',
                        Cookie: 'connect.sid=test-session-id',
                    });
                })
                .willRespondWith(204)
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/ideas/1`, {
                        method: 'DELETE',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(204);
                });
        });
    });

    describe('POST /api/ideas/:id/vote', () => {
        it('should vote on an idea', async () => {
            await pact
                .addInteraction()
                .uponReceiving('a request to vote on an idea')
                .given('user is authenticated and idea with id 1 exists')
                .withRequest('POST', '/api/ideas/1/vote', (builder) => {
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
                            id: Matchers.integer(1),
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
                        });
                })
                .executeTest(async (mockServer) => {
                    const response = await fetch(`${mockServer.url}/api/ideas/1/vote`, {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Cookie: 'connect.sid=test-session-id',
                        },
                        credentials: 'include',
                    });

                    expect(response.status).toBe(201);
                    const body = await response.json();
                    expect(body.id).toBe(1);
                });
        });
    });
});
