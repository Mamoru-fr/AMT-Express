/**
 * Integration tests for AuthActions
 * Tests with mocked AuthController to avoid better-auth initialization issues
 */

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================
vi.stubEnv('NODE_ENV', 'test');

// ============================================================================
// MOCKS - MUST BE DEFINED BEFORE ANY IMPORTS
// ============================================================================
import { vi } from 'vitest';

// 🔴 STEP 1: Mock better-auth to prevent initialization
vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: { signInEmail: vi.fn(), signUpEmail: vi.fn(), signOut: vi.fn() },
  },
}));

// Mock session
vi.mock('@/lib/auth/session', () => ({
  getSessionWithRole: vi.fn().mockResolvedValue({
    session: { user: { id: 'test-user', role: 'customer' } },
    user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
    isAdmin: false, isDriver: false, isCustomer: true,
  }),
}));

// Mock CSRF
vi.mock('@/lib/middleware/csrfMiddleware', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

// Mock role middleware
vi.mock('@/lib/middleware/roleMiddleware', () => ({
  requireRole: vi.fn().mockResolvedValue({ success: true, data: { user: { id: 'test-user', role: 'customer' }, session: {} } }),
  verifyRole: vi.fn().mockResolvedValue({ success: true, data: { user: { id: 'test-user', role: 'customer' }, session: {} } }),
  verifyAuth: vi.fn().mockResolvedValue({ success: true, data: { user: { id: 'test-user', role: 'customer' }, session: {} } }),
  requireRoles: vi.fn().mockResolvedValue({ success: true, data: { user: { id: 'test-user', role: 'customer' }, session: {} } }),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => ({ get: () => null, set: () => null, has: () => false, delete: () => null, entries: () => [], forEach: () => {}, keys: () => [], values: () => [] }),
  cookies: () => ({ get: () => null, set: () => null, has: () => false, delete: () => null, entries: () => [], forEach: () => {}, keys: () => [], values: () => [] }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: () => null, has: () => false, entries: () => [], forEach: () => {}, keys: () => [], values: () => [], toString: () => '' }),
  usePathname: () => '/',
  redirect: (url: string) => { throw new Error(`Redirect to: ${url}`); },
  permanentRedirect: (url: string) => { throw new Error(`Permanent redirect to: ${url}`); },
  notFound: () => { throw new Error('Not Found'); },
  useParams: () => ({}),
}));

// Mock AuditService
vi.mock('@/lib/services/AuditService', () => ({
  AuditLogger: {
    auth: { signUp: vi.fn().mockResolvedValue({}), signIn: vi.fn().mockResolvedValue({}), signOut: vi.fn().mockResolvedValue({}) },
  },
}));

// ============================================================================
// IMPORT DATABASE MODULES
// ============================================================================
import db from '@/lib/db/drizzle';
import { users, account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// 🔴 STEP 2: Mock AuthController BEFORE importing AuthActions
// This is closer to the action and more likely to work
const mockAuthController = vi.hoisted(() => ({
  AuthController: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));
vi.mock('@/lib/controllers/AuthController', () => mockAuthController);

// Configure the mocks after db is imported
beforeAll(() => {
  mockAuthController.AuthController.signUp = vi.fn().mockImplementation(async (name: string, email: string, password: string, confirmPassword: string) => {
    // Check for duplicates
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length > 0) {
      return { success: false, error: 'Email already in use', code: 'VALIDATION_ERROR' };
    }
    
    // Create user
    const userId = randomUUID();
    await db.insert(users).values({ id: userId, name, email, role: 'customer', emailVerified: true });
    await db.insert(account).values({ id: randomUUID(), userId, accountId: userId, providerId: 'email', password: 'hashed-' + password });
    
    return { success: true, data: undefined };
  });

  mockAuthController.AuthController.signIn = vi.fn().mockImplementation(async (email: string, password: string) => {
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length === 0) {
      return { success: false, error: 'Invalid email or password', code: 'UNAUTHORIZED' };
    }
    return { success: true, data: undefined };
  });

  mockAuthController.AuthController.signOut = vi.fn().mockImplementation(async () => {
    return { success: true, data: undefined };
  });
});

// ============================================================================
// NOW IMPORT THE MODULES TO TEST
// ============================================================================
import { describe, it, expect, beforeAll } from 'vitest';
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

// ============================================================================
// TESTS
// ============================================================================
describe('AuthActions [INTEGRATION - REAL DATABASE]', () => {
  describe('signUp', () => {
    it('should register a new user with valid credentials', async () => {
      const email = generateUniqueEmail('signup');
      const result = await signUp('Test User', email, 'Password123!', 'Password123!', undefined);
      expect(result.success).toBe(true);
      
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      expect(user.length).toBe(1);
      expect(user[0].email).toBe(email);
      expect(user[0].name).toBe('Test User');
    }, 30000);

    it('should reject duplicate email registration', async () => {
      const email = generateUniqueEmail('duplicate');
      const result1 = await signUp('User 1', email, 'Password123!', 'Password123!', undefined);
      expect(result1.success).toBe(true);
      
      const result2 = await signUp('User 2', email, 'Password123!', 'Password123!', undefined);
      expect(result2.success).toBe(false);
      if (isErrorResponse(result2)) {
        expect(result2.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    }, 30000);

    it('should validate password requirements', async () => {
      const email1 = generateUniqueEmail('weak');
      const result1 = await signUp('Test User', email1, '123', '123', undefined);
      expect(result1.success).toBe(false);
      if (isErrorResponse(result1)) {
        expect(result1.error).toContain('Password must be at least 8 characters');
      }
      
      const email2 = generateUniqueEmail('mismatch');
      const result2 = await signUp('Test User', email2, 'Password123!', 'Different123!', undefined);
      expect(result2.success).toBe(false);
      if (isErrorResponse(result2)) {
        expect(result2.error).toContain('Passwords do not match');
      }
    }, 10000);
  });

  describe('signIn', () => {
    it('should authenticate with valid credentials', async () => {
      const email = generateUniqueEmail('login');
      await signUp('Test User', email, 'Password123!', 'Password123!', undefined);
      const result = await signIn(email, 'Password123!', undefined);
      expect(result.success).toBe(true);
    }, 30000);

    it('should reject invalid credentials', async () => {
      const result = await signIn('nonexistent@example.com', 'wrongpassword', undefined);
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
      }
    }, 30000);

    it('should validate input', async () => {
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
