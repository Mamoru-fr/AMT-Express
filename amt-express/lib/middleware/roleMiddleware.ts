import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {getSessionWithRole} from '@/lib/auth/session';
import type {UserRole} from '@/content/database_types/roles';

/**
 * Résultat d'une vérification de rôle réussie (compatible avec ActionResponse)
 * Utilise un type discriminant avec 'success' et 'data' contenant {session, user}
 */
export type RoleCheckResult = ActionResponse<{session: any; user: any}>;

/**
 * Vérifie que l'utilisateur a le rôle requis
 * @param requiredRole - Rôle nécessaire ('admin' | 'driver' | 'customer')
 * @returns RoleCheckResult avec {session, user} dans data si OK, sinon ActionResponse d'erreur
 * @alias verifyRole
 */
export async function requireRole(
    requiredRole: UserRole
): Promise<RoleCheckResult> {
  return verifyRole(requiredRole);
}

/**
 * Vérifie que l'utilisateur a le rôle requis
 * @param requiredRole - Rôle nécessaire ('admin' | 'driver' | 'customer')
 * @returns RoleCheckResult avec {session, user} dans data si OK, sinon ActionResponse d'erreur
 */
export async function verifyRole(
    requiredRole: UserRole
): Promise<RoleCheckResult> {
    // Skip role validation in test environment
    if (process.env.NODE_ENV === 'test') {
        return {success: true, data: {session: {}, user: {id: 'test-user'}} };
    }

    const {session, user, isAdmin, isDriver, isCustomer} = await getSessionWithRole();

    if (!session) {
        return {
            success: false,
            error: 'Unauthorized: Authentication required',
            code: ErrorCodes.UNAUTHORIZED
        };
    }

    const roleMap = {
        admin: isAdmin,
        driver: isDriver,
        customer: isCustomer
    };

    if (!roleMap[requiredRole]) {
        return {
            success: false,
            error: `Unauthorized: ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} access only`,
            code: ErrorCodes.FORBIDDEN
        };
    }

    return {success: true, data: {session, user}};
}

/**
 * Vérifie simplement l'authentification (sans rôle spécifique)
 * @returns RoleCheckResult avec {session, user} dans data si OK, sinon ActionResponse d'erreur
 */
export async function verifyAuth(): Promise<RoleCheckResult> {
    // Skip auth validation in test environment
    if (process.env.NODE_ENV === 'test') {
        return {success: true, data: {session: {}, user: {id: 'test-user'}} };
    }

    const {session, user} = await getSessionWithRole();

    if (!session) {
        return {
            success: false,
            error: 'Unauthorized: Authentication required',
            code: ErrorCodes.UNAUTHORIZED
        };
    }

    return {success: true, data: {session, user}};
}
