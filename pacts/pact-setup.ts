/**
 * Shared Pact configuration for Consumer and Provider tests
 */

export const PACT_CONFIG = {
    consumer: {
        name: 'CreatorRoadmap-Frontend',
    },
    provider: {
        name: 'CreatorRoadmap-Backend',
    },
    pactDir: './pacts/contracts',
    logDir: './pacts/logs',
    logLevel: 'INFO' as const,
    spec: 2 as const,
};

/**
 * Get PactFlow broker configuration from environment variables
 */
export function getPactBrokerConfig() {
    const baseUrl = process.env.PACT_BROKER_BASE_URL;
    const token = process.env.PACT_BROKER_TOKEN;
    const username = process.env.PACT_BROKER_USERNAME;
    const password = process.env.PACT_BROKER_PASSWORD;

    if (!baseUrl) {
        throw new Error('PACT_BROKER_BASE_URL environment variable is required');
    }

    // Prefer token authentication over username/password
    if (token) {
        return {
            pactBrokerUrl: baseUrl,
            pactBrokerToken: token,
        };
    }

    if (username && password) {
        return {
            pactBrokerUrl: baseUrl,
            pactBrokerUsername: username,
            pactBrokerPassword: password,
        };
    }

    throw new Error(
        'Either PACT_BROKER_TOKEN or both PACT_BROKER_USERNAME and PACT_BROKER_PASSWORD must be set'
    );
}

/**
 * Get version for publishing contracts
 * Uses git commit SHA if available, otherwise falls back to package.json version
 */
export function getVersion(): string {
    // Try to get git commit SHA
    try {
        const { execSync } = require('child_process');
        const gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        return gitSha;
    } catch (error) {
        // Fallback to package.json version
        try {
            const packageJson = require('../../package.json');
            return packageJson.version || '1.0.0';
        } catch {
            return '1.0.0';
        }
    }
}

/**
 * Get tags for publishing contracts
 * Uses git branch name if available
 */
export function getTags(): string[] {
    try {
        const { execSync } = require('child_process');
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        return [branch];
    } catch (error) {
        return ['main'];
    }
}

