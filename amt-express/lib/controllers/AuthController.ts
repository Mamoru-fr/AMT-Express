import {z} from 'zod';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {AuthService} from '@/lib/services/AuthService';
import {headers} from 'next/headers';
import {verifyAuth} from '@/lib/middleware/roleMiddleware';

// Validation schemas
const SignInSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

const SignUpSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

/**
 * AuthController - Gère la validation et la sécurité de l'authentification
 * Délègue la logique métier à AuthService
 */
export class AuthController {
    /**
     * Valide les credentials et appelle le service
     */
    static async signIn(email: string, password: string): Promise<ActionResponse<void>> {
        try {
            // === VALIDATION DES CHAMPS ===
            const validationResult = SignInSchema.safeParse({email, password});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation échouée',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === SÉCURITÉ: Rate limiting (simple) ===
            // TODO: Implémenter Redis rate limiting en production
            // Pour l'instant, validation simple

            // === APPEL AU SERVICE ===
            const result = await AuthService.signin(email, password);

            return {
                success: true,
                data: undefined
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMsg.includes('Invalid credentials')) {
                return {
                    success: false,
                    error: 'Email ou mot de passe incorrect',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            return {
                success: false,
                error: errorMsg,
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * Valide les données d'inscription et appelle le service
     */
    static async signUp(
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Promise<ActionResponse<void>> {
        try {
            // === VALIDATION DES CHAMPS ===
            const validationResult = SignUpSchema.safeParse({name, email, password});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation échouée',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === SÉCURITÉ: Vérifier que les mots de passe correspondent ===
            if (password !== confirmPassword) {
                return {
                    success: false,
                    error: 'Les mots de passe ne correspondent pas',
                    code: ErrorCodes.VALIDATION_ERROR
                };
            }

            // === APPEL AU SERVICE ===
            await AuthService.signup(name, email, password);

            return {
                success: true,
                data: undefined
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMsg.includes('already exists')) {
                return {
                    success: false,
                    error: 'Cet email est déjà utilisé',
                    code: ErrorCodes.VALIDATION_ERROR
                };
            }

            return {
                success: false,
                error: errorMsg,
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * Sécurité: Vérifier la session avant de déconnecter
     */
    static async signOut(): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ: Vérifier la session ===
            const authCheck = await verifyAuth();
            if (!authCheck.success) return authCheck;

            // === APPEL AU SERVICE ===
            const headersInstance = await headers();
            await AuthService.signout(headersInstance);

            return {
                success: true,
                data: undefined
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
            return {
                success: false,
                error: errorMsg,
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }
}
