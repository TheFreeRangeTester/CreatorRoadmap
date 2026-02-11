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

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export const testPool = new Pool({ connectionString: process.env.DATABASE_URL });
testPool.on('connect', (client) => {
  client.query('SET search_path TO testing, public');
});
export const testDb = drizzle(testPool, { schema });

console.log('[DB] Dual pool setup: production (public) + testing (testing schema)');
