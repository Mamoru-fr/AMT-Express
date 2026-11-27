# Annexe #11 — Registre des vulnérabilités internes (version A4, 1 page)

> Journal des vulnérabilités **confirmées et corrigées** dans le code du projet (juillet - novembre 2026), aligné OWASP. Les CVE des dépendances sont documentées séparément en annexe #13. Principe : transparence (même les failles corrigées sont documentées), traçabilité (corrections datées, retrouvables dans l'historique Git), vérifiabilité.

| Date | ID | Vulnérabilité | Composant | Risque | Statut |
|------|----|---------------|-----------|--------|--------|
| 10/09 | AUDIT-001 | Contrôle d'accès défaillant (filtrage `customerId` manquant) | `RidesManagementActions.ts` | Critique | ✅ Corrigé |
| 12/09 | AUDIT-002 | Fuite de données (chauffeurs voyant toutes les courses) | `DriverDashboardService.ts` | Élevé | ✅ Corrigé |
| 15/09 | AUDIT-003 | Messages d'erreur détaillés (stack traces) | Server Actions | Moyen | ✅ Corrigé |
| 20/09 | AUDIT-004 | Validation manquante de l'import CSV | import CSV | Élevé | ✅ Corrigé |
| 02/10 | AUDIT-005 | Hiérarchie des rôles non vérifiée | `roleMiddleware.ts` | Moyen | ✅ Corrigé |
| 05/10 | AUDIT-006 | Sessions non invalidées après logout | Better Auth | Élevé | ✅ Corrigé |
| 15/10 | AUDIT-007 | Protection CSRF manquante sur certains formulaires | Formulaires | Moyen | ✅ Corrigé |

**Bilan** : 7 vulnérabilités internes corrigées, toutes validées par tests automatisés (244 tests), corrections revues par une instructrice Ada Tech School (16/10/2026), aucune exploitée en production. Veille externe : 3 alertes dépendances (annexe #13), dont la CVE `zod` restée , traitée en § 10 du dossier. Corrections datées détail ; workflow de gestion et outils de détection dans le dépôt.
