import { z } from 'zod';

export const CreateRideSchema = z.object({
  departure: z.string().min(3, "Departure must be at least 3 characters"),
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  departureTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Departure time must be in the future"
  }),
  customerIds: z.array(z.string()).nonempty("At least one customer is required"),
  price: z.string().optional(),
  driverId: z.string().optional(),
  status: z.enum(['pending', 'assigned', 'completed', 'cancelled']).optional(),
});

export const UpdateRideDetailsSchema = z.object({
  rideId: z.number().int().positive(),
  departure: z.string().min(3).optional(),
  destination: z.string().min(3).optional(),
  departureTime: z.coerce.date().optional(),
  price: z.string().optional(),
  status: z.enum(['pending', 'assigned', 'completed', 'cancelled']).optional(),
  customerNotes: z.string().optional(),
});

export const AssignDriverSchema = z.object({
  rideId: z.number().int().positive(),
  driverId: z.string().min(1, "Driver ID is required"),
});

export const RideIdSchema = z.object({
  rideId: z.number().int().positive(),
});

export const RideFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'assigned', 'completed', 'cancelled', 'all']).optional(),
  sortBy: z.enum(['departureTime', 'clients', 'departure', 'destination', 'driver', 'price', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});
