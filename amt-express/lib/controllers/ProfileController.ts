import { ActionResponse, ErrorCodes } from '@/lib/types/action-response';
import { ProfileService } from '@/lib/services/ProfileService';
import { getSessionWithRole } from '@/lib/auth/session';

export class ProfileController {
    static async updateName(name: string): Promise<ActionResponse<void>> {
        if (!name?.trim()) {
            return { success: false, error: 'Name is required', code: ErrorCodes.VALIDATION_ERROR };
        }

        const { isAuthenticated } = await getSessionWithRole();
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', code: ErrorCodes.UNAUTHORIZED };
        }

        try {
            await ProfileService.updateName({ name: name.trim() });
            return { success: true, data: undefined };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update name',
                code: ErrorCodes.INTERNAL_ERROR,
            };
        }
    }

    static async changeEmail(newEmail: string): Promise<ActionResponse<void>> {
        if (!newEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            return { success: false, error: 'Valid email is required', code: ErrorCodes.VALIDATION_ERROR };
        }

        const { isAuthenticated } = await getSessionWithRole();
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', code: ErrorCodes.UNAUTHORIZED };
        }

        try {
            await ProfileService.changeEmail({ newEmail: newEmail.trim(), callbackURL: '/' });
            return { success: true, data: undefined };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to initiate email change',
                code: ErrorCodes.INTERNAL_ERROR,
            };
        }
    }

    static async changePassword(currentPassword: string, newPassword: string): Promise<ActionResponse<void>> {
        if (!currentPassword || !newPassword) {
            return { success: false, error: 'Both passwords are required', code: ErrorCodes.VALIDATION_ERROR };
        }
        if (newPassword.length < 8) {
            return { success: false, error: 'New password must be at least 8 characters', code: ErrorCodes.VALIDATION_ERROR };
        }

        const { isAuthenticated } = await getSessionWithRole();
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', code: ErrorCodes.UNAUTHORIZED };
        }

        try {
            await ProfileService.changePassword({ currentPassword, newPassword });
            return { success: true, data: undefined };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to change password',
                code: ErrorCodes.INTERNAL_ERROR,
            };
        }
    }

    static async resendVerificationEmail(email: string): Promise<ActionResponse<void>> {
        const { isAuthenticated } = await getSessionWithRole();
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', code: ErrorCodes.UNAUTHORIZED };
        }

        try {
            await ProfileService.resendVerificationEmail(email);
            return { success: true, data: undefined };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send verification email',
                code: ErrorCodes.INTERNAL_ERROR,
            };
        }
    }
}
