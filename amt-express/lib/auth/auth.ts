import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import db from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import {nextCookies} from "better-auth/next-js";
import {admin} from "better-auth/plugins";
import {
    sendVerificationEmail,
    sendChangeEmailVerification,
    sendPasswordResetEmail,
} from "@/lib/utils/email";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail(user.email, url);
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendVerificationEmail(user.email, url);
        },
        sendOnSignUp: true,
        expiresIn: 86400, // 24h
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, newEmail, url }) => {
                await sendChangeEmailVerification(newEmail, url);
            },
        },
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
        nextCookies(),
        admin({
            defaultRole: "customer",
        }),
    ],
});