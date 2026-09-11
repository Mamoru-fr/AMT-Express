/**
 * Audit Service
 * 
 * Provides centralized logging of user activities for security and debugging.
 * Logs sensitive actions like ride creation/deletion, user management, etc.
 * 
 * Note: Uses the activityLogs table from the database schema
 */

import db from '@/lib/db/drizzle';
import { activityLogs } from '@/lib/db/schema';
import { getSessionWithRole } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

export type ActivityAction = 
  | 'ride.create' | 'ride.update' | 'ride.delete' | 'ride.assign' | 'ride.cancel'
  | 'user.create' | 'user.update' | 'user.delete'
  | 'driver.create' | 'driver.update' | 'driver.delete'
  | 'production.create' | 'production.update' | 'production.delete'
  | 'import.csv'
  | 'auth.login' | 'auth.logout'
  | 'settings.update';

export interface AuditLogData {
  action: ActivityAction;
  details?: Record<string, unknown>;
  userId?: string;
}

/**
 * Log an activity to the database
 * @param data - Activity data to log
 */
export async function logActivity(data: AuditLogData): Promise<void> {
  try {
    const { user } = await getSessionWithRole();
    const userId = data.userId || user?.id;
    
    // Only log if we have a user ID
    if (!userId) {
      return;
    }

    await db.insert(activityLogs).values({
      userId: userId as string,
      action: data.action,
      details: data.details ? JSON.stringify(data.details) : null,
    });
  } catch (error) {
    console.error('[AuditService] Failed to log activity:', error);
    // Don't throw - auditing should never break the main functionality
  }
}

/**
 * Create a helper for specific audit contexts
 */
export function createAuditLogger(context: { action: ActivityAction; userId?: string }) {
  return {
    log: async (details?: Record<string, unknown>) => {
      await logActivity({
        action: context.action,
        details,
        userId: context.userId,
      });
    },
    logWithDetails: async (details: Record<string, unknown>) => {
      await logActivity({
        action: context.action,
        details: { ...details, loggedAt: new Date().toISOString() },
        userId: context.userId,
      });
    }
  };
}

/**
 * Get audit logs for a specific user
 */
export async function getUserActivityLogs(userId: string, limit: number = 50) {
  try {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error('[AuditService] Failed to fetch activity logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs (admin only)
 */
export async function getRecentAuditLogs(limit: number = 100) {
  try {
    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error('[AuditService] Failed to fetch recent logs:', error);
    return [];
  }
}

/**
 * Predefined audit loggers for common actions
 */
export const AuditLogger = {
  // Ride actions
  ride: {
    create: (rideId: string, userId?: string) => 
      logActivity({ action: 'ride.create', details: { rideId }, userId }),
    update: (rideId: string, changes: Record<string, unknown>, userId?: string) => 
      logActivity({ action: 'ride.update', details: { rideId, ...changes }, userId }),
    delete: (rideId: string, userId?: string) => 
      logActivity({ action: 'ride.delete', details: { rideId }, userId }),
    assign: (rideId: string, driverId: string, userId?: string) => 
      logActivity({ action: 'ride.assign', details: { rideId, driverId }, userId }),
    cancel: (rideId: string, userId?: string) => 
      logActivity({ action: 'ride.cancel', details: { rideId }, userId }),
  },
  
  // User actions
  user: {
    create: (createdUserId: string, adminId?: string) => 
      logActivity({ action: 'user.create', details: { createdUserId }, userId: adminId }),
    update: (userId: string, changes: Record<string, unknown>, adminId?: string) => 
      logActivity({ action: 'user.update', details: { userId, ...changes }, userId: adminId }),
    delete: (userId: string, adminId?: string) => 
      logActivity({ action: 'user.delete', details: { userId }, userId: adminId }),
  },
  
  // Import actions
  import: {
    csv: (fileName: string, rowCount: number, userId?: string) => 
      logActivity({ action: 'import.csv', details: { fileName, rowCount }, userId }),
  },
  
  // Auth actions
  auth: {
    login: (userId?: string) => 
      logActivity({ action: 'auth.login', userId }),
    logout: (userId?: string) => 
      logActivity({ action: 'auth.logout', userId }),
  },
};

export default {
  logActivity,
  createAuditLogger,
  getUserActivityLogs,
  getRecentAuditLogs,
  AuditLogger,
};
