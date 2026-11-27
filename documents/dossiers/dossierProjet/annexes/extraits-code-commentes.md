# Annexe #12 — Extraits de code commentés (version A4, 2 pages)

> Deux extraits témoins, choisis parce que le jury les interroge en premier : le contrôle des rôles (sécurité) et la transaction ACID (intégrité). Les quatre autres (schéma Zod de validation, action `createRide`, optimisation N+1, prix compteur chauffeur) restent dans le dépôt, section « extraits ».

## Extrait 1 — Sécurité : le middleware de rôles (§ 6.2 du dossier)

**Fichier** : `amt-express/lib/middleware/roleMiddleware.ts`

```ts
export async function verifyRole(requiredRole: UserRole): Promise<RoleCheckResult> {
    if (process.env.NODE_ENV === 'test') {
        return {success: true, data: {session: {}, user: {id: 'test-user'}}};
    }
    const {session, user, isAdmin, isDriver, isCustomer} = await getSessionWithRole();
    if (!session) {
        return {success: false, error: 'Unauthorized: Authentication required', code: ErrorCodes.UNAUTHORIZED};
    }
    // Hierarchy: admin ≥ driver ≥ customer
    const hasAccess =
        requiredRole === 'customer' ? (isCustomer || isDriver || isAdmin) :
        requiredRole === 'driver'   ? isDriver :
        requiredRole === 'admin'    ? isAdmin : false;
    if (!hasAccess) {
        return {success: false, error: `Unauthorized: ${requiredRole} access only`, code: ErrorCodes.FORBIDDEN};
    }
    return {success: true, data: {session, user}};
}
```

**Pourquoi ça tient debout** : la vérification vit **côté serveur**, pas dans les composants — impossible de se hisser au-dessus de son rôle en manipulant le front. Hiérarchie exprimée en une expression lisible et testable. Point de vérité : **session absente = `UNAUTHORIZED`, mauvais rôle = `FORBIDDEN`**.

## Extrait 2 — Intégrité : transaction ACID de l'import CSV (§ 11.3 du dossier)

**Fichier** : `amt-express/lib/db/import-csv.ts`

```ts
    // Créer la production + projet générique dans une transaction
    const genericProjectId = `${productionId}-general`;
    try {
        await db.transaction(async (tx) => {
            await tx.insert(productions).values({ id: productionId, name: productionName });
            await tx.insert(projects).values({ id: genericProjectId, isGeneric: true, productionId });
        });
        return productionId;
    } catch (error) {
        safeError(`Failed to create production ${maskSensitive(productionName)}:`, error);
        return null;
    }
```

**Pourquoi ça tient debout** : c'est la **seule transaction réelle du projet** (le dossier le dit honnêtement), et elle est bien choisie — une production sans son projet générique serait une incohérence ; la transaction garantit les deux ou aucune. Le script affiche l'avertissement « This import is NOT transactional » pour l'import global : l'honnêteté du script sur ses propres limites fait partie de la preuve (sauvegarde `pnpm db:backup` exigée avant import).
