/**
 * Setup for Pact Consumer tests
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { PactV4 } from '@pact-foundation/pact';
import { PACT_CONFIG, getPactBrokerConfig, getVersion, getTags } from '../pact-setup';

// Assign unique ports to each test suite to avoid conflicts
// Each test file gets its own port range
const PORT_MAP: Record<string, number> = {
    'auth.contract.test.ts': 1234,
    'ideas.contract.test.ts': 1235,
    'user.contract.test.ts': 1236,
    'creators.contract.test.ts': 1237,
    'store.contract.test.ts': 1238,
};

// Track which ports are in use to avoid conflicts
const usedPorts = new Set<number>();

/**
 * Create a new Pact instance for a test suite
 * Each test file gets a unique port to avoid conflicts
 */
export function createPact() {
    // Get the test file name from the stack trace
    const stack = new Error().stack;
    let testFileName = '';
    if (stack) {
        const match = stack.match(/([^\/]+\.contract\.test\.ts)/);
        if (match) {
            testFileName = match[1];
        }
    }

    // Try to get port from filename, otherwise find an available port
    let port = 1234;
    if (testFileName && PORT_MAP[testFileName]) {
        port = PORT_MAP[testFileName];
    } else {
        // Find next available port
        while (usedPorts.has(port)) {
            port++;
        }
    }

    usedPorts.add(port);

    return new PactV4({
        consumer: PACT_CONFIG.consumer.name,
        provider: PACT_CONFIG.provider.name,
        port: port,
        dir: PACT_CONFIG.pactDir,
        logLevel: 'info',
        host: '127.0.0.1',
    });
}

// Track if we've already published to avoid multiple publications
let hasPublished = false;

/**
 * Publish contracts to PactFlow after tests complete
 * Only publishes once, even if called from multiple test suites
 */
export async function publishContracts(): Promise<void> {
    // Only publish once, even if multiple test suites call this
    if (hasPublished) {
        return;
    }

    const brokerConfig = getPactBrokerConfig();
    const version = getVersion();
    const tags = getTags();

    const { Publisher } = require('@pact-foundation/pact-node');
    const publisher = new Publisher({
        pactFilesOrDirs: [PACT_CONFIG.pactDir],
        pactBroker: brokerConfig.pactBrokerUrl,
        pactBrokerToken: brokerConfig.pactBrokerToken,
        consumerVersion: version,
        tags: tags,
    });

    try {
        hasPublished = true; // Mark as published before attempting
        await publisher.publish();
        console.log(`✅ Contracts published to PactFlow (version: ${version}, tags: ${tags.join(', ')})`);
        console.log(`🌐 View at: ${brokerConfig.pactBrokerUrl}/pacts/provider/${PACT_CONFIG.provider.name}/consumer/${PACT_CONFIG.consumer.name}`);
    } catch (error) {
        hasPublished = false; // Reset on error so it can be retried
        console.error('❌ Failed to publish contracts to PactFlow:', error);
        // Don't throw - allow tests to complete even if publication fails
    }
}

