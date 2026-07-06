import { describe, it, expect } from 'vitest';
import {
    CreateRideSchema,
    UpdateRideDetailsSchema,
    AssignDriverSchema,
    RideIdSchema,
    RideFiltersSchema
} from '../lib/validations/ride';
import {
    RequestRideAssignmentSchema,
    ToggleAvailabilitySchema,
    RideHistorySchema
} from '../lib/validations/dashboard';
import { randomUUID } from 'crypto';

describe('Ride Validations - CreateRideSchema', () => {
    it('should validate valid ride creation data', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const validData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: [randomUUID(), randomUUID()],
            price: '100.00 €',
            driverId: randomUUID(),
            status: 'pending' as const
        };

        const result = CreateRideSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for departure with less than 3 characters', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidData = {
            departure: 'Pa',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: ['customer-1']
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for destination with less than 3 characters', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidData = {
            departure: 'Paris',
            destination: 'Ly',
            departureTime: futureDate,
            customerIds: ['customer-1']
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for past departure time', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const invalidData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: pastDate,
            customerIds: ['customer-1']
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for empty customerIds array', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: []
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for invalid customer UUID', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: ['invalid-uuid']
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for invalid driver UUID', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: [randomUUID()],
            driverId: 'invalid-uuid'
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should accept optional fields as undefined', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const minimalData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: [randomUUID()]
        };

        const result = CreateRideSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
    });

    it('should accept all valid status values', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const statuses = ['pending', 'assigned', 'completed', 'cancelled'] as const;
        
        statuses.forEach(status => {
            const data = {
                departure: 'Paris',
                destination: 'Lyon',
                departureTime: futureDate,
                customerIds: [randomUUID()],
                status
            };
            const result = CreateRideSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    it('should fail for invalid status value', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const invalidData = {
            departure: 'Paris',
            destination: 'Lyon',
            departureTime: futureDate,
            customerIds: [randomUUID()],
            status: 'invalid-status' as const
        };

        const result = CreateRideSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Ride Validations - UpdateRideDetailsSchema', () => {
    it('should validate valid update data', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const validData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000',
            departure: 'Paris Updated',
            destination: 'Lyon Updated',
            departureTime: futureDate,
            price: '150.00 €',
            status: 'assigned' as const,
            customerNotes: 'Updated notes'
        };

        const result = UpdateRideDetailsSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for invalid rideId (not a valid UUID)', () => {
        const invalidData = {
            rideId: 'invalid-uuid',
            departure: 'Paris'
        };

        const result = UpdateRideDetailsSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for rideId of 0', () => {
        const invalidData = {
            rideId: '0',
            departure: 'Paris'
        };

        const result = UpdateRideDetailsSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should accept partial update data', () => {
        const validData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000',
            departure: 'Paris Updated'
        };

        const result = UpdateRideDetailsSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for departure with less than 3 characters', () => {
        const invalidData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000',
            departure: 'Pa'
        };

        const result = UpdateRideDetailsSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Ride Validations - AssignDriverSchema', () => {
    it('should validate valid driver assignment', () => {
        const validData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000',
            driverId: '550e8400-e29b-41d4-a716-446655440001'
        };

        const result = AssignDriverSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for empty driverId', () => {
        const invalidData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000',
            driverId: ''
        };

        const result = AssignDriverSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for invalid rideId', () => {
        const invalidData = {
            rideId: 'invalid-uuid',
            driverId: 'driver-123'
        };

        const result = AssignDriverSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Ride Validations - RideIdSchema', () => {
    it('should validate valid rideId (UUID)', () => {
        const validData = { rideId: '550e8400-e29b-41d4-a716-446655440000' };
        const result = RideIdSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for invalid rideId (not a UUID)', () => {
        const invalidData = { rideId: 'invalid-uuid' };
        const result = RideIdSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for zero rideId', () => {
        const invalidData = { rideId: '0' };
        const result = RideIdSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for numeric rideId', () => {
        const invalidData = { rideId: '123.5' };
        const result = RideIdSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Ride Validations - RideFiltersSchema', () => {
    it('should validate empty filters', () => {
        const validData = {};
        const result = RideFiltersSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate all filter options', () => {
        const validData = {
            search: 'Paris to Lyon',
            status: 'pending' as const,
            sortBy: 'departureTime' as const,
            sortOrder: 'desc' as const,
            page: 1,
            limit: 20
        };

        const result = RideFiltersSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate all status filter values', () => {
        const statuses = ['pending', 'assigned', 'completed', 'cancelled', 'all'] as const;
        
        statuses.forEach(status => {
            const data = { status };
            const result = RideFiltersSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    it('should validate all sortBy values', () => {
        const sortByValues = ['departureTime', 'clients', 'departure', 'destination', 'driver', 'price', 'status'] as const;
        
        sortByValues.forEach(sortBy => {
            const data = { sortBy };
            const result = RideFiltersSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    it('should validate sortOrder values', () => {
        const sortOrders = ['asc', 'desc'] as const;
        
        sortOrders.forEach(sortOrder => {
            const data = { sortOrder };
            const result = RideFiltersSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    it('should fail for invalid sortOrder', () => {
        const invalidData = { sortOrder: 'invalid' as const };
        const result = RideFiltersSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for invalid page (not positive)', () => {
        const invalidData = { page: -1 };
        const result = RideFiltersSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for invalid limit (not positive)', () => {
        const invalidData = { limit: 0 };
        const result = RideFiltersSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Dashboard Validations - RequestRideAssignmentSchema', () => {
    it('should validate ride assignment request', () => {
        const validData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000',
            message: 'Please assign me to this ride'
        };

        const result = RequestRideAssignmentSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate ride assignment request without message', () => {
        const validData = {
            rideId: '550e8400-e29b-41d4-a716-446655440000'
        };

        const result = RequestRideAssignmentSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for invalid rideId', () => {
        const invalidData = {
            rideId: 'invalid-uuid',
            message: 'Test message'
        };

        const result = RequestRideAssignmentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Dashboard Validations - ToggleAvailabilitySchema', () => {
    it('should validate availability toggle with true', () => {
        const validData = { available: true };
        const result = ToggleAvailabilitySchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate availability toggle with false', () => {
        const validData = { available: false };
        const result = ToggleAvailabilitySchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for non-boolean available', () => {
        const invalidData = { available: 'yes' as any };
        const result = ToggleAvailabilitySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});

describe('Dashboard Validations - RideHistorySchema', () => {
    it('should validate with default values', () => {
        const validData = {};
        const result = RideHistorySchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(1);
            expect(result.data.limit).toBe(20);
        }
    });

    it('should validate with custom values', () => {
        const validData = { page: 2, limit: 50 };
        const result = RideHistorySchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail for invalid page', () => {
        const invalidData = { page: -1 };
        const result = RideHistorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail for invalid limit', () => {
        const invalidData = { limit: 0 };
        const result = RideHistorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
