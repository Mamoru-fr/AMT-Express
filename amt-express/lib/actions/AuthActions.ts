'use server'

import {AuthController} from '@/lib/controllers/AuthController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {requireAuth} from '@/lib/auth/session';
import {validateSignIn, validateSignUp, SignInInput, SignUpInput} from '@/lib/validations/auth';

/**
 * Auth Actions - Server Actions sécurisées
 * - Valide les inputs avec Zod
 * - Vérifie le token CSRF
 * - Délègue au AuthController
 */

/**
 * Sign in a user with email and password
 * @param email - User email
 * @param password - User password
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with session data or error
 */
export async function signIn(email: string, password: string, csrfToken?: string): Promise<ActionResponse<void>> {
  // Validate CSRF token if provided
  if (csrfToken) {
    const csrfCheck = await validateCsrfToken(csrfToken);
    if (!csrfCheck.success) {
      return {
        success: false,
        error: csrfCheck.error || 'Invalid CSRF token',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }
  }

  // Validate input
  const validation = validateSignIn({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return AuthController.signIn(validation.data!.email, validation.data! // @ts-ignore.password) as any;
}

/**
 * Register a new user
 * @param name - User's full name
 * @param email - User email
 * @param password - User password
 * @param confirmPassword - Password confirmation
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with new user data or error
 * @note Only admin users can create new users
 */
export async function signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    csrfToken?: string
): Promise<ActionResponse<void>> {
  // Validate CSRF token if provided
  if (csrfToken) {
    const csrfCheck = await validateCsrfToken(csrfToken);
    if (!csrfCheck.success) {
      return {
        success: false,
        error: csrfCheck.error || 'Invalid CSRF token',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }
  }

  // Validate input
  const validation = validateSignUp({ name, email, password, confirmPassword });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Check if user is admin (only admins can create new users in this system)
  try {
    await requireAuth();
    // If requireAuth succeeds, we have a session, but we need to check if it's admin
    // The controller will handle the role check
  } catch {
    // No session - for public signup, this is allowed
    // The controller will handle whether public signup is enabled
  }

  return AuthController.signUp(
    validation.data! // @ts-ignore.name,
    validation.data! // @ts-ignore.email,
    validation.data! // @ts-ignore.password,
    validation.data! // @ts-ignore.confirmPassword
  );
}

/**
 * Sign out the current user
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function signOut(csrfToken?: string): Promise<ActionResponse<void>> {
  // Validate CSRF token if provided
  if (csrfToken) {
    const csrfCheck = await validateCsrfToken(csrfToken);
    if (!csrfCheck.success) {
      return {
        success: false,
        error: csrfCheck.error || 'Invalid CSRF token',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }
  }

  return AuthController.signOut();
}
