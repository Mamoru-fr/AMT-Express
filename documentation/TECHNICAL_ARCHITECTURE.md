# Architecture Technique — AMT Express

> Document de référence pour comprendre les décisions d'architecture, les patterns utilisés et comment étendre le projet.

---

## Table des matières

- [Stack technique et justifications](#stack-technique-et-justifications)
- [Patterns d'architecture](#patterns-darchitecture)
- [Page Rides — routage par rôle](#page-rides--routage-par-rôle)
- [Base de données — décisions de conception](#base-de-données--décisions-de-conception)
- [Authentification et autorisation](#authentification-et-autorisation)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Internationalisation](#internationalisation)
- [Améliorations futures](#améliorations-futures)

---

## Stack technique et justifications

### Next.js 16.1.1 (App Router)

**Pourquoi :**
- Server Components par défaut — bundles client plus légers, meilleure performance
- Server Actions — opérations serveur sans couche API REST supplémentaire
- Parallel Routes (`@admin`, `@driver`, `@customer`) — affichage conditionnel par rôle sans redirect

**Compromis :**
- La distinction Server / Client Component a une courbe d'apprentissage
- Certaines librairies tierces ne supportent pas encore les Server Components

### PostgreSQL via Neon (serverless)

**Pourquoi Neon :**
- Serverless avec auto-scaling, pas de serveur à gérer
- Branching de base de données (comme Git, utile pour staging/dev)
- Free tier généreux pour le développement

**Connexion :**
```typescript
// lib/db/drizzle.ts
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!); // HTTP-based, fonctionne en serverless
```

**Alternative locale :** `postgres-js` via `DB_DRIVER="postgres-js"` pour PostgreSQL classique (Docker).

### Drizzle ORM 0.45.1

**Pourquoi Drizzle plutôt que Prisma :**
- TypeScript-first : le schéma est défini en TypeScript, pas dans un DSL custom
- API SQL-like : si vous connaissez SQL, vous connaissez Drizzle
- Meilleur contrôle sur les jointures complexes et les agrégations
- Bundle plus léger

```typescript
const result = await db
  .select()
  .from(rides)
  .where(eq(rides.status, 'pending'))
  .leftJoin(drivers, eq(rides.driverId, drivers.id));
```

**Compromis :** Pas d'équivalent à Prisma Studio (interface visuelle).

### Better Auth 1.4.10

**Pourquoi Better Auth plutôt que NextAuth.js :**
- Typage TypeScript complet, sans `any`
- Conçu pour l'App Router Next.js
- Plugin `admin` intégré : gestion des rôles et bannissement
- Adaptateur Drizzle natif

**Compromis :** Communauté plus petite que NextAuth.js, moins d'intégrations tierces.

### Zod 4.3.5

Toutes les données entrantes passent par un schéma Zod dans les Server Actions avant d'atteindre la base de données.

```typescript
export const CreateRideSchema = z.object({
  departure: z.string().min(3),
  destination: z.string().min(3),
  departureTime: z.coerce.date().refine(d => d > new Date()),
  customerIds: z.array(z.string()).nonempty(),
});
```

### i18next + react-i18next

- Détection automatique de la langue depuis le navigateur
- Fallback vers `en` si la clé est absente dans la langue active
- Compatible Server Components via `I18nProvider`

```typescript
// services/i18next.ts
i18next.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'en',
  resources: { en: { translation: en }, fr: { translation: fr } },
});
```

---

## Patterns d'architecture

### Server-First

```
Navigateur
  └── Composants React ('use client') — état UI uniquement
        └── Server Actions (lib/actions/*.ts)
              └── Controllers (lib/controllers/)
                    └── Role Middleware (lib/middleware/roleMiddleware.ts)
                          └── Services (lib/services/)
                                └── Drizzle ORM → PostgreSQL
```

Avantages :
- Logique sensible jamais exposée au client
- Bundles client plus petits
- Pas besoin d'une couche API REST intermédiaire
- TypeScript bout en bout

### ActionResponse — retour uniforme

Toutes les Server Actions retournent un `ActionResponse<T>` :

```typescript
// lib/types/action-response.ts
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode };
```

### Organisation par feature

```
components/
├── admin/rideManagement/    # RidesManagementBoard, AddRideModal, EditRideModal…
├── dashboard/               # AdminDashboard, DriverDashboard
├── customer/                # Vues spécifiques client
├── driver/                  # Vues spécifiques chauffeur
└── classicComponents/       # Primitives UI réutilisables (Button, Input…)
```

---

## Page Rides — routage par rôle

La route `/rides` affiche une vue différente selon le rôle sans redirect :

```
/rides
  ├── Admin     → RidesManagementBoard  (CRUD complet)
  ├── Driver    → DriverRidesView       (3 onglets)
  └── Customer  → CustomerRidesView     (2 onglets)
```

### Server Actions (`lib/actions/ridesViewActions.ts`)

| Fonction | Description |
|----------|-------------|
| `fetchDriverAssignedRides()` | Courses pending/assigned du chauffeur connecté |
| `fetchDriverCompletedRides()` | Historique du chauffeur |
| `fetchPendingRides()` | Courses sans chauffeur (disponibles) |
| `fetchCustomerRequestedRides()` | Courses pending/assigned du client |
| `fetchCustomerCompletedRides()` | Historique du client |

Toutes retournent un `ActionResponse<T>` et vérifient le rôle via `verifyRole()`.

### Vue Chauffeur — 3 onglets

1. **Mes courses assignées** — à compléter
2. **Courses disponibles** — peut postuler
3. **Historique** — terminées

### Vue Client — 2 onglets

1. **Courses en cours** — pending / assigned
2. **Historique** — completed

---

## Base de données — décisions de conception

### Enums PostgreSQL

```typescript
export const rideStatusEnum = pgEnum('ride_status', ['pending', 'assigned', 'completed', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'driver', 'customer']);
```

Contrainte au niveau de la base — impossible d'insérer une valeur invalide.

### Cycle de vie d'une course

```
pending → assigned → completed
    └──────────────→ cancelled
```

### Relation many-to-many : rides ↔ customers

```typescript
export const rideCustomers = pgTable("ride_customers", {
  rideId: text("ride_id").references(() => rides.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating"),  // 1–5
  comment: text("comment"),
});
```

L'assignation chauffeur reste 1:1 dans `rides.driverId`.

### Hiérarchie Production → Projet → Course

```
productions (1) ──< (many) projects (1) ──< (many) rides
```

Permet la facturation groupée par production et les analytics par client.

### Options de course

- `ride_options` : catalogue avec prix de base
- `ride_selected_options` : options choisies par course avec le prix **au moment de la réservation**

Le prix de l'option peut évoluer dans le temps — la table `ride_selected_options` conserve l'historique.

### Politique de suppression

Suppressions définitives (hard delete) pour la conformité RGPD. La table `activity_logs` conserve la trace des actions avant suppression.

---

## Authentification et autorisation

### Flux

1. Inscription → `users` avec `role: 'customer'`
2. Connexion → token dans `session` (cookie HTTP-only)
3. Server Components → `getSessionWithRole()`
4. Server Actions → `verifyRole(requiredRole)`

### Couches d'autorisation

| Couche | Mécanisme |
|--------|-----------|
| Base de données | `userRoleEnum` — contrainte PostgreSQL |
| Server Action | `verifyRole()` — `UNAUTHORIZED` ou `FORBIDDEN` |
| Composant serveur | `getSessionWithRole()` — redirect ou rendu conditionnel |
| Composant client | `useSessionWithRole()` — rendu conditionnel **uniquement** (jamais seul comme garde) |

> Un composant client ne doit **jamais** être la seule garde de sécurité.

### Test

En `NODE_ENV=test`, `verifyRole()` bypasse la vérification et retourne un utilisateur fictif.

---

## Gestion des erreurs

### Codes d'erreur

```typescript
export enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### Pattern Server Action

```typescript
export async function createRide(input: unknown): Promise<ActionResponse<Ride>> {
  // 1. Vérifier le rôle
  const auth = await verifyRole('admin');
  if (!auth.success) return auth;

  // 2. Valider l'entrée
  const parsed = CreateRideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message, code: ErrorCodes.VALIDATION_ERROR };
  }

  // 3. Logique métier
  try {
    const ride = await rideService.create(parsed.data);
    return { success: true, data: ride };
  } catch {
    return { success: false, error: 'Database error', code: ErrorCodes.DATABASE_ERROR };
  }
}
```

---

## Internationalisation

- Langues : `fr` (défaut), `en` (fallback)
- Fichiers : `locales/fr.json`, `locales/en.json`
- Langue détectée depuis les préférences navigateur
- Clé manquante → fallback `en` sans erreur visible

Pour ajouter une langue : créer le fichier JSON dans `locales/` et l'enregistrer dans `services/i18next.ts`.

---

## Améliorations futures

| Fonctionnalité | Complexité | Notes |
|----------------|-----------|-------|
| GPS temps réel | Haute | WebSockets ou Server-Sent Events |
| OCR tickets | Moyenne | Google Vision API ou Tesseract |
| Paiement | Haute | Stripe — webhook pour confirmer le statut |
| Chat interne | Haute | Socket.io ou Pusher |
| Notifications push | Moyenne | Web Push API — Service Worker déjà en place |
| Synchronisation calendrier | Moyenne | Google Calendar API + OAuth |
| Soft delete | Faible | Ajouter `deletedAt` aux tables concernées |
| Pagination | Faible | `.limit().offset()` natif dans Drizzle |
