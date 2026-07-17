import { z } from 'zod';

// ============================================
// Ride ID Schema
// ============================================

export const RideIdSchema = z.object({
  rideId: z.string().uuid('Ride ID must be a valid UUID'),
});

// ============================================
// Create Ride Schema
// ============================================

export const CreateRideSchema = z.object({
  departureTime: z
    .date()
    .or(z.string().transform((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date format',
        });
        return z.NEVER;
      }
      return date;
    }))
    .refine((date) => date >= new Date(), {
      message: 'Departure time must be in the future',
    }),
  customerIds: z
    .array(z.string().uuid('Customer ID must be a valid UUID'))
    .min(1, 'At least one customer is required'),
  departure: z
    .string()
    .min(3, 'Departure must be at least 3 characters')
    .max(255, 'Departure must be less than 255 characters'),
  destination: z
    .string()
    .min(3, 'Destination must be at least 3 characters')
    .max(255, 'Destination must be less than 255 characters'),
  driverId: z
    .string()
    .uuid('Driver ID must be a valid UUID')
    .optional(),
  price: z
    .union([
      z.string().regex(/^\d+(\.\d{1,2})?( €)?$/, 'Price must be a valid number with up to 2 decimal places'),
      z.number().positive('Price must be a positive number')
    ])
    .transform((val) => typeof val === 'string' ? val.replace(' €', '').trim() : val.toString())
    .optional(),
  driverPrice: z
    .union([
      z.string().regex(/^\d+(\.\d{1,2})?( €)?$/, 'Driver price must be a valid number with up to 2 decimal places'),
      z.number().positive('Driver price must be a positive number')
    ])
    .transform((val) => typeof val === 'string' ? val.replace(' €', '').trim() : val.toString())
    .optional(),
  status: z
    .enum(['pending', 'assigned', 'completed', 'cancelled'])
    .default('pending'),
});

// ============================================
// Update Ride Schema
// ============================================

export const UpdateRideDetailsSchema = z.object({
  rideId: z.string().uuid('Ride ID must be a valid UUID'),
  departure: z
    .string()
    .min(3, 'Departure must be at least 3 characters')
    .max(255, 'Departure must be less than 255 characters')
    .optional(),
  destination: z
    .string()
    .min(3, 'Destination must be at least 3 characters')
    .max(255, 'Destination must be less than 255 characters')
    .optional(),
  departureTime: z
    .date()
    .or(z.string().transform((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid date format',
        });
        return z.NEVER;
      }
      return date;
    }))
    .optional(),
  price: z
    .union([
      z.string().regex(/^\d+(\.\d{1,2})?( €)?$/, 'Price must be a valid number with up to 2 decimal places'),
      z.number().positive('Price must be a positive number')
    ])
    .transform((val) => typeof val === 'string' ? val.replace(' €', '').trim() : val.toString())
    .optional(),
  status: z
    .enum(['pending', 'assigned', 'completed', 'cancelled'])
    .optional(),
  customerNotes: z
    .string()
    .max(2000, 'Customer notes must be less than 2000 characters')
    .optional(),
});

// ============================================
// Assign Driver Schema
// ============================================

export const AssignDriverSchema = z.object({
  rideId: z.string().uuid('Ride ID must be a valid UUID'),
  driverId: z.string().uuid('Driver ID must be a valid UUID'),
});

// ============================================
// Delete Ride Schema
// ============================================

export const DeleteRideSchema = z.object({
  rideId: z.string().uuid('Ride ID must be a valid UUID'),
});

// ============================================
// Ride Filters Schema
// ============================================

export const RideFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  status: z.union([
    z.enum(['pending', 'assigned', 'completed', 'cancelled']),
    z.array(z.enum(['pending', 'assigned', 'completed', 'cancelled'])),
    z.literal('all'),
  ]).optional(),
  sortBy: z.enum(['departureTime', 'clients', 'departure', 'destination', 'driver', 'price', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ============================================
// Request Ride Assignment Schema
// ============================================

export const RequestRideAssignmentSchema = z.object({
  rideId: z.string().uuid('Ride ID must be a valid UUID'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// ============================================
// Toggle Driver Availability Schema
// ============================================

export const ToggleDriverAvailabilitySchema = z.object({
  available: z.boolean(),
});

// ============================================
// Types
// ============================================

export type RideIdInput = z.infer<typeof RideIdSchema>;
export type CreateRideInput = z.infer<typeof CreateRideSchema>;
export type UpdateRideDetailsInput = z.infer<typeof UpdateRideDetailsSchema>;
export type AssignDriverInput = z.infer<typeof AssignDriverSchema>;
export type DeleteRideInput = z.infer<typeof DeleteRideSchema>;
export type RideFiltersInput = z.infer<typeof RideFiltersSchema>;
export type RequestRideAssignmentInput = z.infer<typeof RequestRideAssignmentSchema>;
export type ToggleDriverAvailabilityInput = z.infer<typeof ToggleDriverAvailabilitySchema>;

// ============================================
// Validation Functions
// ============================================

/**
 * Validate ride ID input
 */
export function validateRideId(input: unknown): { success: boolean; data?: RideIdInput; error?: string } {
  const result = RideIdSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map(e => e.message).join(', '),
  };
}

/**
 * Validate create ride input
 */
export function validateCreateRide(input: unknown): { success: boolean; data?: CreateRideInput; error?: string } {
  const result = CreateRideSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map(e => e.message).join(', '),
  };
}

/**
 * Validate update ride input
 */
export function validateUpdateRide(input: unknown): { success: boolean; data?: UpdateRideDetailsInput; error?: string } {
  const result = UpdateRideDetailsSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map(e => e.message).join(', '),
  };
}

/**
 * Validate assign driver input
 */
export function validateAssignDriver(input: unknown): { success: boolean; data?: AssignDriverInput; error?: string } {
  const result = AssignDriverSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map(e => e.message).join(', '),
  };
}

/**
 * Validate ride filters input
 */
export function validateRideFilters(input: unknown): { success: boolean; data?: RideFiltersInput; error?: string } {
  const result = RideFiltersSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map(e => e.message).join(', '),
  };
}

/**
 * Validate toggle driver availability input
 */
export function validateToggleDriverAvailability(input: unknown): { success: boolean; data?: ToggleDriverAvailabilityInput; error?: string } {
  const result = ToggleDriverAvailabilitySchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map(e => e.message).join(', '),
  };
}
