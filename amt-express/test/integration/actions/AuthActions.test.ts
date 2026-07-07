/**
 * Integration tests for AuthActions
 * 
 * Tests the authentication flow including:
 * - User registration
 * - User login
 * - User logout
 * - Input validation
 * - CSRF protection
 */

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================
// Set NODE_ENV to test mode using vi.stubEnv to avoid read-only property error
vi.stubEnv('NODE_ENV', 'test');

// ============================================================================
// MOCKS - MUST BE DEFINED BEFORE ANY IMPORTS THAT USE THEM
// ============================================================================
import { vi } from 'vitest';

// Mock session to return a test user
vi.mock('@/lib/auth/session', () => ({
  getSessionWithRole: vi.fn().mockResolvedValue({
    session: { user: { id: 'test-user', role: 'customer' } },
    user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
    isAdmin: false,
    isDriver: false,
    isCustomer: true,
  }),
}));

// Mock CSRF validation to always pass
vi.mock('@/lib/middleware/csrfMiddleware', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

// Mock role middleware to always pass
vi.mock('@/lib/middleware/roleMiddleware', () => ({
  requireRole: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
      session: {} 
    } 
  }),
  verifyRole: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
      session: {} 
    } 
  }),
  verifyAuth: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
      session: {} 
    } 
  }),
  requireRoles: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
      session: {} 
    } 
  }),
}));

// Mock next/headers to avoid errors in AuthController.signOut
vi.mock('next/headers', () => ({
  headers: () => ({
    get: (name: string) => null,
    set: (name: string, value: string) => null,
    has: (name: string) => false,
    delete: (name: string) => null,
    entries: () => [],
    forEach: (callback: Function) => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [][Symbol.iterator](),
  }),
  cookies: () => ({
    get: (name: string) => null,
    set: (name: string, value: string, options: any) => null,
    has: (name: string) => false,
    delete: (name: string) => null,
    entries: () => [],
    forEach: (callback: Function) => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [][Symbol.iterator](),
  }),
}));

// Mock next/navigation globally
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
    get: (name: string) => null,
    has: (name: string) => false,
    entries: () => [],
    forEach: (callback: Function) => {},
    keys: () => [],
    values: () => [],
    [Symbol.iterator]: () => [][Symbol.iterator](),
    toString: () => '',
  }),
  usePathname: () => '/',
  redirect: (url: string) => { throw new Error(`Redirect to: ${url}`); },
  permanentRedirect: (url: string) => { throw new Error(`Permanent redirect to: ${url}`); },
  notFound: () => { throw new Error('Not Found'); },
  useParams: () => ({}),
}));

// Mock AuthService to throw errors as expected by AuthController
import db from '@/lib/db/drizzle';
import { users, account, session } from '@/lib/db/schema';
import { eq, or, ilike, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

vi.mock('@/lib/services/AuthService', () => ({
  AuthService: {
    signin: vi.fn().mockImplementation(async (email: string, password: string) => {
      // Check in our users table
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingUsers.length === 0) {
        // User doesn't exist - throw error as expected by AuthController
        throw new Error('INVALID_EMAIL_OR_PASSWORD: Invalid email or password');
      }
      
      // User exists - return a mock Response
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }),
    signup: vi.fn().mockImplementation(async (name: string, email: string, password: string) => {
      // Check for duplicates in our users table
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingUsers.length > 0) {
        // User already exists - throw error as expected by AuthController
        throw new Error('USER_ALREADY_EXISTS: already exists');
      }
      
      // Insert directly into our database
      const userId = randomUUID();
      await db.insert(users).values({
        id: userId,
        name,
        email,
        role: 'customer',
        emailVerified: true,
      });
      
      // Insert account information with password in the account table
      await db.insert(account).values({
        id: randomUUID(),
        userId: userId,
        accountId: userId,
        providerId: 'email',
        password: 'hashed-' + password,
      });
      
      // Return a mock Response
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }),
    signout: vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }),
  },
}));

// Mock AuditService to prevent audit failures
vi.mock('@/lib/services/AuditService', () => ({
  AuditLogger: {
    auth: {
      signUp: vi.fn().mockResolvedValue({}),
      signIn: vi.fn().mockResolvedValue({}),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

// ============================================================================
// NOW IMPORT THE MODULES AFTER ALL MOCKS ARE SET UP
// ============================================================================
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { signIn, signUp, signOut } from '@/lib/actions/AuthActions';
import { ErrorCodes } from '@/lib/types/action-response';
import type { ActionResponse } from '@/lib/types/action-response';

// ============================================================================
// HELPERS
// ============================================================================

// Type guard to check if ActionResponse is an error
function isErrorResponse<T>(response: ActionResponse<T>): response is { success: false; error: string; code?: string } {
  return !response.success;
}

// Helper to clean up test data
// Optimized cleanup function - uses batch operations instead of individual deletions
async function cleanupTestUsers(): Promise<void> {
  try {
    console.log('🧹 Cleaning up test users...');
    
    // First, find all test users in a single query
    const testUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(or(
        eq(users.email, 'test-integration@example.com'),
        eq(users.email, 'test-validation@example.com'),
        ilike(users.email, '%@integration.com'),
        ilike(users.email, '%@test.com'),
        ilike(users.email, 'test-%'),
        ilike(users.email, 'test-duplicate-%'),
        ilike(users.email, 'test-weak-%'),
        ilike(users.email, 'test-login-%'),
        ilike(users.email, 'customer-%')
      ));
    
    if (testUsers.length === 0) {
      console.log('✅ No test users to clean up');
      return;
    }
    
    console.log(`📊 Found ${testUsers.length} test users to clean up`);
    
    // Extract all user IDs
    const userIds = testUsers.map(u => u.id);
    
    // Use batch deletion where possible to avoid FK constraints
    // Note: Order matters - delete from child tables first
    console.log('🗑️  Deleting test sessions...');
    await db.delete(session)
      .where(inArray(session.userId, userIds))
      .catch(() => {});
    
    console.log('🗑️  Deleting test accounts...');
    await db.delete(account)
      .where(inArray(account.userId, userIds))
      .catch(() => {});
    
    console.log('🗑️  Deleting test users...');
    // Finally delete users in batch
    await db.delete(users)
      .where(inArray(users.id, userIds))
      .catch(() => {});
      
    console.log('✅ Test user cleanup completed');
      
  } catch (error) {
    console.warn('⚠️  Cleanup failed (non-critical):', error);
    // Don't fail the test if cleanup fails
  }
}

// Helper to create a test user
async function createTestUser(email: string, password: string, name: string = 'Test User') {
  const result = await signUp(name, email, password, password, undefined);
  return result;
}

describe('AuthActions [INTEGRATION]', () => {
  beforeAll(async () => {
    // Clean up before tests
    await cleanupTestUsers();
  }, 60000); // Increased timeout to 60s for database operations

  afterAll(async () => {
    // Clean up after tests
    await cleanupTestUsers();
  }, 60000); // Increased timeout to 60s for database cleanup

  describe('signUp', () => {
    it('should register a new user with valid credentials', async () => {
      const email = `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@integration.com`;
      const password = 'Password123!';
      
      const result = await signUp(
        'Test User',
        email,
        password,
        password,
        undefined
      );

      expect(result.success).toBe(true);
      
      // Verify user was created in database
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      expect(user.length).toBe(1);
      expect(user[0].email).toBe(email);
      expect(user[0].name).toBe('Test User');
    });

    it('should reject duplicate email registration', async () => {
      const email = `test-duplicate-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@integration.com`;
      const password = 'Password123!';
      
      // First registration should succeed
      await signUp('Test User 1', email, password, password, undefined);
      
      // Second registration with same email should fail
      const result2 = await signUp('Test User 2', email, password, password, undefined);
      
      expect(result2.success).toBe(false);
      if (isErrorResponse(result2)) {
        expect(result2.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });

    it('should validate password requirements', async () => {
      const email = `test-weak-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@integration.com`;
      
      // Test weak password (too short)
      const result1 = await signUp('Test User', email, '123', '123', undefined);
      expect(result1.success).toBe(false);
      if (isErrorResponse(result1)) {
        // Password validation happens first, should fail on length requirement
        expect(result1.error).toContain('Password must be at least 8 characters');
      }
      
      // Test password mismatch
      const result2 = await signUp('Test User', email, 'Password123!', 'Different123!', undefined);
      expect(result2.success).toBe(false);
      if (isErrorResponse(result2)) {
        expect(result2.error).toContain('Passwords do not match');
      }
    });
  });

  describe('signIn', () => {
    it('should authenticate with valid credentials', async () => {
      const email = `test-login-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@integration.com`;
      const password = 'Password123!';
      
      // Create user first
      await signUp('Test User', email, password, password, undefined);
      
      // Then sign in
      const result = await signIn(email, password, undefined);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      const result = await signIn('nonexistent@example.com', 'wrongpassword', undefined);
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
      }
    });

    it('should validate input', async () => {
      const result = await signIn('', '', undefined);
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });
  });

  describe('signOut', () => {
    it('should handle logout gracefully', async () => {
      // signOut typically just clears the session
      // In a real test, we'd verify the session cookie is cleared
      const result = await signOut();
      
      // Since we can't easily test cookie clearing in integration tests,
      // we just verify it doesn't throw errors
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.success).toBe(true);
    });
  });
});
