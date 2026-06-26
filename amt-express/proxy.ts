import { NextResponse, type NextRequest } from 'next/server';
import { getSessionWithRole } from './lib/auth/session';

/**
 * Proxy (ex-Middleware) pour AMT-Express
 * Gère :
 * - L'authentification globale
 * - Les redirections basées sur les rôles (admin, driver, customer)
 * - Les headers de sécurité
 * - Les paths publics vs privés
 */
export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // =============================================
  // 1. Ignorer les requêtes statiques et API
  // =============================================
  const staticPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/public',
  ];

  if (staticPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // =============================================
  // 2. Récupérer la session et les rôles
  // =============================================
  const { isAuthenticated, isAdmin, isDriver, session } = await getSessionWithRole();

  // =============================================
  // 3. Définir les paths publics (accessibles sans auth)
  // =============================================
  const publicPaths = [
    '/connections',
    '/', // Page d'accueil (redirige vers /connections si non authentifié)
  ];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  // =============================================
  // 4. Rediriger les utilisateurs non authentifiés
  // =============================================
  if (!isAuthenticated && !isPublicPath) {
    // Conserver l'URL de retour pour rediriger après connexion
    const returnTo = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/connections?returnTo=${returnTo}`, request.url));
  }

  // =============================================
  // 5. Protéger les routes admin
  // =============================================
  const adminPaths = [
    '/admin',
    '/admin/ride-management',
    '/admin/ride-management/new',
  ];

  if (adminPaths.some(path => pathname.startsWith(path)) && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // =============================================
  // 6. Protéger les routes driver
  // =============================================
  const driverPaths = [
    '/driver',
    '/driver/dashboard',
  ];

  if (driverPaths.some(path => pathname.startsWith(path)) && !isDriver) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // =============================================
  // 7. Protéger les routes customer (si besoin)
  // =============================================
  // Note: Pour l'instant, le customer dashboard est accessible via / (Parallel Routes)
  // Si tu ajoutes des routes spécifiques pour customer, décommente cette section
  // const customerPaths = ['/customer'];
  // if (customerPaths.some(path => pathname.startsWith(path)) && !isCustomer) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  // =============================================
  // 8. Ajouter des headers de sécurité globaux
  // =============================================
  const response = NextResponse.next();

  // --- Sécurité contre le clickjacking ---
  response.headers.set('X-Frame-Options', 'DENY');

  // --- Empêcher le MIME-sniffing ---
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // --- Politique de référent ---
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // --- Politique des permissions (désactive l'accès aux fonctionnalités sensibles) ---
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // --- Header personnalisé pour AMT-Express ---
  response.headers.set('X-AMT-Express', 'Proxy-Processed');

  return response;
}

// =============================================
// 9. Configuration du matcher
// =============================================
// Appliquer le Proxy à toutes les requêtes SAUF :
// - /_next/... (fichiers statiques de Next.js)
// - /api/... (API Routes)
// - /favicon.ico
// - /public/... (fichiers statiques)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
