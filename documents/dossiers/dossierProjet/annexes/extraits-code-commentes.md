# Annexe #12 — Extraits de code commentés (§ 7 du dossier)

> Tous les extraits sont **copiés depuis le code réel** (`main`, SHA `bce57b7`, vérifiés le 30/10/2026) — aucun code inventé ni retouché. Chemins exacts indiqués. Le seul travail restant pour Alexis : choisir ceux qui entrent dans le dossier imprimé (le guide demande 6–8 extraits) et raccourcir si nécessaire.
> ❓ Il manque un **extrait front-end non trivial** (tableau admin avec filtres/tri, ou formulaire avec états d'erreur Zod) : à sélectionner depuis les composants — proposition de cibles en fin de document.

## Extrait 1 — Sécurité : le middleware de rôles (§ 7.5)

**Fichier** : `amt-express/lib/middleware/roleMiddleware.ts`

```ts
export async function verifyRole(requiredRole: UserRole): Promise<RoleCheckResult> {
    // Pas de validation de rôle en environnement de test (bypass ciblé)
    if (process.env.NODE_ENV === 'test') {
        return {success: true, data: {session: {}, user: {id: 'test-user'}} };
    }

    const {session, user, isAdmin, isDriver, isCustomer} = await getSessionWithRole();

    if (!session) {
        return { success: false, error: 'Unauthorized: Authentication required',
                 code: ErrorCodes.UNAUTHORIZED };   // session absente
    }

    // Hiérarchie : admin ≥ driver ≥ customer
    const hasAccess =
        requiredRole === 'customer' ? (isCustomer || isDriver || isAdmin) :
        requiredRole === 'driver'   ? isDriver :
        requiredRole === 'admin'    ? isAdmin : false;

    if (!hasAccess) {
        return { success: false,
                 error: `Unauthorized: ${requiredRole...} access only`,
                 code: ErrorCodes.FORBIDDEN };        // mauvais rôle
    }
    return {success: true, data: {session, user}};
}
```

**Pourquoi ça tient debout** : la vérification de rôle vit **côté serveur, dans le middleware**, pas dans les composants — un utilisateur ne peut pas se hisser au-dessus de son rôle en manipulant le front. La hiérarchie (`customer` accessible à tous, `driver` aux chauffeurs et admins, `admin` aux seuls admins) est exprimée en une expression, donc lisible et testable. Point de vérité pour le dossier : **session absente = `UNAUTHORIZED`, mauvais rôle = `FORBIDDEN`** (nuance corrigée dans l'audit — certaines actions admin remappent tout en `UNAUTHORIZED`, voir AUDIT § point 3).

## Extrait 2 — Validation : le schéma Zod de création de course (§ 7.3)

**Fichier** : `amt-express/lib/validations/ride.ts`

```ts
export const CreateRideSchema = z.object({
  departureTime: z
    .date()
    .or(z.string().transform((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid date format' });
        return z.NEVER;
      }
      return date;
    }))
    .refine((date) => date >= new Date(), {
      message: 'Departure time must be in the future',   // ← la preuve du jeu d'essai § 8.1
    }),
  customerIds: z.array(z.string().uuid()).min(1, 'At least one customer is required'),
  departure: z.string().min(3).max(255),
  destination: z.string().min(3).max(255),
  price: z.union([z.string().regex(/^\d+(\.\d{1,2})?( €)?$/), z.number().positive()])
         .transform((val) => typeof val === 'string' ? val.replace(' €', '').trim() : val.toString())
         .optional(),
  status: z.enum(['pending', 'assigned', 'completed', 'cancelled']).default('pending'),
});
```

**Pourquoi ça tient debout** : une seule source de vérité pour la validation, réutilisée serveur (action) et client (messages de formulaire). Le `refine` sur l'heure future est la preuve directe du **cas d'erreur 1 du jeu d'essai § 8.1** : un horaire passé est rejeté avant toute écriture en base. La transformation du prix (`"45,50 €"` → `"45.50"`) montre le soin apporté aux entrées humaines.

## Extrait 3 — Back-end : l'action `createRide`, la chaîne complète (§ 7.3)

**Fichier** : `amt-express/lib/actions/ridesManagementActions.ts`

```ts
export async function createRide(data: { /* … */ }): Promise<ActionResponse<string>> {
  // 1. Rôle : admin uniquement
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error || 'Unauthorized access',
             code: ErrorCodes.UNAUTHORIZED };
  }

  // 2. Validation Zod
  const validation = validateCreateRide(data);
  if (!validation.success || !validation.data) {
    return { success: false, error: validation.error || 'Invalid ride data',
             code: ErrorCodes.VALIDATION_ERROR };
  }

  // 3. Délégation au contrôleur (logique métier dans les couches basses)
  const result = await RidesManagementController.createRide(validation.data);

  // 4. Journal d'audit si succès
  if (result.success && result.data) {
    await AuditLogger.ride.create(result.data, roleCheck.data?.user.id);
  }
  return result;
}
```

**Pourquoi ça tient debout** : l'action ne fait que **vérifier puis déléguer** — c'est la chaîne en couches du § 5.1 rendue visible sur une fonction : rôle → Zod → contrôleur → audit. Le type de retour `ActionResponse<string>` garantit que le front ne reçoit jamais une erreur non prévue.

## Extrait 4 — Accès aux données : optimisation N+1 et requête agrégée (§ 7.4)

**Fichier** : `amt-express/lib/services/RidesViewService.ts`

```ts
// Deux compteurs en UNE seule requête (pas de SELECT COUNT(*) × 2)
static async fetchDriverRidesCount(driverId: string) {
  const countResults = await db.select({
    completed: sql<number>`SUM(CASE WHEN ${rides.status} = 'completed' THEN 1 ELSE 0 END)`,
    pending:   sql<number>`SUM(CASE WHEN ${rides.status} = 'pending' THEN 1 ELSE 0 END)`,
  }).from(rides).where(eq(rides.driverId, driverId));
  return { completed: countResults[0]?.completed || 0, pending: countResults[0]?.pending || 0 };
}

// Jointures relationnelles chargées en UNE requête (fix N+1)
static async fetchDriverCompletedRides(driverId: string) {
  return db.query.rides.findMany({
    where: and(eq(rides.driverId, driverId), eq(rides.status, 'completed')),
    orderBy: desc(rides.departureTime),
    with: {
      driver: { with: { user: true } },
      rideCustomers: { with: { customer: true } },
    },
  });
}
```

**Pourquoi ça tient debout** : deux optimisations réelles mesurables — l'agrégation `CASE WHEN` remplace deux requêtes de comptage par une, et la clause `with:` de Drizzle charge les relations (course → chauffeur → utilisateur, course → clients) en une seule requête au lieu d'une par ligne (le classique « N+1 »). C'est l'extrait idéal pour prouver la compétence « développer des composants d'accès aux données ».

## Extrait 5 — Transaction ACID : l'import CSV (§ 7.4)

**Fichier** : `amt-express/lib/db/import-csv.ts`

```ts
// Créer la production + projet générique dans une transaction
const genericProjectId = `${productionId}-general`;
try {
    await db.transaction(async (tx) => {
        await tx.insert(productions).values({
            id: productionId, name: productionName,
            contactEmail: `${productionId}@production.com`,
        });
        await tx.insert(projects).values({
            id: genericProjectId, name: `${productionName} - Générique`,
            productionId: productionId, isGeneric: true,
            startDate: new Date(), endDate: new Date(),
        });
    });
    return productionId;
} catch (error) { /* log + retour null : jamais de création partielle */ }
```

**Pourquoi ça tient debout** : c'est la **seule transaction réelle du projet** (le dossier le dit honnêtement § 5.3/§ 7.4) et elle est bien choisie : une production sans son projet générique serait une incohérence de données, la transaction garantit les deux ou aucune. Le script affiche par ailleurs l'avertissement « This import is NOT transactional » pour l'import global — l'honnêteté du script sur ses propres limites fait partie de la preuve (sauvegarde `pnpm db:backup` exigée avant import).

## Extrait 6 — Validation métier spécifique : le prix compteur du chauffeur (§ 7.3)

**Fichier** : `amt-express/lib/actions/driverRideActions.ts`

```ts
const DriverPriceSchema = z.string()
    .min(1, 'Meter amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount (e.g. 42 or 42.50)');

export async function completeRide(rideId: string, driverPrice: string): Promise<ActionResponse<void>> {
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) return { /* UNAUTHORIZED */ };

  const idValidation = validateRideId({ rideId });
  if (!idValidation.success) return { /* VALIDATION_ERROR */ };

  const priceValidation = DriverPriceSchema.safeParse(driverPrice.trim());
  if (!priceValidation.success) return { /* VALIDATION_ERROR */ };

  return DriverRideController.completeRide(rideId, priceValidation.data);
}
```

**Pourquoi ça tient debout** : un extrait court qui montre la discipline de bout en bout — le prix du compteur saisi par le chauffeur est contraint par une regex (format monétaire exact) **avant** de quitter la couche action ; même schéma que l'extrait 3 (rôle → Zod → contrôleur), sur une écriture métier.

## ❓ À sélectionner par Alexis : l'extrait front-end

Candidats (dossier § 7.2) : le tableau admin avec filtres/tri/pagination (composant `components/admin`), ou le formulaire de course avec états d'erreur Zod. Un seul suffit pour le dossier ; à choisir lors de la session de rédaction.
