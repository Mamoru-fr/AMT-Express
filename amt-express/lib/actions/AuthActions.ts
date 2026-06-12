'use server'

import {AuthController} from '@/lib/controllers/AuthController';
import {ActionResponse} from '@/lib/types/action-response';

/**
 * Auth Actions - Server Actions minimalistes
 * Délèguent tout au AuthController
 */

export async function signIn(email: string, password: string): Promise<ActionResponse<void>> {
    return AuthController.signIn(email, password);
}

export async function signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<ActionResponse<void>> {
    return AuthController.signUp(name, email, password, confirmPassword);
}

export async function signOut(): Promise<ActionResponse<void>> {
    return AuthController.signOut();
}
