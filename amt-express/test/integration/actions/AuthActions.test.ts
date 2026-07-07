/**
 * Integration tests for AuthActions
 * REAL integration tests - no mocks, uses actual better-auth and PostgreSQL
 */

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================
vi.stubEnv('NODE_ENV', 'test');

// ============================================================================
// MOCKS FOR NEXT.JS SPECIFICS ONLY (not auth related)
// We only mock Next.js specific things that don't exist in test environment
// ============================================================================
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

// Mock next/headers - required by AuthController
vi.mock('next/headers', () => ({
  headers: () => ({
    get: (name: string) => {
      if (name === 'cookie') return 'session=test';
      return null;
    },
    set: () => {},
    has: () => false,
    delete: () => {},
    entries: () => [],
    forEach: () => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [],
  }),
  cookies: () => ({
    get: (name: string) => {
      if (name === 'session') return { value: 'test-session', name: 'session' };
      return null;
    },
    set: () => {},
    has: () => false,
    delete: () => {},
    entries: () => [],
    forEach: () => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [],
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
    has: () => false,
    entries: () => [],
    forEach: () => {},
    keys: () => [],
    values: () => [],
    toString: () => '',
    [Symbol.iterator]: () => [],
  }),
  usePathname: () => '/',
  redirect: (url: string) => { throw new Error(`Redirect to: ${url}`); },
  permanentRedirect: (url: string) => { throw new Error(`Permanent redirect to: ${url}`); },
  notFound: () => { throw new Error('Not Found'); },
  useParams: () => ({}),
}));

// ============================================================================
// IMPORT REAL MODULES - NO MOCKS FOR AUTH
// ============================================================================
import db from '@/lib/db/drizzle';
import { users, account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signIn, signUp, signOut } from '@/lib/actions/AuthActions';
import { ErrorCodes } from '@/lib/types/action-response';
import type { ActionResponse } from '@/lib/types/action-response';

// ============================================================================
// HELPERS
// ============================================================================

function isErrorResponse<T>(response: ActionResponse<T>): response is { success: false; error: string; code?: string } {
  return !response.success;
}

function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@integration.com`;
}

// Cleanup ALL test users from the database
async function cleanupTestUsers(): Promise<void> {
  try {
    // Delete in reverse order to respect foreign key constraints
    // First delete accounts that reference our test users
    await db.delete(account)
      .where(eq(account.providerId, 'email'))
      .catch(() => {});
    
    // Then delete test users
    await db.delete(users)
      .where(or(
        ilike(users.email, '%@integration.com'),
        ilike(users.email, 'test-%')
      ))
      .catch(() => {});
    
    console.log('✅ Test user cleanup completed');
  } catch (error) {
    console.warn('⚠️ Cleanup failed (non-critical):', error);
  }
}

// Import or for cleanup
import { or, ilike } from 'drizzle-orm';

// ============================================================================
// TESTS - REAL INTEGRATION WITH BETTER-AUTH AND POSTGRESQL
// ============================================================================

describe('AuthActions [REAL INTEGRATION]', () => {
  // Cleanup database before and after tests
  beforeAll(async () => {
    await cleanupTestUsers();
  }, 60000);

  afterAll(async () => {
    await cleanupTestUsers();
  }, 60000);

  describe('signUp', () => {
    it('should register a new user with valid credentials and persist to database', async () => {
      const email = generateUniqueEmail('signup');
      const password = 'Password123!';
      
      const result = await signUp('Test User', email, password, password, undefined);
      
      expect(result.success).toBe(true);
      
      // Verify user was actually created in the database
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      expect(user.length).toBe(1);
      expect(user[0].email).toBe(email);
      expect(user[0].name).toBe('Test User');
      expect(user[0].role).toBe('customer');
    }, 30000);

    it('should reject duplicate email registration', async () => {
      const email = generateUniqueEmail('duplicate');
      const password = 'Password123!';
      
      // First registration should succeed
      const result1 = await signUp('User 1', email, password, password, undefined);
      expect(result1.success).toBe(true);
      
      // Second registration with same email should fail
      const result2 = await signUp('User 2', email, password, password, undefined);
      
      expect(result2.success).toBe(false);
      if (isErrorResponse(result2)) {
        expect(result2.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    }, 30000);

    it('should validate password requirements at action level', async () => {
      // Test weak password - should fail at validation level
      const email1 = generateUniqueEmail('weak');
      const result1 = await signUp('Test User', email1, '123', '123', undefined);
      expect(result1.success).toBe(false);
      if (isErrorResponse(result1)) {
        expect(result1.error).toContain('Password must be at least 8 characters');
      }
      
      // Test password mismatch - also fails at validation level
      const email2 = generateUniqueEmail('mismatch');
      const result2 = await signUp('Test User', email2, 'Password123!', 'Different123!', undefined);
      expect(result2.success).toBe(false);
      if (isErrorResponse(result2)) {
        expect(result2.error).toContain('Passwords do not match');
      }
    }, 10000);
  });

  describe('signIn', () => {
    it('should authenticate with valid credentials using real better-auth', async () => {
      const email = generateUniqueEmail('login');
      const password = 'Password123!';
      
      // Create user first
      const signupResult = await signUp('Test User', email, password, password, undefined);
      expect(signupResult.success).toBe(true);
      
      // Then sign in - this uses the real better-auth implementation
      const result = await signIn(email, password, undefined);
      
      expect(result.success).toBe(true);
    }, 30000);

    it('should reject invalid credentials for non-existent user', async () => {
      // Try to sign in with credentials that don't exist
      const result = await signIn('nonexistent-user@test.com', 'wrongpassword', undefined);
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
      }
    }, 30000);

    it('should validate input at action level', async () => {
      const result = await signIn('', '', undefined);
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    }, 10000);
  });

  describe('signOut', () => {
    it('should handle logout without errors', async () => {
      const result = await signOut();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    }, 10000);
  });
});
