/**
 * User Role Validation Utilities
 * 
 * This file provides type-safe validation for user roles in the AMT Express application.
 * It ensures that only valid roles (admin, driver, customer) are accepted throughout the app.
 * 
 * Valid roles:
 * - 'admin': Full system access, manages drivers and rides
 * - 'driver': Can view and accept ride assignments
 * - 'customer': Can book rides
 */

import {SessionWithUser, UserRole, USER_ROLES} from "@/content/database_types";

/**
 * Type guard to check if a string is a valid UserRole
 * 
 * This function acts as a TypeScript type guard, narrowing the type from 'string'
 * to 'UserRole' if the validation passes. This provides type safety when working
 * with user roles from external sources (API, database, etc.).
 * 
 * @param role - The string to validate as a user role
 * @returns True if the role is valid ('admin', 'driver', or 'customer'), false otherwise
 * 
 * @example
 * const userInput = 'admin';
 * if (isValidUserRole(userInput)) {
 *   // TypeScript now knows userInput is UserRole, not just string
 *   console.log(userInput); // Type: UserRole
 * }
 */
export function isValidUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

/**
 * Extracts and validates the user role from a session object
 * 
 * Safely retrieves the user's role from a session, ensuring it's a valid UserRole.
 * Returns null if the session is invalid, the user doesn't exist, or the role is invalid.
 * 
 * @param session - The session object containing user information (can be null)
 * @returns The validated UserRole or null if validation fails
 * 
 * @example
 * const role = getValidatedRole(session);
 * if (role === 'admin') {
 *   // User has admin privileges
 * } else if (role === null) {
 *   // No valid session or role
 * }
 */
export function getValidatedRole(session: SessionWithUser | null): UserRole | null {
    if (!session?.user?.role) return null;
    return isValidUserRole(session.user.role) ? session.user.role : null;
}