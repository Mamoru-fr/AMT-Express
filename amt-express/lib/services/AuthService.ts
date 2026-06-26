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
            throw new Error(errorMessage);
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
            throw new Error(errorMessage);
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
}
