# Annexe — Captures à faire (liste opératoire)

> Chaque ligne : **quoi capturer · où la prendre · cible dans le dossier · pièges**. Tout est aux mains du maître — je ne peux pas prendre des captures de son environnement. Une fois prises : les ranger dans un dossier `captures/` à côté des annexes et les référencer dans le corps du dossier.

| # | Capture | Où | Cible | Pièges |
| - | -------- | -- | ----- | ----- |
| 1 | Board GitHub Projects (colonnes + cartes) | Repo → onglet Projects | #7 · § 6.2 | cadrer sans emails/noms réels de clients |
| 2 | Graphe des PR (network/insights) | Repo → Insights → Network | § 6.2 | préférer une fenêtre large, plein écran |
| 3 | Pipeline CI vert (résumé + un job déroulé) | Actions → dernier run vert complet | #8 · § 9.2 | montrer le « all checks passed », pas juste un logo |
| 4 | Sortie `pnpm test` (240 passed) | Terminal local | #9 · § 8.2 | terminal plein écran ; masquer tout chemin sensible |
| 5 | Écran admin : liste des courses (FR, desktop) | Application PROD ou UAT | #10 · § 4.3 | données fictives ou anonymisées |
| 6 | Formulaire création de course + erreur Zod (départ trop court ou horaire passé) | Application | § 7.2 / § 8.1 | c'est la preuve du jeu d'essai — la capture d'erreur vaut de l'or |
| 7 | Dashboard KPI admin (Recharts) | Application | § 1.1 | veiller à des chiffres cohérents avec le dossier |
| 8 | Vue chauffeur mobile : courses dispo + toggle disponibilité | Application (devtools mobile) | #10 | mode responsive du navigateur suffit |
| 9 | Vue client mobile : réservation + historique + notation ★ | Application | #10 | inclure une note 1–5 visible |
| 10 | Un écran en EN (i18n) | Application (sélecteur de langue) | § 7.2 | même écran qu'une capture FR pour l'effet avant/après |
| 11 | État vide + état erreur (bannière) | Application (filtres sans résultat / hors ligne) | #10 | forcer l'état si nécessaire — c'est légal, c'est une maquette de démonstration |
| 12 | Import CSV : message de backup + avertissement « NOT transactional » | Terminal, script `import-csv` | § 5.3 | l'avertissement honnête est un argument qualité |
| 13 | Vercel : liste des déploiements PROD (état vert actuel) | Vercel dashboard | § 9 / § 11 | masquer URLs et variables d'environnement |
| 14 | Neon console : **région du projet uniquement** | Neon console | #11 (RGPD) | ⚠️ NE JAMAIS capturer la chaîne de connexion — flouter tout le reste ; seul le nom de région (ex. `aws-eu-central-1`) compte |

## Consignes générales

- **Anonymisation d'abord** : noms réels de clients/chauffeurs, emails, plaques d'immatriculation — remplacer ou flouter.
- **Résolution** : PNG, écran complet, pas de recadrage aggressif — le dossier est imprimé A4, une capture floue décrédibilise tout.
- **FR d'abord**, EN pour une seule vue de comparaison (i18n prouvé une fois suffit).
- Légende chaque capture dans le dossier (ce qu'on regarde, pourquoi c'est une preuve).
