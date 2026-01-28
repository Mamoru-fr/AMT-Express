/**
 * Server-side session utilities
 * Use these functions in Server Components and Server Actions
 */

import { cache } from 'react';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { getValidatedRole, isValidUserRole } from '@/utils/isValidUserRole';
import { SessionWithUser } from '@/content/database_types/auth';
import {UserRole} from '@/content/database_types';

/**
 * Get current session (cached per request)
 * Call this in any Server Component - only executes once per request
 */
export const getSession = cache(async (): Promise<SessionWithUser | null> => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session;
});

/**
 * Get current user
 */
export const getCurrentUser = cache(async () => {
    const session = await getSession();
    return session?.user ?? null;
});

/**
 * Get validated user role
 */
export const getUserRole = cache(async () => {
    const session = await getSession();
    return getValidatedRole(session);
});

/**
 * Get session with role helpers (mirrors useSessionWithRole)
 */
export const getSessionWithRole = cache(async () => {
    const session = await getSession();
    const validatedRole = getValidatedRole(session);
    const isAuthenticated = !!session && !session.user.banned;

    // Development warning for invalid roles
    if (process.env.NODE_ENV === 'development' && session?.user?.role) {
        if (!isValidUserRole(session.user.role)) {
            console.warn(`Invalid user role detected: ${session.user.role}. Expected: admin, driver, or customer`);
        }
    }

    return {
        session,
        user: session?.user ?? null,
        role: validatedRole,
        isAuthenticated,
        isAdmin: validatedRole === 'admin' && isAuthenticated,
        isDriver: validatedRole === 'driver' && isAuthenticated,
        isCustomer: validatedRole === 'customer' && isAuthenticated,
    };
});

/**
 * Check if user is admin
 */
export const isAdmin = cache(async () => {
    const { isAdmin } = await getSessionWithRole();
    return isAdmin;
});

/**
 * Check if user is driver
 */
export const isDriver = cache(async () => {
    const { isDriver } = await getSessionWithRole();
    return isDriver;
});

/**
 * Check if user is customer
 */
export const isCustomer = cache(async () => {
    const { isCustomer } = await getSessionWithRole();
    return isCustomer;
});

/**
 * Check if user is authenticated
 */
export const isAuthenticated = cache(async () => {
    const { isAuthenticated } = await getSessionWithRole();
    return isAuthenticated;
});

/**
 * Require authentication (throws if not authenticated)
 */
export const requireAuth = cache(async () => {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized: Authentication required');
    }
    return session;
});

/**
 * Require specific role (throws if user doesn't have the role)
 */
export const requireRole = cache(async (role: UserRole) => {
    const session = await requireAuth();
    const validatedRole = getValidatedRole(session);
    
    if (validatedRole !== role) {
        throw new Error(`Forbidden: Requires ${role} role`);
    }
    
    return session;
});

/**
 * Require admin role (throws if not admin)
 */
export const requireAdmin = cache(async () => {
    return await requireRole('admin');
});

/**
 * Require driver role (throws if not driver)
 */
export const requireDriver = cache(async () => {
    return await requireRole('driver');
});
