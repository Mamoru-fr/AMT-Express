/**
 * Unit tests — ProfileController.deleteAccount (anonymisation RGPD)
 *
 * Contrôleur : garde session → délégation au service.
 * L'anonymisation elle-même vit dans ProfileService (mocké ici).
 */

vi.stubEnv('NODE_ENV', 'test');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileController } from '@/lib/controllers/ProfileController';
import { ProfileService } from '@/lib/services/ProfileService';
import { getSessionWithRole } from '@/lib/auth/session';
import { ErrorCodes } from '@/lib/types/action-response';

vi.mock('@/lib/auth/session', () => ({
    getSessionWithRole: vi.fn(),
}));

vi.mock('@/lib/services/ProfileService', () => ({
    ProfileService: {
        anonymizeAccount: vi.fn(),
    },
}));

const mockedService = vi.mocked(ProfileService);
const mockedSession = vi.mocked(getSessionWithRole);

const connectedSession = {
    session: { user: { id: 'user-123' } },
    user: { id: 'user-123', role: 'customer' },
    role: 'customer' as const,
    isAuthenticated: true,
    isAdmin: false,
    isDriver: false,
    isCustomer: true,
};

describe('ProfileController.deleteAccount [UNIT]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('refuse (UNAUTHORIZED) sans session', async () => {
        mockedSession.mockResolvedValueOnce({
            ...connectedSession,
            session: null,
            user: null,
            isAuthenticated: false,
            isCustomer: false,
        } as never);

        const result = await ProfileController.deleteAccount();

        expect(result.success).toBe(false);
        expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
        expect(mockedService.anonymizeAccount).not.toHaveBeenCalled();
    });

    it('refuse (UNAUTHORIZED) avec session sans user id', async () => {
        mockedSession.mockResolvedValueOnce({
            ...connectedSession,
            user: null,
        } as never);

        const result = await ProfileController.deleteAccount();

        expect(result.success).toBe(false);
        expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
        expect(mockedService.anonymizeAccount).not.toHaveBeenCalled();
    });

    it('anonymise avec le userId de la session en cas de succès', async () => {
        mockedSession.mockResolvedValueOnce(connectedSession as never);
        mockedService.anonymizeAccount.mockResolvedValueOnce(undefined);

        const result = await ProfileController.deleteAccount();

        expect(result.success).toBe(true);
        expect(mockedService.anonymizeAccount).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('retourne INTERNAL_ERROR si le service échoue', async () => {
        mockedSession.mockResolvedValueOnce(connectedSession as never);
        mockedService.anonymizeAccount.mockRejectedValueOnce(new Error('DB failure'));

        const result = await ProfileController.deleteAccount();

        expect(result.success).toBe(false);
        expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR);
    });
});
