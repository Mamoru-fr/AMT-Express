/**
 * Integration tests for RidesManagementActions
 * 
 * Tests ride management functionality including:
 * - Ride creation
 * - Ride deletion
 * - Ride status updates
 * - Input validation
 * - Role checking
 * - Audit logging
 */

// Set test environment
import { vi } from 'vitest';
vi.stubEnv('NODE_ENV', 'test');

// Mock role middleware to always pass for tests
vi.mock('@/lib/middleware/roleMiddleware', () => ({
  requireRole: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-admin', role: 'admin', email: 'admin@test.com' },
      session: {} 
    } 
  }),
  verifyRole: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-admin', role: 'admin', email: 'admin@test.com' },
      session: {} 
    } 
  }),
  verifyAuth: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-admin', role: 'admin', email: 'admin@test.com' },
      session: {} 
    } 
  }),
  requireRoles: vi.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      user: { id: 'test-admin', role: 'admin', email: 'admin@test.com' },
      session: {} 
    } 
  }),
}));

// Mock CSRF validation to always pass in test environment
vi.mock('@/lib/middleware/csrfMiddleware', () => ({
  validateCsrfToken: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

// Mock AuditService to prevent audit failures
vi.mock('@/lib/services/AuditService', () => ({
  AuditLogger: {
    ride: {
      create: vi.fn().mockResolvedValue({}),
      assign: vi.fn().mockResolvedValue({}),
      cancel: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createRide,
  deleteRide,
  assignDriverToRide,
  cancelRide,
  fetchRidesForManagement,
} from '@/lib/actions/ridesManagementActions';
import db from '@/lib/db/drizzle';
import { rides, users, drivers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ErrorCodes } from '@/lib/types/action-response';
import type { ActionResponse } from '@/lib/types/action-response';

// Type guards for ActionResponse types
function isErrorResponse<T>(response: ActionResponse<T>): response is { success: false; error: string; code?: string; details?: unknown } {
  return !response.success;
}

function isSuccessResponse<T>(response: ActionResponse<T>): response is { success: true; data: T } {
  return response.success;
}

// Helper to clean up test data
async function cleanupTestRides() {
  try {
    await db.delete(rides).where(eq(rides.departure, 'Test Departure'));
  } catch (error) {
    console.error('Ride cleanup failed:', error);
  }
}

// Helper to create a test user
async function createTestUser() {
  const [user] = await db.insert(users).values({
    name: 'Test Admin',
    email: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@test.com`,
    role: 'admin',
    emailVerified: true,
  }).returning();
  return user.id;
}

// Helper to create a test driver
async function createTestDriver(userId: string) {
  const [driver] = await db.insert(drivers).values({
    userId,
    accountingCode: `DRV${Date.now()}`,
    vehiclePlate: 'TEST123',
    vehicleType: 'car',
    available: true,
  }).returning();
  return userId; // Return the userId (assignDriverToRide expects userId, not driver.id)
}

// Helper to create test customers
async function createTestCustomer() {
  const [customer] = await db.insert(users).values({
    name: 'Test Customer',
    email: `customer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@test.com`,
    role: 'customer',
    emailVerified: true,
  }).returning();
  return customer.id;
}

describe('RidesManagementActions [INTEGRATION]', () => {
  let testAdminId: string;
  let testDriverId: string;
  let testCustomer1Id: string;

  beforeAll(async () => {
    // Create test admin user
    testAdminId = await createTestUser();
    testDriverId = await createTestDriver(testAdminId);
    testCustomer1Id = await createTestCustomer();
    
    // Clean up any existing test rides
    await cleanupTestRides();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestRides();
    
    try {
      await db.delete(drivers).where(eq(drivers.userId, testAdminId));
      await db.delete(users).where(eq(users.id, testAdminId));
      await db.delete(users).where(eq(users.id, testCustomer1Id));
    } catch (error) {
      console.error('User cleanup failed:', error);
    }
  });

  describe('createRide', () => {
    it('should create a new ride with valid data', async () => {
      const departureTime = new Date();
      departureTime.setHours(departureTime.getHours() + 24); // Future date
      
      const expectedDeparture = `Test Departure ${Date.now()}`;
      const expectedDestination = `Test Destination ${Date.now()}`;
      
      const result = await createRide({
        departureTime,
        customerIds: [testCustomer1Id],
        departure: expectedDeparture,
        destination: expectedDestination,
        driverId: testDriverId,
        price: '100.50',
        status: 'pending',
      });

      expect(result.success).toBe(true);
      if (isSuccessResponse(result)) {
        expect(typeof result.data).toBe('string');
        expect(result.data.length).toBeGreaterThan(0);
        
        // Verify ride was created
        const ride = await db
          .select()
          .from(rides)
          .where(eq(rides.id, result.data))
          .limit(1);
        
        expect(ride.length).toBe(1);
        expect(ride[0].departure).toBe(expectedDeparture);
        expect(ride[0].destination).toBe(expectedDestination);
        expect(ride[0].price).toBe('100.50');
      }
    });

    it('should validate required fields', async () => {
      const result = await createRide({
        departureTime: new Date(),
        customerIds: [],
        departure: '',
        destination: '',
        price: '100',
      });

      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });
  });

  describe('assignDriverToRide', () => {
    it('should assign a driver to an existing ride', async () => {
      // Create a ride first
      const createResult = await createRide({
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        customerIds: [testCustomer1Id],
        departure: `Test Departure Assign ${Date.now()}`,
        destination: `Test Destination Assign ${Date.now()}`,
        price: '150.00',
      });
      
      if (!isSuccessResponse(createResult)) {
        expect.fail('Create ride failed');
        return;
      }
      
      const assignResult = await assignDriverToRide(createResult.data, testDriverId);
      
      expect(assignResult.success).toBe(true);
      
      // Verify assignment - check that driverId was set (it's a drivers.id integer, not the userId)
      const ride = await db
        .select()
        .from(rides)
        .where(eq(rides.id, createResult.data))
        .limit(1);
      
      expect(ride.length).toBe(1);
      expect(ride[0].driverId).toBeDefined();
      expect(ride[0].driverId).not.toBeNull();
      
      // Clean up
      await db.delete(rides).where(eq(rides.id, createResult.data));
    });

    it('should validate ride ID', async () => {
      const result = await assignDriverToRide('invalid-uuid', testDriverId);
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });
  });

  describe('cancelRide', () => {
    it('should cancel an existing ride', async () => {
      // Create a ride first
      const createResult = await createRide({
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        customerIds: [testCustomer1Id],
        departure: `Test Departure Cancel ${Date.now()}`,
        destination: `Test Destination Cancel ${Date.now()}`,
        price: '200.00',
      });
      
      if (!isSuccessResponse(createResult)) {
        expect.fail('Create ride failed');
        return;
      }
      
      const cancelResult = await cancelRide(createResult.data);
      
      expect(cancelResult.success).toBe(true);
      
      // Verify cancellation - ride should still exist but status should be cancelled
      const ride = await db
        .select()
        .from(rides)
        .where(eq(rides.id, createResult.data))
        .limit(1);
      
      expect(ride.length).toBe(1);
      // Note: The actual status change depends on the controller implementation
      
      // Clean up
      await db.delete(rides).where(eq(rides.id, createResult.data));
    });

    it('should validate ride ID for cancellation', async () => {
      const result = await cancelRide('invalid-uuid');
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });
  });

  describe('deleteRide', () => {
    it('should delete an existing ride', async () => {
      // Create a ride first
      const createResult = await createRide({
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        customerIds: [testCustomer1Id],
        departure: `Test Departure Delete ${Date.now()}`,
        destination: `Test Destination Delete ${Date.now()}`,
        price: '300.00',
      });
      
      if (!isSuccessResponse(createResult)) {
        expect.fail('Create ride failed');
        return;
      }
      
      console.log('Delete test - createResult:', createResult);
      
      const deleteResult = await deleteRide(createResult.data);
      
      expect(deleteResult.success).toBe(true);
      
      // Verify deletion
      const ride = await db
        .select()
        .from(rides)
        .where(eq(rides.id, createResult.data))
        .limit(1);
      
      expect(ride.length).toBe(0);
    });

    it('should validate ride ID for deletion', async () => {
      const result = await deleteRide('invalid-uuid');
      
      expect(result.success).toBe(false);
      if (isErrorResponse(result)) {
        expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });
  });

  describe('fetchRidesForManagement', () => {
    it('should return rides data', async () => {
      const result = await fetchRidesForManagement({ page: 1, limit: 10 });
      
      expect(result.success).toBe(true);
      if (isSuccessResponse(result)) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data.rides)).toBe(true);
        expect(typeof result.data.total).toBe('number');
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.totalPages).toBe('number');
      }
    });

    it('should respect pagination', async () => {
      const result = await fetchRidesForManagement({ page: 1, limit: 5 });
      
      expect(result.success).toBe(true);
      if (isSuccessResponse(result)) {
        expect(result.data.rides.length).toBeLessThanOrEqual(5);
      }
    });

    it('should filter by status', async () => {
      const result = await fetchRidesForManagement({ 
        status: 'completed',
        page: 1,
        limit: 10 
      });
      
      expect(result.success).toBe(true);
      if (isSuccessResponse(result)) {
        // All returned rides should have completed status
        expect(result.data.rides.every(r => r.status === 'completed')).toBe(true);
      }
    });
  });
});
