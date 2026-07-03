'use server'

import {signIn, signUp, signOut} from './AuthActions';
import {redirect} from 'next/navigation';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {generateCsrfToken} from '@/lib/middleware/csrfMiddleware';

/**
 * Sign Actions - Server Actions pour les formulaires
 * Appellent les fonctions de AuthActions qui délèguent au Controller
 * avec validation CSRF et des inputs
 */

/**
 * Handle sign in form submission
 * @param formData - Form data from sign in form
 * @returns Redirect to appropriate page
 */
export async function signin(formData: FormData): Promise<void> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const csrfToken = formData.get("csrfToken") as string;

    if (!email || !password) {
        redirect("/connections?view=signin&error=" + encodeURIComponent("errors.emailPasswordRequired"));
    }

    const result = await signIn(email, password, csrfToken);
    if (!result.success) {
        const errorMessage = result.error || 'errors.invalidCredentials';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/");
}

/**
 * Handle sign up form submission
 * @param formData - Form data from sign up form
 * @returns Redirect to appropriate page
 */
export async function signup(formData: FormData): Promise<void> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const csrfToken = formData.get("csrfToken") as string;

    if (!name || !email || !password || !confirmPassword) {
        redirect("/connections?view=signup&error=" + encodeURIComponent("errors.allFieldsRequired"));
    }

    const result = await signUp(name, email, password, confirmPassword, csrfToken);
    if (!result.success) {
        const errorMessage = result.error || 'errors.signupFailed';
        redirect(`/connections?view=signup&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/");
}

/**
 * Handle sign out form submission
 * @param formData - Form data from sign out form
 * @returns Redirect to sign in page
 */
export async function signout(formData?: FormData): Promise<void> {
    const csrfToken = formData?.get("csrfToken") as string;
    
    const result = await signOut(csrfToken);
    if (!result.success) {
        const errorMessage = result.error || 'errors.signoutFailed';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/connections?view=signin");
}

/**
 * Generate a CSRF token for forms
 * @returns CSRF token string
 */
export async function generateCsrfFormToken(): Promise<string> {
    return generateCsrfToken();
}
