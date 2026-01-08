"use server";

import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export const signin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!email || !password) {
        redirect("/connections?view=signin&error=" + encodeURIComponent("Email et mot de passe requis"));
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
        const errorMessage = errorData.message || errorData.error || "Email ou mot de passe incorrect";
        redirect(`/connections?view=signin&error=${encodeURIComponent(errorMessage)}`);
    }
    redirect("/"); // on redirige vers la home page une fois connecté
};

export const signup = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (!name || !email || !password || !confirmPassword) {
        redirect("/connections?view=signup&error=" + encodeURIComponent("Tous les champs sont requis"));
    }

    if (password !== confirmPassword) {
        redirect("/connections?view=signup&error=" + encodeURIComponent("Les mots de passe ne correspondent pas"));
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
        const errorMessage = errorData.message || errorData.error || "Une erreur est survenue lors de l'inscription";
        redirect(`/connections?view=signup&error=${encodeURIComponent(errorMessage)}`);
    }
    redirect("/"); // on redirige vers la home page une fois connecté
};

export const signout = async () => {
    await auth.api.signOut({headers: await headers()}); // attention à bien passer les headers!
};