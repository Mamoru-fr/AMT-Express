'use server'

import {signIn, signUp, signOut, requestPasswordReset, resetPassword as resetPasswordCall} from './AuthActions';
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

/**
 * Mot de passe oublié : envoie le lien de réinitialisation.
 * Toujours redirigé vers la vue forgot avec sent=1 (message générique anti-énumération).
 * PAUSE : verrouillé tant qu'aucun provider email n'est branché dans lib/utils/email.ts.
 */
export async function forgotPassword(formData: FormData): Promise<void> {
    // PAUSE : verrou serveur tant qu'aucun provider email n'est branché
    // (le bouton UI est déjà masqué par le même flag — défense en profondeur)
    if (process.env.NEXT_PUBLIC_EMAIL_DELIVERY_ENABLED !== 'true') {
        redirect("/connections?view=signin");
    }

    const email = formData.get("email") as string;

    if (!email) {
        redirect("/connections?view=forgot&error=" + encodeURIComponent("errors.emailRequired"));
    }

    const result = await requestPasswordReset(email);
    if (!result.success) {
        const errorMessage = result.error || 'errors.resetFailed';
        redirect(`/connections?view=forgot&error=${encodeURIComponent(errorMessage)}`);
    }

    redirect("/connections?view=forgot&sent=1");
}

/**
 * Réinitialisation du mot de passe depuis le lien reçu par email.
 */
export async function resetPassword(formData: FormData): Promise<void> {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !password || !confirmPassword) {
        redirect("/connections?view=reset&error=" + encodeURIComponent("errors.allFieldsRequired"));
    }

    const result = await resetPasswordCall(token, password, confirmPassword);
    if (!result.success) {
        const errorMessage = result.error || 'errors.resetFailed';
        const params = new URLSearchParams({view: 'reset', error: errorMessage, ...(token ? {token} : {})});
        redirect(`/connections?${params.toString()}`);
    }

    redirect("/connections?view=signin&info=resetSuccess");
}

export async function signout(): Promise<void> {
    const result = await signOut();
    if (!result.success) {
        const errorMessage = result.error || 'errors.signoutFailed';
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    
    redirect("/connections?view=signin");
}
