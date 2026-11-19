import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import db from '@/lib/db/drizzle';
import { users, session as sessionTable, account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ACCOUNT_DELETED_MARKER } from '@/lib/utils/userDisplayName';

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

export interface AnonymizeAccountInput {
    userId: string;
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

    /**
     * RGPD — anonymisation du compte (droit à l'effacement du profil).
     *
     * La ligne `users` est conservée (les FK courses/factures surviennent),
     * mais toutes les PII sont effacées et la reconnexion devient impossible :
     * - name vidé  → les vues affichent la traduction « Utilisateur supprimé » (i18n via ACCOUNT_DELETED_MARKER)
     * - email remplacé par un placeholder unique non devinable (contrainte UNIQUE sur users.email)
     * - password (table account) vidé → plus aucun hash
     * - banned=true + banReason=ACCOUNT_DELETED_MARKER → double verrou Better Auth au login
     * - sessions supprimées → déconnexion immédiate, tous appareils
     *
     * Note : le driver neon-http ne supporte pas les transactions — les 3
     * statements s'exécutent séquentiellement, verrou le plus fort en premier.
     */
    static async anonymizeAccount(input: AnonymizeAccountInput): Promise<void> {
        const { userId } = input;
        if (!userId?.trim()) {
            throw new Error('userId is required');
        }

        const deletedEmail = `deleted-${userId}@anonymized.invalid`;

        // 1. Verrou le plus fort d'abord : banned=true bloque TOUTE session,
        //    même si un hash de mot de passe ou une session survivait aux étapes suivantes.
        await db
            .update(users)
            .set({
                name: '',
                email: deletedEmail,
                emailVerified: false,
                image: null,
                banned: true,
                banReason: ACCOUNT_DELETED_MARKER,
                banExpires: null,
                latitude: null,
                longitude: null,
                lastLocationUpdate: null,
            })
            .where(eq(users.id, userId));

        // 2. Invalide toutes les sessions existantes (déconnexion immédiate).
        await db.delete(sessionTable).where(eq(sessionTable.userId, userId));

        // 3. Efface les identifiants (hash de mot de passe) côté Better Auth.
        await db
            .update(account)
            .set({ password: null })
            .where(eq(account.userId, userId));
    }
}
