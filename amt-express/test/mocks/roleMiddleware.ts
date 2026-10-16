import { vi } from 'vitest';
import type { UserRole } from '@/content/database_types/roles';
import type { RoleCheckResult } from '@/lib/middleware/roleMiddleware';

/**
 * Mock pour verifyRole
 * @param role - Rôle à simuler (par défaut 'admin')
 * @returns Fonction mockée qui retourne un RoleCheckResult avec succès
 */
export function mockVerifyRole(role: UserRole = 'admin'): () => Promise<RoleCheckResult> {
  return vi.fn().mockResolvedValue({
    success: true,
    data: {
      session: { user: { id: 'test-user', role } },
      user: { id: 'test-user', role, email: 'test@example.com' }
    }
  });
}

/**
 * Mock pour verifyRole avec échec
 * @param errorMessage - Message d'erreur à retourner
 * @param code - Code d'erreur (par défaut 'UNAUTHORIZED')
 * @returns Fonction mockée qui retourne un RoleCheckResult avec échec
 */
export function mockVerifyRoleFailure(errorMessage: string = 'Unauthorized', code: string = 'UNAUTHORIZED'): () => Promise<RoleCheckResult> {
  return vi.fn().mockResolvedValue({
    success: false,
    error: errorMessage,
    code: code as any
  });
}

/**
 * Mock pour verifyAuth
 * @returns Fonction mockée qui retourne un RoleCheckResult avec succès
 */
export function mockVerifyAuth(): () => Promise<RoleCheckResult> {
  return vi.fn().mockResolvedValue({
    success: true,
    data: {
      session: { user: { id: 'test-user', role: 'customer' } },
      user: { id: 'test-user', role: 'customer', email: 'test@example.com' }
    }
  });
}

/**
 * Mock pour verifyAuth avec échec
 * @param errorMessage - Message d'erreur à retourner
 * @returns Fonction mockée qui retourne un RoleCheckResult avec échec
 */
export function mockVerifyAuthFailure(errorMessage: string = 'Unauthorized'): () => Promise<RoleCheckResult> {
  return vi.fn().mockResolvedValue({
    success: false,
    error: errorMessage,
    code: 'UNAUTHORIZED' as any
  });
}

/**
 * Réinitialise tous les mocks
 */
export function resetRoleMiddlewareMocks(): void {
  vi.clearAllMocks();
}
