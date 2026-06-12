import {z} from 'zod';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {AdminDashboardService, AdminDashboardData} from '@/lib/services/AdminDashboardService';
import {verifyRole} from '@/lib/middleware/roleMiddleware';

/**
 * AdminDashboardController - Gère la sécurité et la validation
 * Délègue la logique métier à AdminDashboardService
 */
export class AdminDashboardController {
    /**
     * SÉCURITÉ: Vérifier que l'utilisateur est admin
     * Appelle le service pour récupérer les données
     */
    static async getAdminDashboardData(): Promise<ActionResponse<AdminDashboardData>> {
        try {
            // === SÉCURITÉ: Vérifier le rôle ===
            const roleCheck = await verifyRole('admin');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === APPEL AU SERVICE ===
            const data = await AdminDashboardService.getAdminDashboardData();

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error fetching admin dashboard:', error);
            return {
                success: false,
                error: 'Failed to fetch dashboard data',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }
}
