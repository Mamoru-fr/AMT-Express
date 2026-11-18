# Annexe #13 — Veille sur les vulnérabilités : trois alertes réelles (version A4, 1 page)

> Matière première factuelle du § 10 du dossier. Veille menée le **30/10/2026** sur les versions déclarées du `package.json` (`bce57b7`) ; le trio de versions réellement installées se vérifie par `pnpm ls zod better-auth next`. Le récit de la décision (quand, quoi, pourquoi) appartient au maître ; le jury attend alerte, lecture, décision, vérification, leçon.

## ① `zod` — épuisement mémoire (CVE-2023-54404 / GHSA-mrhx-c7xc-m3w5, HAUT) — le candidat du § 10, resté 

- **Plage affectée** : `zod < 4.6.6` ; le projet déclare `^4.3.5` → affecté tant que le lockfile n'atteint pas 4.6.6.
- **Mécanisme** : un tableau volumineux soumis à un schéma `$ZodArray` sans contrainte de longueur accumule une erreur par élément fautif, sans plafond → allocation massive → DoS.
- **Exposition** : la validation Zod est posée sur toutes les Server Actions ; l'import CSV (gros volumes de lignes) est le scénario métier réel.
- **Correctif** : `zod@4.6.6`. Sources : [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) · [NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-54404).

## ② `better-auth` — contournement d'authentification (GHSA-965c-763c-88jm, CRITIQUE, CVSS 9.1) — à neutraliser

- **Plage affectée** : `>= 1.4.0-beta.18 et < 1.7.7` ; le projet déclare `^1.4.10` → dans la plage.
- **Mécanisme** : réutilisation de l'état OAuth comme jeton Magic Link → ouverture de session au nom d'une victime (CWE-287).
- **Exposition** : dépend des flux activés ; si le projet n'expose ni OAuth ni Magic Link, la porte n'est pas ouverte — à constater pour le récit. **Correctif : `better-auth@1.7.7`** quoi qu'il en soit.

## ③ `next` — contournement de middleware (CVE-2026-64642, HAUT) — non déclenchable, à dire tel quel

- **Plage affectée** : `next >= 16.0.0 et < 16.2.11` ; le projet épingle `16.1.1` → dans la plage.
- **Mécanisme** : App Router **construit avec Turbopack** et **un seul locale** dans `config.i18n.locales` → certains chemins contournent le middleware.
- **Exposition** : l'i18n du projet passe par i18next, pas par `config.i18n` de Next ; l'autorisation vit dans `verifyRole()` au cœur de chaque Server Action (cf. § 6.2 du dossier) → non exploitable en l'état. **Correctif : `next@16.2.11`** au prochain train de versions.

*Lire une CVE et la trier honnêtement (la ③ non déclenchable vaut autant que la ① corrigée) est exactement la posture « DevOps » attendue ; la capture `pnpm audit` avant/après est la pièce  qui va avec le § 10.*
