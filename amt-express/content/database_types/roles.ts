export const USER_ROLES = ['admin', 'driver', 'customer'] as const;

export type UserRole = typeof USER_ROLES[number];