# 📐 Plan des 2 dossiers RNCP 37873 — AMT Express

**Sources officielles** : Guide de rédaction du Dossier Projet (RNCP 37873 CDA, 22 p.) · Feuille de suivi de rédaction (école) · Dossier projet « Ink&Voices » session Septembre 2026 (59 p., structure validée) · Référentiel CDA sur le Drive école.
**Calendrier** : fin de dev 15/11 · séminaire 16–20/11 · rendu semaine du 6–12/12 · soutenance semaine du 10–16/01/2027 · **50–80 pages**, imprimé en 2 exemplaires, remis au campus la veille de l'épreuve.

---

## 📁 DOSSIER PROJET — structure imposée (12 sections + annexes)

> Parcours : *quoi → pour qui → comment conçu → comment construit → comment vérifié → ce que j'en retiens*. Le jury **survole** le dossier quelques minutes avant la soutenance : soigner sommaire, titres, schémas, captures.

| # | Section | Ce que le jury attend | Nos matériaux | Manque |
|---|---|---|---|---|
| 1 | **Description du projet** | 200–250 mots, **FR + EN** (l'anglais = réécriture B1, pas une traduction) : contexte / quoi / pour qui / stack | projectBref.md (executive summary), Knowledge AMT | rédaction |
| 2 | **Liste des compétences du référentiel** | Tableau à 2 colonnes : les 11 compétences → où elles sont illustrées (section + page) | réferentiel (Drive), nos 3 chiffres 200/157/74 | tableau à dresser |
| 3 | **Cahier des charges** | Personas, user stories, MVP numéroté, **risques évalués** (risque/probabilité/impact/parade) — pas un copié-collé du brief client | projectBref.md (risques, contraintes, budget $0), functionalSpecifications (5 personas : Marc, Nathalie, Djamel, Jean-Michel, Claire) | analyse en « ta version » + risques structurés |
| 4 | **Spécifications fonctionnelles** (~¼ du dossier, **section critique**) | UML : cas d'utilisation + activité + classes · **MCD/MLD/MPD Merise** · maquettes : identité graphique, wireframes, hi-fi, enchaînement, **accessibilité RGAA** | functionalSpecifications (12 sections, flows Mermaid, personas), technicalSpecifications (ERD 20 tables, enums, index GIST) | UML (Mermaid ≠ UML : cas d'utilisation et classes à produire), MCD/MLD Merise, maquettes Figma |
| 5 | **Spécifications techniques** | Architecture **en couches** (schéma), sécurité **OWASP Top 10** point par point, **choix de stack justifiés**, RGPD (registre des traitements) | technicalSpecifications (couches, index, Zod vs contraintes, 2FA, rate limiting, RGPD 6 mois), amt-express.md | reformulation OWASP + justifications « pourquoi cette techno » |
| 6 | **Gestion de projet** | Planning/suivi (capture du board GitHub Projects), équipe (toi seul + client AMT + instructrice), **objectifs de qualité** (conventions, linter, couverture) | Git Flow documenté, 74 PR, issues GitHub, projectBref (communication plan, milestones) | captures du board + conventions explicitées |
| 7 | **Réalisation** | Extraits de code commentés (10–30 lignes + 1 paragraphe) : front non trivial, back (action + service), accès données (jointure), **sécurité en action**, 1 fonctionnalité bout-en-bout | technicalSpecifications (ActionResponse, transactions, verifyRole, createRide…), repo | choisir les 6–8 extraits + les commenter |
| 8 | **Tests** | **Jeu d'essai de la fonctionnalité la plus représentative** : pré-conditions, entrées, attendu, obtenu, écart · cas nominal + cas d'erreur · 1 fichier de test automatisé | 157 tests ActionResponse/ErrorCodes, Vitest, TESTS_REPORT.md | tableau de jeu d'essai rédigé |
| 9 | **Préparation du déploiement** (= CCP 3) | **3 environnements séparés obligatoires** (dev/staging/prod), CI (pipeline vert en capture), les 5 questions, stratégie de déploiement (interruption ? version ? rollback ?), documentation DEPLOYMENT.md | CI GitHub Actions 8 workflows, Vercel UAT/PROD + confirmation manuelle, Docker multi-étapes, db:backup | .env.example à créer (⚠ vigilance déjà notée), schéma infra, stratégie écrite |
| 10 | **Veille vulnérabilités** | Périodicité, sources, outils (npm audit, dependabot), **1 exemple concret de CVE traitée** | npm audit possible, GitHub advisories | à constituer (rituel + 1 exemple daté) |
| 11 | **Défis et recherche** | UN verrou technique raconté en 5 étapes : besoin → recherche (FR+EN, ≥1 source anglaise) → critères de sélection → solution → mise en œuvre. Une fausse piste corrigée = un atout | candidats : les 17 fix deploy consécutifs du 11/09, ou l'architecture ActionResponse/ErrorCodes, ou le cycle de statuts | à choisir et raconter |
| 12 | **Conclusion** | Bilan honnête, 3–5 axes d'amélioration **précis**, apprentissages | 3 axes déjà arrêtés : affectation auto des courses, OCR tickets, factures PDF | rédaction |
| — | **Annexes** | Diagrammes, MCD/MLD, wireframes, maquettes, flow, architecture, Swagger/README | documentation embarquée du repo (guide Git Flow, doc architecture, Docker, import CSV…) | consolidation |

**Cartographie CCP** : CCP 1 → sections 5/6/7 · CCP 2 → sections 3/4/5 · CCP 3 → section 9 + tests en CI. Le guide impose de vérifier : aucune des 11 compétences sans case.

---

## 📁 DOSSIER PROFESSIONNEL

- **Template officiel** : `NE_PAS_MODIFIER_TEMPLATE_DOSSIER_PROFESSIONNEL.docx` (Drive école, sept. 2026) — c'est LA trame à remplir, pas une structure libre.
- **Exemples** : Lauriane Marques Martins & LEVE Alix (Sept. 2026, les plus récents), Sonia, Hanaë.
- Contenu attendu : parcours et activités mappés sur les 3 CCP, avec preuves (AGL/Power Platform, AMT Express en production, 17 fix deploy = gestion d'incident).
- ❓ à confirmer : les consignes précises de remplissage (données dans le template docx — lecture à faire).

---

## ⚠️ Le trou dit trou

- **Les retours de l'instructrice sur le projet** : introuvables dans le Drive (la feuille de suivi de rédaction est un modèle **vierge** — colonnes « rédigé/relu » non remplies, aucun commentaire). À obtenir d'Alexis (mail ? Moodle ? Discord ?) avant d'intégrer quoi que ce soit.
- **Fichiers projet possiblement out of date** (signalé par Alexis) : les specs s'arrêtent à janv. 2026 (20 tables) alors que la Knowledge dit 19 tables ; l'ERD, la stack (Next 14 vs 16) et les features livrées sont à **vérifier contre le repo** avant rédaction.
- Demo2.pdf / Demo3.pdf : supports de démo passés — utiles pour captures d'écran, pas pour le fond.

## ✅ Prochains pas
1. ❓ Localiser les **retours de l'instructrice** (Alexis) — conditionne le point de départ de la rédaction du dossier projet.
2. 🔄 Vérifier les specs contre le **repo GitHub** (tables réelles, stack réelle, features livrées).
3. 📅 Rédiger **dans l'ordre du plan** : sections 1–3 (matière déjà là) → 4–5 (conversion Mermaid→UML/Merise) → 6–12.
4. 📅 Dossier professionnel : lire le template docx + 1 exemple récent, puis remplir.
5. 🔄 Poser les testings sur le projet (outils Garde-Manger : tsc, vitest).