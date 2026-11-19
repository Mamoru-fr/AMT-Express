import {auth} from "@/lib/auth/auth";

export class AuthService {
    /**
     * Handle sign-in with email and password
     * NOTE: Validation is handled by AuthController
     */
    static async signin(email: string, password: string): Promise<Response> {
        const response = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            asResponse: true,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Sign in failed:", errorData);
            const errorMessage = errorData.message || errorData.error || "errors.Invalid credentials";
            const errorCode = errorData.code || '';
            throw new Error(`${errorCode}: ${errorMessage}`);
        }

        return response;
    }

    /**
     * Handle sign-up for new users
     * NOTE: Validation is handled by AuthController
     */
    static async signup(
        name: string,
        email: string,
        password: string
    ): Promise<Response> {
        const response = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
            asResponse: true,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Sign up failed:", errorData);
            const errorMessage = errorData.message || errorData.error || "errors.Failed to create user";
            const errorCode = errorData.code || '';
            throw new Error(`${errorCode}: ${errorMessage}`);
        }

        return response;
    }

    /**
     * Handle sign-out
     * @param headersInstance - Headers from next/headers, passed from Controller
     */
    static async signout(headersInstance: Headers): Promise<Response> {
        const response = await auth.api.signOut({
            asResponse: true,
            headers: headersInstance,
        });

        return response;
    }

    /**
     * Demande de réinitialisation de mot de passe (mot de passe oublié).
     * Better Auth (endpoint requestPasswordReset) envoie le lien via le
     * sendResetPassword configuré dans auth.ts, avec mitigation du timing attack
     * et réponse générique anti-énumération côté lib.
     * Flux du lien email : {BETTER_AUTH_URL}/reset-password/{token}?callbackURL=/connections?view=reset
     * → après validation du token, Better Auth redirige vers /connections?view=reset&token=...
     */
    static async requestPasswordReset(email: string): Promise<void> {
        const response = await auth.api.requestPasswordReset({
            body: {
                email,
                // Vue de finalisation : Better Auth y ajoutera ?token=VALID_TOKEN
                redirectTo: '/connections?view=reset',
            },
            asResponse: true,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Password reset request failed:', errorData);
            // Anti-énumération : pas d'erreur remontée au client — la UI affiche
            // un message générique quelque soit le résultat.
        }
    }

    /**
     * Réinitialisation effective du mot de passe via le token reçu par email.
     */
    static async resetPassword(newPassword: string, token: string): Promise<void> {
        const response = await auth.api.resetPassword({
            body: {
                newPassword,
                token,
            },
            asResponse: true,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Password reset failed:', errorData);
            const errorMessage = errorData?.message || errorData?.error || 'errors.resetFailed';
            const errorCode = errorData?.code || '';
            throw new Error(`${errorCode}: ${errorMessage}`);
        }
    }
}
