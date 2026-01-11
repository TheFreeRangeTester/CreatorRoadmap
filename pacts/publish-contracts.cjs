/**
 * Script to manually publish contracts to PactFlow
 * Usage: node pacts/publish-contracts.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Publisher } = require('@pact-foundation/pact-node');
const path = require('path');

// Pact configuration (matching pact-setup.ts)
const PACT_CONFIG = {
    pactDir: './pacts/contracts',
};

// Get version and tags
function getVersion() {
    try {
        const { execSync } = require('child_process');
        const gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        // Add timestamp to make each publication unique
        const timestamp = Date.now();
        return `${gitSha}-${timestamp}`;
    } catch (error) {
        try {
            const packageJson = require('../package.json');
            const timestamp = Date.now();
            return `${packageJson.version || '1.0.0'}-${timestamp}`;
        } catch {
            const timestamp = Date.now();
            return `1.0.0-${timestamp}`;
        }
    }
}

function getTags() {
    try {
        const { execSync } = require('child_process');
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        return [branch];
    } catch (error) {
        return ['main'];
    }
}

async function publish() {
    const baseUrl = process.env.PACT_BROKER_BASE_URL;
    const token = process.env.PACT_BROKER_TOKEN;

    if (!baseUrl) {
        console.error('❌ PACT_BROKER_BASE_URL environment variable is required');
        process.exit(1);
    }

    if (!token) {
        console.error('❌ PACT_BROKER_TOKEN environment variable is required');
        process.exit(1);
    }

    const version = getVersion();
    const tags = getTags();

    console.log('📤 Publishing contracts to PactFlow...');
    console.log(`   URL: ${baseUrl}`);
    console.log(`   Version: ${version}`);
    console.log(`   Tags: ${tags.join(', ')}`);
    console.log(`   Contracts directory: ${PACT_CONFIG.pactDir}`);

    const publisher = new Publisher({
        pactFilesOrDirs: [PACT_CONFIG.pactDir],
        pactBroker: baseUrl,
        pactBrokerToken: token,
        consumerVersion: version,
        tags: tags,
    });

    try {
        // Publisher.publish() is the correct method
        await publisher.publish();
        console.log(`✅ Contracts published successfully!`);
        console.log(`\n🌐 View your contracts at: ${baseUrl}/pacts`);
        console.log(`   Consumer: CreatorRoadmap-Frontend`);
        console.log(`   Provider: CreatorRoadmap-Backend`);
    } catch (error) {
        console.error('❌ Failed to publish contracts:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

publish();

