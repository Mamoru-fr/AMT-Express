import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import db from "@/lib/db/drizzle"; // Change l'import en fonction de TON projet
import * as schema from "@/lib/db/schema"; // Change l'import en fonction de TON projet
import {nextCookies} from "better-auth/next-js";
import {admin} from "better-auth/plugins";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true, // Activate email and password authentication
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
        nextCookies(),  // ⚠ Allows saving better-auth cookies in the next.js app
        admin({
            defaultRole: "customer", // Set default role for new users
        })  // Admin plugin to manage user roles and bans
    ],
});