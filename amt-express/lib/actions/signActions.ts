'use server'

import {signIn, signUp, signOut} from './AuthActions';
import {redirect} from 'next/navigation';

/**
 * Sign Actions - Server Actions pour les formulaires
 * Appellent les fonctions de AuthActions qui délèguent au Controller
 */

export async function signin(formData: FormData): Promise<void> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        redirect("/connections?view=signin&error=" + encodeURIComponent("errors.emailPasswordRequired"));
    }

    const result = await signIn(email, password);
    if (!result.success) {
        const errorMessage = result.error || 'errors.invalidCredentials';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/");
}

export async function signup(formData: FormData): Promise<void> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
        redirect("/connections?view=signup&error=" + encodeURIComponent("errors.allFieldsRequired"));
    }

    const result = await signUp(name, email, password, confirmPassword);
    if (!result.success) {
        const errorMessage = result.error || 'errors.signupFailed';
        redirect(`/connections?view=signup&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/");
}

export async function signout(): Promise<void> {
    const result = await signOut();
    if (!result.success) {
        const errorMessage = result.error || 'errors.signoutFailed';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/connections?view=signin");
}
