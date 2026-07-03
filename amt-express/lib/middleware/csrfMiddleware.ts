/**
 * CSRF Protection Middleware
 * 
 * This module provides CSRF protection for Server Actions using the Synchronizer Token Pattern.
 * - Generates a CSRF token and stores its hash in an HTTP-only cookie
 * - Validates the token on form submission
 * - Tokens are single-use to prevent replay attacks
 * 
 * Note: All functions are async because they need to access cookies from 'next/headers'
 * which returns a Promise in Next.js 16 Server Components and Server Actions.
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Generate a SHA-256 hash of a CSRF token
 * @param token - The plaintext CSRF token
 * @returns The SHA-256 hash of the token
 */
function generateCsrfTokenHash(token: string): string {
  const secret = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Generate a random CSRF token and store its hash in a secure cookie
 * @returns Promise resolving to the plaintext token to include in forms
 */
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = generateCsrfTokenHash(token);
  
  // Store the hash in a secure, HTTP-only cookie
  (await cookies()).set('csrf_token_hash', hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  
  return token;
}

/**
 * Validate a CSRF token against the stored hash
 * @param token - The plaintext CSRF token to validate
 * @returns Promise resolving to {success: boolean, error?: string}
 */
export async function validateCsrfToken(token?: string): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'CSRF token is required' };
  }

  const cookieStore = await cookies();
  const storedHash = cookieStore.get('csrf_token_hash')?.value;
  
  if (!storedHash) {
    return { success: false, error: 'CSRF token expired or not generated' };
  }

  const tokenHash = generateCsrfTokenHash(token);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );

  if (!isValid) {
    return { success: false, error: 'Invalid CSRF token' };
  }

  // Invalidate the token after use (optional: prevents replay attacks)
  cookieStore.set('csrf_token_hash', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return { success: true };
}

/**
 * Clear the CSRF token cookie
 * @returns Promise
 */
export async function clearCsrfToken(): Promise<void> {
  (await cookies()).delete('csrf_token_hash');
}

/**
 * Get the current CSRF token hash from cookies (for debugging only)
 * @returns Promise resolving to the stored hash or null
 */
export async function getCsrfTokenHash(): Promise<string | null> {
  return (await cookies()).get('csrf_token_hash')?.value ?? null;
}
