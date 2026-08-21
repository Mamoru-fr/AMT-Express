/**
 * Email utility — swap sendEmailImpl for a real provider (Resend, Nodemailer, etc.)
 * Set SMTP_FROM in .env for the sender address.
 */

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

async function sendEmailImpl(payload: EmailPayload): Promise<void> {
    // --- Replace this block with your email provider ---
    // Example with Resend:
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({ from: process.env.SMTP_FROM!, ...payload });
    // ---------------------------------------------------
    console.log('[Email] To:', payload.to);
    console.log('[Email] Subject:', payload.subject);
    console.log('[Email] Body:', payload.html);
}

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
    await sendEmailImpl({
        to,
        subject: 'Verify your email — AMT Express',
        html: `
            <h2>Email Verification</h2>
            <p>Click the link below to verify your email address:</p>
            <a href="${url}" style="display:inline-block;padding:12px 24px;background:#003366;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a>
            <p>This link expires in 24 hours.</p>
        `,
    });
}

export async function sendChangeEmailVerification(to: string, url: string): Promise<void> {
    await sendEmailImpl({
        to,
        subject: 'Confirm your new email — AMT Express',
        html: `
            <h2>Email Change Confirmation</h2>
            <p>Click the link below to confirm your new email address:</p>
            <a href="${url}" style="display:inline-block;padding:12px 24px;background:#003366;color:#fff;border-radius:6px;text-decoration:none;">Confirm Email</a>
            <p>This link expires in 1 hour. If you did not request this change, ignore this email.</p>
        `,
    });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
    await sendEmailImpl({
        to,
        subject: 'Reset your password — AMT Express',
        html: `
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${url}" style="display:inline-block;padding:12px 24px;background:#003366;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
            <p>This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
        `,
    });
}
