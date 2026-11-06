# Annexe #13 — Veille sur les vulnérabilités : trois alertes réelles sur les dépendances du projet

> **Ce que ce document est** : la matière première factuelle du § 10 du dossier (l'exemple concret de CVE traitée, resté 🔴). La veille a été menée le **30/10/2026** par la maison, sur les **versions déclarées dans `amt-express/package.json` @ `main`** (`bce57b7`). Chaque entrée : identifiant, sévérité, mécanisme, exposition réelle d'AMT Express, version corrective, sources. **Ce que ce document n'est pas** : le récit de la décision — celui-ci n'appartient qu'au maître (quand il a vu l'alerte, ce qu'il a décidé, pourquoi). La trame de ce récit est en fin de document.
>
> ⚠️ **Honnêteté méthodologique** : les plages d'affectation sont portées par les *plages déclarées* (ex. `^4.3.5`) ; la version **réellement installée** vit dans le lockfile. Premier geste de vérification, avant toute décision : `pnpm ls zod better-auth next` — une seule commande rend le trio certain. AMT Express n'utilise pas `config.i18n` de Next (i18n via i18next), ce qui est une donnée d'exposition déterminée plus bas.

## Le trio, par ordre de pertinence pour le dossier

### ① GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404 — `zod` : épuisement mémoire (HAUT) — **le candidat recommandé pour le § 10**

- **Publié** : 1er octobre 2026 (GitHub Advisory Database, revu le 23/10/2026 ; NVD).
- **Versions affectées** : `zod < 4.6.6` — la déclaration du projet est `^4.3.5` → **affectée** tant que le lockfile n'atteint pas 4.6.6.
- **Sévérité** : High (CVSS v4 ; disponibilité : haute).
- **Mécanisme** : un tableau volumineux soumis à un schéma `$ZodArray` **sans contrainte de longueur** accumule un objet d'erreur par élément fautif, sans plafond ni terminaison anticipée → allocation massive → arrêt du process (DoS).
- **Exposition d'AMT Express** : la validation Zod est posée sur **toutes** les Server Actions — la porte d'entrée est réelle. L'import CSV (le seul flux qui avale de gros volumes de lignes) est le scénario de dossier idéal : il montre la faille *dans un parcours métier nommé du projet*.
- **Version corrective** : `zod@4.6.6` (correctif amont `colinhacks/zod@a0ebf97`).
- **Sources** : [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) · [NVD CVE-2023-54404](https://nvd.nist.gov/vuln/detail/CVE-2023-54404) · colinhacks/zod#1872, #6475, #6652.

### ② CVE-2026-110862 / GHSA-965c-763c-88jm — `better-auth` : contournement d'authentification (CRITIQUE, CVSS 9.1)

- **Publié** : 14 octobre 2026 (CVE reçue le 14/10, modifiée le 15/10).
- **Versions affectées** : `>= 1.4.0-beta.18 et < 1.7.7` — la déclaration du projet est `^1.4.10` → **dans la plage**.
- **Mécanisme** : réutilisation de la valeur d'état OAuth comme jeton Magic Link → un attaquant non authentifié peut ouvrir une session au nom d'une victime (ou créer un compte faussement vérifié). CWE-287.
- **Exposition d'AMT Express** : dépend des flux d'connexion effectivement activés — si le projet n'expose ni OAuth ni Magic Link (authentification par identifiants seules), **la porte de l'exploit n'est pas ouverte** ; c'est la première chose à constater pour le récit. Mise à jour recommandée dans tous les cas.
- **Version corrective** : `better-auth@1.7.7`.
- **Sources** : [GHSA-965c-763c-88jm](https://github.com/better-auth/better-auth/security/advisories/GHSA-965c-763c-88jm) · [fiche CVE](https://www.thehackerwire.com/vulnerability/CVE-2026-110862/) (EPSS 0,32 %).

### ③ CVE-2026-64642 — `next` : contournement de middleware (HAUT, CVSS 4.0 : 8.3) — non déclenchable selon toute vraisemblance, à dire tel quel

- **Divulgué** : release de sécurité Vercel du **21 juillet 2026**.
- **Versions affectées** : `next >= 16.0.0 et < 16.2.11` — le projet épingle `next@16.1.1` → **dans la plage**.
- **Mécanisme** : App Router **construit avec Turbopack** + **un seul locale** dans `config.i18n.locales` → certains chemins contournent la chaîne middleware/proxy, non authentifiés.
- **Exposition d'AMT Express** : l'i18n du projet passe par **i18next**, pas par `config.i18n` de Next — la condition de configuration **n'est pas remplie** ; et l'autorisation ne vit pas dans le middleware mais dans `verifyRole()` au cœur de chaque Server Action (cf. § 5.2 du dossier). Non exploitable en l'état ; mise à jour à prendre au prochain train de versions.
- **Version corrective** : `next@16.2.11`.
- **Sources** : [release de sécurité Vercel, 21/07/2026](https://nextjs.org/blog/july-2026-security-release) · [analyse CVE-2026-64642](https://www.ionix.io/threat-center/cve-2026-64642/).

## La trame du récit § 10 (au maître — cinq lignes suffisent)

Le jury attend : l'alerte (d'où vient-elle, quand), la lecture (comprendre le mécanisme), la décision (mettre à jour ou non, et pourquoi), la vérification (le test qui prouve que c'est derrière nous), et la leçon (ce que la méthode change). Le dossier sous-vend rarement : montrer qu'une CVE a été *lue* et *triée* (la ③ non déclenchable vaut autant de points que la ① corrigée) est exactement la posture « DevOps » du CCP 3.

> **Gestes suggérés** (le maître tranche) : `pnpm ls zod better-auth next` (état réel du lockfile) ; puis mise à jour ciblée `pnpm add zod@^4.6.6` + `pnpm ci` ; la capture `pnpm audit` (avant/après) est la pièce 🔴 qui va avec ce § 10.

---
*Veille menée par la maison le 30/10/2026, sur les versions déclarées du `package.json` à `bce57b7` — chaque plage d'affectation vérifiée contre l'advisory cité ; aucune version « supposée » : le lockfile reste à interroger par le geste ci-dessus.*
