/**
 * Pact Provider verification tests
 * Verifies that the provider (backend) satisfies all contracts from PactFlow
 */

import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { Verifier } from '@pact-foundation/pact';
import { startProviderServer, stopProviderServer, getProviderBaseUrl, getProviderBrokerConfig } from './setup';
import { stateHandlers, cleanupState } from './state-handlers';
import { PACT_CONFIG } from '../pact-setup';

describe('Pact Provider Verification', () => {
    beforeAll(async () => {
        // Start the Express server
        await startProviderServer();
    });

    afterAll(async () => {
        // Stop the server
        await stopProviderServer();
        // Cleanup test state
        await cleanupState();
    });

    it('should verify all contracts from PactFlow', async () => {
        const brokerConfig = getProviderBrokerConfig();

        console.log('🔍 Starting provider verification...');
        console.log(`   Provider: ${PACT_CONFIG.provider.name}`);
        console.log(`   Base URL: ${getProviderBaseUrl()}`);
        console.log(`   Broker: ${brokerConfig.pactBrokerUrl}`);
        console.log(`   📥 Fetching contracts from PactFlow...`);

        // Cache for session cookies to avoid multiple logins
        let sessionCookieCache: string | null = null;

        // Request filter to handle authentication
        // This will make a login request first and then add the session cookie to subsequent requests
        const requestFilter = async (request: any) => {
            // If the request needs authentication (has Cookie header but no valid session)
            // and it's not already a login/register request, we need to authenticate first
            const needsAuth = request.headers && request.headers['Cookie'] &&
                request.path && !request.path.includes('/api/auth/');

            if (needsAuth) {
                try {
                    // Use cached session cookie if available
                    if (sessionCookieCache) {
                        request.headers['Cookie'] = sessionCookieCache;
                        return request;
                    }

                    // Make a login request to get a valid session
                    const loginResponse = await fetch(`${getProviderBaseUrl()}/api/auth/login`, {
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

                    if (loginResponse.ok) {
                        // Extract session cookie from Set-Cookie header
                        const setCookieHeaders = loginResponse.headers.get('set-cookie');
                        if (setCookieHeaders) {
                            // Extract session ID from cookie (could be ideas.sid or connect.sid)
                            const sessionMatch = setCookieHeaders.match(/(?:ideas\.sid|connect\.sid)=([^;]+)/);
                            if (sessionMatch) {
                                // Cache and use the session cookie
                                sessionCookieCache = `ideas.sid=${sessionMatch[1]}`;
                                request.headers['Cookie'] = sessionCookieCache;
                            }
                        }
                    } else {
                        console.warn('Login failed in request filter:', await loginResponse.text());
                    }
                } catch (error) {
                    console.warn('Failed to authenticate for request filter:', error);
                }
            }

            return request;
        };

        const verifier = new Verifier({
            provider: PACT_CONFIG.provider.name,
            providerBaseUrl: getProviderBaseUrl(),
            pactBrokerUrl: brokerConfig.pactBrokerUrl,
            pactBrokerToken: brokerConfig.pactBrokerToken,
            publishVerificationResult: true,
            providerVersion: brokerConfig.providerVersion,
            providerTags: brokerConfig.providerTags || ['main'],
            // Specify which consumer versions to verify
            consumerVersionSelectors: [
                {
                    tag: 'contract-tests',
                    latest: true, // Get the latest version with this tag
                },
            ],
            stateHandlers: stateHandlers,
            requestFilter: requestFilter,
            // Request/response logging - use 'error' to minimize output
            logLevel: 'error' as const,
            // Disable pending pacts to speed up
            enablePending: false,
        } as any); // Using 'as any' to bypass TypeScript type checking for now

        try {
            const startTime = Date.now();
            console.log(`   ⚡ Running verifications...`);
            await verifier.verifyProvider();
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ All contracts verified successfully in ${duration}s`);
            console.log(`📤 Verification results published to PactFlow`);
        } catch (error) {
            console.error('❌ Contract verification failed:', error);
            throw error;
        }
    }, 180000); // 180 second timeout (3 minutes) for slow networks
});

