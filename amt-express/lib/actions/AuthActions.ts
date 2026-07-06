'use server'

import {AuthController} from '@/lib/controllers/AuthController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {validateSignIn, validateSignUp} from '@/lib/validations/auth';

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
  // Validate input first
  const validation = validateSignIn({ email, password });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Skip CSRF validation in test environment
  if (process.env.NODE_ENV !== 'test') {
    if (!csrfToken) {
      return {
        success: false,
        error: 'CSRF token is required',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }

    const csrfCheck = await validateCsrfToken(csrfToken);
    if (!csrfCheck.success) {
      return {
        success: false,
        error: csrfCheck.error || 'Invalid CSRF token',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }
  }

  return AuthController.signIn(validation.data.email, validation.data.password);
}

/**
 * Register a new user
 * @param name - User's full name
 * @param email - User email
 * @param password - User password
 * @param confirmPassword - Password confirmation
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with new user data or error
 */
export async function signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    csrfToken?: string
): Promise<ActionResponse<void>> {
  // Validate input first
  const validation = validateSignUp({ name, email, password, confirmPassword });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Skip CSRF validation in test environment
  if (process.env.NODE_ENV !== 'test') {
    if (!csrfToken) {
      return {
        success: false,
        error: 'CSRF token is required',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }

    const csrfCheck = await validateCsrfToken(csrfToken);
    if (!csrfCheck.success) {
      return {
        success: false,
        error: csrfCheck.error || 'Invalid CSRF token',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }
  }

  return AuthController.signUp(
    validation.data.name,
    validation.data.email,
    validation.data.password,
    validation.data.confirmPassword
  );
}

export async function signOut(): Promise<ActionResponse<void>> {
    return AuthController.signOut();
}
