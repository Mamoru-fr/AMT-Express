/**
 * Unit tests for AuthActions
 * 
 * Pure unit tests with ALL external dependencies mocked:
 * - No database calls
 * - No network calls
 * - Fast execution
 * - Isolated testing of business logic
 */

// ============================================================================
// ENVIRONMENT SETUP - MUST BE FIRST
// ============================================================================
vi.stubEnv('NODE_ENV', 'test');

// ============================================================================
// MOCKS - MUST BE DEFINED BEFORE ANY IMPORTS THAT USE THEM
// ============================================================================
import { vi } from 'vitest';

// ⚠️ CRITICAL: Mock better-auth's auth FIRST to prevent DB connection during import
vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      signInEmail: vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
      signUpEmail: vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
      signOut: vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    },
  },
}));

// Mock session
vi.mock('@/lib/auth/session', () => ({
  getSessionWithRole: vi.fn().mockResolvedValue({
    session: { user: { id: 'test-user', role: 'customer' } },
    user: { id: 'test-user', role: 'customer', email: 'test@test.com' },
    isAdmin: false,
    isDriver: false,
    isCustomer: true,
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
  redirect: (url: string) => { throw new Error(`Redirect to: ${url}`) },
  permanentRedirect: (url: string) => { throw new Error(`Permanent redirect to: ${url}`) },
  notFound: () => { throw new Error('Not Found') },
  useParams: () => ({}),
}));

// Mock AuthService (now safe because auth.ts is already mocked)
vi.mock('@/lib/services/AuthService', () => ({
  AuthService: {
    signin: vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    signup: vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    signout: vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
  },
}));

// Mock AuditService
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
// NOW SAFE TO IMPORT - All DB-dependent modules are mocked
// ============================================================================
import { describe, it, expect, beforeEach } from 'vitest';
import { signIn, signUp, signOut } from '@/lib/actions/AuthActions';

describe('AuthActions [UNIT]', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should return success for valid signup with mocked services', async () => {
      const result = await signUp('Test User', 'test@example.com', 'Password123!', 'Password123!', undefined);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return error for empty name', async () => {
      const result = await signUp('', 'test@example.com', 'Password123!', 'Password123!', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Name is required');
    });

    it('should return error for invalid email', async () => {
      const result = await signUp('Test User', 'invalid-email', 'Password123!', 'Password123!', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
    });

    it('should return error for short password', async () => {
      const result = await signUp('Test User', 'test@example.com', '123', '123', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Password must be at least 8 characters');
    });

    it('should return error for password mismatch', async () => {
      const result = await signUp('Test User', 'test@example.com', 'Password123!', 'Different123!', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Passwords do not match');
    });
  });

  describe('signIn', () => {
    it('should return success for valid signin with mocked services', async () => {
      const result = await signIn('test@example.com', 'Password123!', undefined);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return error for empty email', async () => {
      const result = await signIn('', 'Password123!', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email is required');
    });

    it('should return error for empty password', async () => {
      const result = await signIn('test@example.com', '', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Password is required');
    });

    it('should return error for invalid email format', async () => {
      const result = await signIn('invalid-email', 'Password123!', undefined);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
    });
  });

  describe('signOut', () => {
    it('should handle logout with mocked services', async () => {
      const result = await signOut();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
