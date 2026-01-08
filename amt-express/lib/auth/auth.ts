import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import db from "@/lib/db/drizzle"; // Change l'import en fonction de TON projet
import * as schema from "@/lib/db/schema"; // Change l'import en fonction de TON projet
import {nextCookies} from "better-auth/next-js";
import {admin} from "better-auth/plugins";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true, // On active les comptes par email et mot de passe
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    plugins: [
        nextCookies(),  // ⚠ Permet de sauvegarder les cookies better-auth dans l'appli next
        admin({
            defaultRole: "customer", // Set default role for new users
        })  // Plugin admin pour gérer les roles et les bannissements des utilisateurs
    ],
});