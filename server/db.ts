import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isTestingEnv = process.env.NODE_ENV === 'development' || process.env.STRIPE_TEST_MODE === 'true';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

if (isTestingEnv) {
  pool.on('connect', (client) => {
    client.query('SET search_path TO testing, public');
  });
  console.log('[DB] Using TESTING schema (isolated test environment)');
} else {
  console.log('[DB] Using PRODUCTION schema');
}

export const db = drizzle(pool, { schema });
