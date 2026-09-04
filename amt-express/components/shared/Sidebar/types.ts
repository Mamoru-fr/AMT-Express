import { LucideIcon } from 'lucide-react';

// Type pour un élément de navigation (onglet individuel)
export type NavItem = {
    href: string;
    label: string; // Clé de traduction (ex: 'adminNavigation.dashboard')
    description?: string; // Clé de traduction pour la description
    icon: LucideIcon;
    groupId: string; // ID du groupequel il appartient
    priority?: number; // Priorité d'affichage (plus la valeur est basse, plus il est prioritaire)
    match?: (url: string) => boolean; // Fonction pour vérifier si l'URL correspond
    matchMode?: 'exact' | 'ancestor';
};

// Type pour un groupe d'onglets (ex: "Trajets", "Administration")
export type NavGroup = {
    id: string;
    label: string; // Clé de traduction (ex: 'adminNavigation.rides')
    icon: LucideIcon;
    priority: number; // Priorité de dépliage (plus la valeur est basse, plus le groupe est prioritaire)
    isCollapsible?: boolean; // Peut-il être réduit en popup sur mobile ?
};

// Type pour un onglet de la bottom tab bar
export type BottomTabItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string; // Si défini, c'est un lien direct
    groupId?: string; // Si défini, ouvre un popup avec les onglets du groupe
};

// Type pour les paramètres utilisateur (style de la bottom tab bar)
export type SidebarSettings = {
    bottomTabBarStyle: 'iconsOnly' | 'iconsAndLabels';
};

// Type pour les éléments de la section utilisateur (profil, paramètres, etc.)
export type UtilityItem = {
    href?: string; // Lien pour les liens (ex: /profile, /settings)
    label: string; // Clé de traduction
    icon: LucideIcon;
    action?: () => void; // Action pour les boutons (ex: déconnexion)
    type: 'link' | 'button' | 'dropdown';
};

// Type pour les données exportées par chaque sidebar (Admin, Driver, Customer)
export type SidebarData = {
    navItems: NavItem[];
    navGroups: NavGroup[];
    utilityItems: UtilityItem[];
    brandTitle: string; // Clé de traduction pour le titre de la marque
    brandSubtitle: string; // Clé de traduction pour le sous-titre de la marque
};
