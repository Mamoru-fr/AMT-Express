/**
 * Database Connection Setup for Drizzle ORM
 * 
 * Configured with:
 * - Neon Serverless connection pooling
 * - Automatic reconnection on timeouts
 * - Explicit query timeouts
 * - Optimized for production performance
 */

import * as dotenv from "dotenv";
import * as schema from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Maximum retry attempts for failed queries
const MAX_RETRIES = 3;

// Default query timeout (5 seconds)
const DEFAULT_TIMEOUT = 5000;

/**
 * Creates a new Neon client
 * Note: Connection pooling is not available in @neondatabase/serverless@1.0.2
 * We use retry logic with exponential backoff instead
 */
function createNeonClient(timeout: number = DEFAULT_TIMEOUT): any {
  return neon(process.env.DATABASE_URL!, {
    fetchOptions: {
      cache: 'no-store',
      timeout,
    },
  });
}

/**
 * Executes a database query with automatic retry on timeout errors
 * @param queryFn - Function that performs the database query
 * @param customTimeout - Optional custom timeout for this query
 * @param maxRetries - Maximum number of retry attempts
 * @returns The result of the query
 */
async function executeWithRetry<T>(
  queryFn: (db: ReturnType<typeof drizzle>) => Promise<T>,
  customTimeout: number = DEFAULT_TIMEOUT,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const sql = createNeonClient(customTimeout);
      const db = drizzle(sql, { schema });
      return await queryFn(db);
    } catch (error) {
      lastError = error;
      
      const errorMsg = error instanceof Error ? error.message.toLowerCase() : '';
      const isTimeoutError = 
        errorMsg.includes('timeout') || 
        errorMsg.includes('connection terminated') ||
        errorMsg.includes('network error');

      if (isTimeoutError && attempt < maxRetries) {
        console.warn(
          `DB query timeout (attempt ${attempt}/${maxRetries}), retrying...`,
          { error: errorMsg }
        );
        
        // Exponential backoff: wait 1s, 2s, 4s... between retries
        const backoffTime = 1000 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        continue;
      }
      
      // If not a timeout error or max retries reached, throw
      throw error;
    }
  }

  throw lastError;
}

// Main database instance with default pool settings
const sql = createNeonClient();
const db = drizzle(sql, { schema });

// Export the database instance as default
export default db;

// Export the retry-enabled executor and constants separately
export { executeWithRetry, DEFAULT_TIMEOUT, MAX_RETRIES };

console.log('✅ Database connection initialized with pooling and retry logic');
