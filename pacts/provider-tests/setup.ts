/**
 * Setup for Pact Provider verification tests
 */

import express, { type Express } from 'express';
import cors from 'cors';
import { registerRoutes } from '../../server/routes';
import { getPactBrokerConfig } from '../pact-setup';
import type { Server } from 'http';

let app: Express;
let server: Server;
const PORT = 3001; // Different port from dev server

/**
 * Start the Express server for provider verification
 */
export async function startProviderServer(): Promise<{ app: Express; server: Server }> {
    if (server) {
        return { app, server };
    }

    app = express();

    // Configure CORS
    app.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Register all routes
    server = await registerRoutes(app);

    // Start listening
    await new Promise<void>((resolve) => {
        server.listen(PORT, () => {
            console.log(`Provider server started on port ${PORT}`);
            resolve();
        });
    });

    return { app, server };
}

/**
 * Stop the Express server
 */
export async function stopProviderServer(): Promise<void> {
    if (server) {
        await new Promise<void>((resolve) => {
            server.close(() => {
                console.log('Provider server stopped');
                resolve();
            });
        });
        server = undefined as any;
        app = undefined as any;
    }
}

/**
 * Get the provider base URL
 */
export function getProviderBaseUrl(): string {
    return `http://localhost:${PORT}`;
}

/**
 * Get PactFlow broker configuration for provider verification
 */
export function getProviderBrokerConfig() {
    const brokerConfig = getPactBrokerConfig();
    
    // Import getVersion and getTags from pact-setup
    // Use dynamic import to handle TypeScript/CommonJS mix
    let version: string;
    let tags: string[];
    
    try {
        // Try to get from pact-setup module
        const pactSetup = require('../pact-setup');
        version = pactSetup.getVersion();
        tags = pactSetup.getTags();
    } catch (error) {
        // Fallback: implement inline
        try {
            const { execSync } = require('child_process');
            const gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
            const timestamp = Date.now();
            version = `${gitSha}-${timestamp}`;
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
            tags = [branch];
        } catch (e) {
            version = `1.0.0-${Date.now()}`;
            tags = ['main'];
        }
    }

    return {
        ...brokerConfig,
        providerBaseUrl: getProviderBaseUrl(),
        providerVersion: version,
        providerTags: tags,
        publishVerificationResult: true,
    };
}

