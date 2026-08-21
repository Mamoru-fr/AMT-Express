'use server';

import { ActionResponse } from '@/lib/types/action-response';
import { ProfileController } from '@/lib/controllers/ProfileController';

export async function updateName(formData: FormData): Promise<ActionResponse<void>> {
    const name = formData.get('name') as string;
    return ProfileController.updateName(name);
}

export async function changeEmail(formData: FormData): Promise<ActionResponse<void>> {
    const newEmail = formData.get('newEmail') as string;
    return ProfileController.changeEmail(newEmail);
}

export async function changePassword(formData: FormData): Promise<ActionResponse<void>> {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    return ProfileController.changePassword(currentPassword, newPassword);
}

export async function resendVerificationEmail(email: string): Promise<ActionResponse<void>> {
    return ProfileController.resendVerificationEmail(email);
}
