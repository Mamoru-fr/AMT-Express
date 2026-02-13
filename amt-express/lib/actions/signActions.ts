"use server";

import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export const signin = async (formData: FormData) => {
    /* 
        This function handles the sign-in process for users. It takes a FormData object as input, which contains the user's email and password.
    */

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        // If either the email or password is missing, redirect back to the signin page with an error message indicating that both fields are required.
        redirect("/connections?view=signin&error=" + encodeURIComponent("errors.emailPasswordRequired"));
    }

    const response = await auth.api.signInEmail({
        body: {
            email,
            password,
        },
        asResponse: true,
    });
    if (!response.ok) {
        // If the sign-in request fails, attempt to extract a meaningful error message from the response and redirect back to the signin page with that error message.
        const errorData = await response.json();
        console.error("Sign in failed:", errorData);
        const errorMessage = errorData.message || errorData.error || "errors.invalidCredentials";
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    redirect("/"); // When sign-in is successful, redirect the user to the home page or dashboard.
};

export const signup = async (formData: FormData) => {
    /* 
        This function handles the sign-up process for new users. It takes a FormData object as input, which contains the user's name, email, password, and password confirmation.
    */

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
        // If any of the required fields are missing, redirect back to the signup page with an error message indicating that all fields are required.
        redirect("/connections?view=signup&error=" + encodeURIComponent("errors.allFieldsRequired"));
    }

    if (password !== confirmPassword) {
        // If the password and confirmation do not match, redirect back to the signup page with an error message indicating that the passwords do not match.
        redirect("/connections?view=signup&error=" + encodeURIComponent("errors.passwordMismatch"));
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
        // If the sign-up request fails, attempt to extract a meaningful error message from the response and redirect back to the signup page with that error message.
        const errorData = await response.json();
        console.error("Sign up failed:", errorData);
        const errorMessage = errorData.message || errorData.error || "errors.signupFailed";
        redirect(`/connections?view=signup&error=${encodeURIComponent(errorMessage)}`);
    }
    redirect("/"); // When sign-up is successful, redirect the user to the home page or dashboard.
};

export const signout = async () => {
    // This function handles the sign-out process for users. It calls the signOut method from the authentication API and Discards the cookies which contains the session token. 
    await auth.api.signOut({headers: await headers()});
};