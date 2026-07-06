import { z } from 'zod';

export const RequestRideAssignmentSchema = z.object({
  rideId: z.string().uuid(),
  message: z.string().optional(),
});

export const ToggleAvailabilitySchema = z.object({
  available: z.boolean(),
});

export const RideHistorySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
});
