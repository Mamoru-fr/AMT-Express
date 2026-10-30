# Audit de consolidation du dossier — 30/10/2026

> Mission du maître (29/10, bureau) : *« lire le dossier RNCP de la branche `documentation`, repérer les manques et les produire »*. Ce document est le journal de ce qui a été trouvé, produit, et de ce qui reste aux mains du maître. Tout ce qui est marqué « vérifié » l'a été contre `main` (SHA `bce57b7`, celui des notes de rédaction du dossier).

## Ce qui a été produit dans cette PR

| Pièce | Répond à | Fichier |
| --- | --- | --- |
| ERD exhaustif des 19 tables (généré du schéma réel, toutes colonnes, index, FK) | Annexe #2 🔴 du dossier | `annexes/ERD-19-tables.md` |
| Registre des traitements RGPD (structure conforme, décisions ❓ signalées) | § 5.2 🔴 + annexe #11 | `annexes/registre-traitements-rgpd.md` |
| 6 extraits de code commentés, sourcés du code réel | § 7 🔴 + annexe #12 | `annexes/extraits-code-commentes.md` |
| Veille sur les vulnérabilités : 3 alertes réelles sourcées sur les versions du `package.json` (zod HIGH — candidat § 10 ; better-auth CRITIQUE ; next HIGH non déclenchable) | § 10 🔴 + annexe #13 | `annexes/veille-vulnerabilites.md` |

## Fragilités trouvées dans le dossier (corrections factuelles proposées)

Trois points où le dossier de la branche `documentation` dit quelque chose que le code contredit, **avec preuves**. Le maître valide, et la correction va dans `dossierProjetRNCP.md` (je n'ai pas touché au corps du dossier dans cette PR : correction d'un fichier de 49 ko = relecture entière de sa part, ça se mérite un commit à part).

**1. La notation ne vit pas dans `rides`** — le diagramme de classes (§ 4.1) place « notation 1–5 étoiles + commentaire » dans l'entité `Ride`. Vérifié dans `schema.ts` : `rides` n'a **aucune** colonne de notation ; la notation vit dans `ride_customers.rating` (integer) + `ride_customers.comment`. Conséquence de fond : une notation est émise **par un client pour une course** — le modèle est juste dans le code, le diagramme doit suivre (et le MCD gagnerait à le dire : l'association porteuse `transporte` porte la note).

**2. Le parcours « demande d'assignation » est plus livré que le dossier ne le dit** — § 4.1 et § 7.6 présentent la validation admin comme « objectif — non livré ». Vérifié dans `ridesManagementActions.ts` : `approveAssignmentRequest`, `rejectAssignmentRequest` et `getAssignmentRequestsForRide` **existent** (actions admin, déléguées au contrôleur). Reste à confirmer dans `RidesManagementController`/`RidesManagementService` : la transaction d'assignation et le rejet automatique des demandes concurrentes — c'est probablement ça qui n'est pas livré, pas la validation elle-même. À nuancer dans le dossier : le jury aime les dossiers qui ne sous-vendent pas.

**3. `UNAUTHORIZED` vs `FORBIDDEN`** — le jeu d'essai § 8.1 (cas d'erreur 2) dit « rôle non autorisé → `UNAUTHORIZED` ». Le middleware dit autre chose : session absente → `UNAUTHORIZED`, mauvais rôle → `FORBIDDEN`. Nuance qui compte en soutenance (le jury connaît les codes HTTP). À corriger dans le jeu d'essai. **Découverte de code au passage** : les actions admin remappent tout échec de rôle en `UNAUTHORIZED` (perte du `FORBIDDEN` du middleware) — incohérence réelle du code, à lister dans les axes d'amélioration plutôt qu'à cacher.

**4. `assignment_requests.shift_id` manque aux diagrammes** — le schéma a une FK `shift_id` (nullable, vers `shift_planning`) : une demande d'assignation peut être liée au shift du chauffeur. Absente du diagramme de classes et du MCD du dossier. À ajouter (l'ERD de cette PR la montre).

**5. `ride_selected_options.price` : le prix est un instantané** — la table associative porte son propre `price` (figé au moment de la sélection), pas une relecture de `ride_options.additional_price`. Décision de conception sensée (le tarif d'une option peut changer ; la course facturée, non) — mais le diagramme de classes ne la montre pas. Une ligne suffit.

## Points du dossier confirmés par le code (pas de correction nécessaire)

- 19 tables, 5 enums, FK `SET NULL`/`CASCADE`, index mono-colonne uniquement ✅ ;
- « horaire passé rejeté par Zod » du jeu d'essai ✅ (`refine(date >= new Date())` dans `validations/ride.ts`) ;
- une seule transaction réelle (production + projet générique de l'import CSV) ✅ ;
- `invoices`/`invoice_items` présentes mais **sans aucune FK vers le reste du schéma** — cohérent avec « module non livré » ✅ ;
- `logo.svg` bien **absent** de `public/` alors que le README le référence ✅ (fragilité déjà notée § 4.3 — confirmée, à produire ou à retirer).

## Ce qui reste aux mains du maître (rien de tout ça ne se délègue)

1. **Captures** (annexes #7, #8, #9, #10) : board GitHub Projects, pipeline CI vert, sortie `pnpm test`, écrans de l'application (FR/EN, desktop/mobile, états vide/erreur) — je ne peux pas les prendre à sa place.
2. **§ 2 : la numérotation officielle des 11 compétences** (référentiel Drive école) — accès que je n'ai pas ; la trame du tableau est prête, il reste à coller les intitulés exacts.
3. **§ 11 : le récit du verrou technique** — les 17 fix deploy : ce qui a réellement débloqué (version CLI ? variable ? config ?) et la fausse piste, seul le maître s'en souvient. La trame 5 étapes est prête.
4. **§ 10 : un exemple concret de CVE traitée** — la matière première factuelle est prête (**annexe #13**, ajoutée en relance 12h15 du 30/10 : trois CVE réelles, datées, sourcées, avec exposition d'AMT Express et versions correctives ; candidat recommandé : `zod` GHSA-mrhx-c7xc-m3w5, publié le 01/10/2026). Reste au maître : le geste de vérification (`pnpm ls zod better-auth next`), la mise à jour éventuelle, la capture `pnpm audit`, et le récit de sa décision.
5. **Wireframes / maquettes / identité graphique** (§ 4.3) — à produire, même rétroactivement.
6. **Registre RGPD** : valider les ❓ (durées, base légale de la position, DPO, localisation des datacenters Neon/Vercel).
7. **Dossier professionnel** : template docx + exemples du Drive école — hors de ma portée.

## Signal de code (pas du dossier) — à garder pour un chantier futur

- `RidesViewService.fetchCustomerCompletedRides` : le commentaire dit « OPTIMIZED: Filters on ride.status directly in SQL (no in-memory filtering) » alors que le code filtre **en mémoire** (`.filter()` après requête). Un commentaire qui ment sur son code — à corriger dans le code, pas dans le dossier.
- Colonnes `NOT NULL` + `ON DELETE SET NULL` (détail dans `annexes/ERD-19-tables.md`) : le `SET NULL` échouera à l'exécution sur ces colonnes si la ligne référencée est supprimée. Non bloquant, à documenter comme dette connue.

*Audit mené par Ada, sur la base du code réel uniquement — aucun fait inventé, chaque affirmation vérifiable par le chemin de fichier indiqué.*
