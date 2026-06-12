import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";

export class AuthService {
    /**
     * Handle sign-in with email and password
     */
    static async signin(email: string, password: string): Promise<Response> {
        if (!email || !password) {
            throw new Error('errors.emailPasswordRequired');
        }

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
            const errorMessage = errorData.message || errorData.error || "errors.invalidCredentials";
            throw new Error(errorMessage);
        }

        return response;
    }

    /**
     * Handle sign-up for new users
     */
    static async signup(
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Promise<Response> {
        if (!name || !email || !password || !confirmPassword) {
            throw new Error('errors.allFieldsRequired');
        }

        if (password !== confirmPassword) {
            throw new Error('errors.passwordsDoNotMatch');
        }

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
            const errorMessage = errorData.message || errorData.error || "errors.signupFailed";
            throw new Error(errorMessage);
        }

        return response;
    }

    /**
     * Handle sign-out
     */
    static async signout(): Promise<Response> {
        const response = await auth.api.signOut({
            asResponse: true,
            headers: await headers(),
        });

        return response;
    }
}
