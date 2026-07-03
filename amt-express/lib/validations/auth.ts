/**
 * Authentication Validation Schemas
 * 
 * Schemas for validating user input in authentication-related actions.
 * Uses Zod for type-safe validation.
 */

import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================
// Types
// ============================================

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate sign in input
 */
export function validateSignIn(input: unknown): { success: boolean; data?: SignInInput; error?: string } {
  const result = signInSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map(e => e.message).join(', '),
  };
}

/**
 * Validate sign up input
 */
export function validateSignUp(input: unknown): { success: boolean; data?: SignUpInput; error?: string } {
  const result = signUpSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map(e => e.message).join(', '),
  };
}
