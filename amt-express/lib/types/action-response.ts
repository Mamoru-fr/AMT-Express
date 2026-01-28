/**
 * Standard response type for all Server Actions
 * Ensures consistent error handling across the application
 */
export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: unknown };

/**
 * Error codes for programmatic error handling
 */
export const ErrorCodes = {
  // Ride errors
  RIDE_NOT_FOUND: 'RIDE_NOT_FOUND',
  RIDE_NOT_AVAILABLE: 'RIDE_NOT_AVAILABLE',
  RIDE_ALREADY_ASSIGNED: 'RIDE_ALREADY_ASSIGNED',
  
  // Driver errors
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  DRIVER_NOT_AVAILABLE: 'DRIVER_NOT_AVAILABLE',
  MAX_REQUESTS_EXCEEDED: 'MAX_REQUESTS_EXCEEDED',
  
  // Customer errors
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  
  // Assignment errors
  ASSIGNMENT_ERROR: 'ASSIGNMENT_ERROR',
  ASSIGNMENT_REQUEST_NOT_FOUND: 'ASSIGNMENT_REQUEST_NOT_FOUND',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
