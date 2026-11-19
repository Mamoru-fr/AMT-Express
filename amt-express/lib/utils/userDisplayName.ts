/**
 * Affichage du nom d'un utilisateur, avec gestion RGPD des comptes anonymisés.
 *
 * Un compte "supprimé" (droit à l'effacement) n'est PAS effacé de la base :
 * sa ligne est anonymisée (name vidé, banReason = ACCOUNT_DELETED_MARKER).
 * Chaque vue qui affiche un nom d'utilisateur passe par ce helper pour
 * afficher la traduction « Utilisateur supprimé » au lieu du nom brut.
 */

/** Marqueur posé sur users.banReason pour distinguer une anonymisation RGPD d'un ban modérateur. */
export const ACCOUNT_DELETED_MARKER = 'account_deleted';

/** Fonction de traduction minimale (compatible useTranslation / i18next). */
export type TTranslate = (key: string) => string;

/** Forme minimale d'un utilisateur affichable (name OU banReason facultatifs). */
export interface DisplayableUser {
    name?: string | null;
    banReason?: string | null;
}

/**
 * Nom affichable d'un utilisateur :
 * - compte anonymisé (marqueur RGPD) → traduction « Utilisateur supprimé »
 * - user absent ou nom vide (cas des lignes déjà anonymisées) → même traduction
 */
export function getUserDisplayName(
    user: DisplayableUser | null | undefined,
    t: TTranslate,
): string {
    if (!user || user.banReason === ACCOUNT_DELETED_MARKER || !user.name) {
        return t('account.deletedUser');
    }
    return user.name;
}
