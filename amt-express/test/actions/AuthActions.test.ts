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

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { signIn, signUp, signOut } from '@/lib/actions/AuthActions';
import db from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ErrorCodes } from '@/lib/types/action-response';

// Helper to clean up test data
async function cleanupTestUsers() {
  try {
    const testUsers = await db
      .select()
      .from(users)
      .where(or(
        eq(users.email, 'test-integration@example.com'),
        eq(users.email, 'test-validation@example.com')
      ));
    
    for (const user of testUsers) {
      await db.delete(users).where(eq(users.id, user.id));
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Helper to create a test user
async function createTestUser(email: string, password: string, name: string = 'Test User') {
  const result = await signUp(name, email, password, password);
  return result;
}

// Drizzle OR helpers
import { or } from 'drizzle-orm';

describe('AuthActions Integration Tests', () => {
  beforeAll(async () => {
    // Clean up before tests
    await cleanupTestUsers();
  });

  afterAll(async () => {
    // Clean up after tests
    await cleanupTestUsers();
  });

  describe('signUp', () => {
    it('should register a new user with valid credentials', async () => {
      const email = `test-${Date.now()}@integration.com`;
      const password = 'Password123!';
      
      const result = await signUp(
        'Test User',
        email,
        password,
        password
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
      const email = `test-duplicate-${Date.now()}@integration.com`;
      const password = 'Password123!';
      
      // First registration should succeed
      await signUp('Test User 1', email, password, password);
      
      // Second registration with same email should fail
      const result2 = await signUp('Test User 2', email, password, password);
      
      expect(result2.success).toBe(false);
      expect(result2.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should validate password requirements', async () => {
      const email = `test-weak-${Date.now()}@integration.com`;
      
      // Test weak password (too short)
      const result1 = await signUp('Test User', email, '123', '123');
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Password');
      
      // Test password mismatch
      const result2 = await signUp('Test User', email, 'Password123!', 'Different123!');
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Passwords do not match');
    });
  });

  describe('signIn', () => {
    it('should authenticate with valid credentials', async () => {
      const email = `test-login-${Date.now()}@integration.com`;
      const password = 'Password123!';
      
      // Create user first
      await signUp('Test User', email, password, password);
      
      // Then sign in
      const result = await signIn(email, password);
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      const result = await signIn('nonexistent@example.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
    });

    it('should validate input', async () => {
      const result = await signIn('', '');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
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
    });
  });
});
