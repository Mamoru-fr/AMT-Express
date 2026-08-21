import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import db from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface UpdateProfileInput {
    name: string;
}

export interface ChangeEmailInput {
    newEmail: string;
    callbackURL?: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export class ProfileService {
    /**
     * Update the authenticated user's display name.
     */
    static async updateName(input: UpdateProfileInput): Promise<void> {
        const h = await headers();
        const response = await auth.api.updateUser({
            headers: h,
            body: { name: input.name },
        });
        if (!response) throw new Error('Failed to update profile');
    }

    /**
     * Initiate an email change — sends a verification link to the new address.
     */
    static async changeEmail(input: ChangeEmailInput): Promise<void> {
        const h = await headers();
        const response = await auth.api.changeEmail({
            headers: h,
            body: {
                newEmail: input.newEmail,
                callbackURL: input.callbackURL ?? '/',
            },
        });
        if (!response) throw new Error('Failed to initiate email change');
    }

    /**
     * Change the authenticated user's password.
     */
    static async changePassword(input: ChangePasswordInput): Promise<void> {
        const h = await headers();
        const response = await auth.api.changePassword({
            headers: h,
            body: {
                currentPassword: input.currentPassword,
                newPassword: input.newPassword,
                revokeOtherSessions: false,
            },
        });
        if (!response) throw new Error('Failed to change password');
    }

    /**
     * Resend the email verification link to the currently logged-in user.
     */
    static async resendVerificationEmail(email: string): Promise<void> {
        const h = await headers();
        await auth.api.sendVerificationEmail({
            headers: h,
            body: { email, callbackURL: '/' },
        });
    }

    /**
     * Fetch public profile data for the current user from the DB.
     */
    static async getProfile(userId: string) {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                emailVerified: users.emailVerified,
                image: users.image,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        return user ?? null;
    }
}
