'use server'

import {z} from 'zod';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {AuthService} from '@/lib/services/AuthService';
import {redirect} from 'next/navigation';

// Validation schemas
const SignInSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

const SignUpSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

/**
 * Sign-in action
 * Validation + Sécurité + Service call
 */
export async function signin(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        redirect("/connections?view=signin&error=" + encodeURIComponent("errors.emailPasswordRequired"));
    }

    try {
        // === VALIDATION ===
        const validationResult = SignInSchema.safeParse({email, password});
        if (!validationResult.success) {
            redirect("/connections?view=signin&error=" + encodeURIComponent("errors.validationFailed"));
        }

        // === APPEL AU SERVICE ===
        await AuthService.signin(email, password);
        redirect("/");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'errors.invalidCredentials';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
}

/**
 * Sign-up action
 * Validation + Sécurité + Service call
 */
export async function signup(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
        redirect("/connections?view=signup&error=" + encodeURIComponent("errors.allFieldsRequired"));
    }

    try {
        // === VALIDATION ===
        const validationResult = SignUpSchema.safeParse({name, email, password, confirmPassword});
        if (!validationResult.success) {
            redirect("/connections?view=signup&error=" + encodeURIComponent("errors.validationFailed"));
        }

        // === SÉCURITÉ: Vérifier que les mots de passe correspondent ===
        if (password !== confirmPassword) {
            redirect("/connections?view=signup&error=" + encodeURIComponent("errors.passwordsDoNotMatch"));
        }

        // === APPEL AU SERVICE ===
        await AuthService.signup(name, email, password, confirmPassword);
        redirect("/");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'errors.signupFailed';
        redirect(`/connections?view=signup&error=${encodeURIComponent(errorMessage)}`);
    }
}

/**
 * Sign-out action
 * Service call
 */
export async function signout() {
    try {
        // === APPEL AU SERVICE ===
        await AuthService.signout();
        redirect("/connections?view=signin");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'errors.signoutFailed';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
}
