'use server'

import {AuthController} from '@/lib/controllers/AuthController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {validateSignIn, validateSignUp} from '@/lib/validations/auth';

/**
 * Auth Actions - Server Actions sécurisées
 * - Valide les inputs avec Zod
 * - Délègue au AuthController
 */

/**
 * Sign in a user with email and password
 * @param email - User email
 * @param password - User password
 * @returns ActionResponse with session data or error
 */
export async function signIn(email: string, password: string): Promise<ActionResponse<void>> {
  // Validate input first
  const validation = validateSignIn({ email, password });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return AuthController.signIn(validation.data.email, validation.data.password);
}

/**
 * Register a new user
 * @param name - User's full name
 * @param email - User email
 * @param password - User password
 * @param confirmPassword - Password confirmation
 * @returns ActionResponse with new user data or error
 */
export async function signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
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

/**
 * Request a password reset email (forgot password flow)
 * @param email - User email
 */
export async function requestPasswordReset(email: string): Promise<ActionResponse<void>> {
  if (!email?.trim()) {
    return {
      success: false,
      error: 'errors.emailRequired',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return AuthController.forgotPassword(email.trim());
}

/**
 * Reset the password using the token received by email
 * @param token - Reset token from the email link
 * @param newPassword - New password
 * @param confirmPassword - New password confirmation
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResponse<void>> {
  return AuthController.resetPassword(token, newPassword, confirmPassword);
}
