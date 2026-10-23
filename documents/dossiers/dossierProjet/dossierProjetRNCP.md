
<div align="center" style="page-break-after: always; text-align: center; padding-top: 120px; font-family: 'Segoe UI', Arial, sans-serif;">

<p style="letter-spacing: 3px; color: #176B87; font-size: 13pt; margin-bottom: 40px; text-transform: uppercase;">Titre professionnel RNCP 37873 — Niveau 6</p>

<h1 style="font-size: 26pt; color: #060605; border: none; margin-bottom: 8px;">Dossier de projet</h1>
<p style="font-size: 14pt; color: #555; margin-top: 0;">Session janvier 2027</p>

<p style="font-size: 13pt; color: #176B87; font-weight: bold; margin-top: 40px;">Concepteur Développeur d'Applications</p>

<hr style="width: 60px; border: none; border-top: 3px solid #F4A259; margin: 30px auto;" />

<p style="font-size: 20pt; font-weight: bold; color: #060605; margin: 20px 0 6px;">AMT Express</p>
<p style="font-size: 12pt; color: #555; margin-top: 0;">Plateforme web de gestion de courses pour entreprises de transport VTC / taxi</p>

<p style="margin-top: 60px; font-size: 12pt;"><strong>Alexis SANTOS</strong><br/>Promo Janvier 2026 — Ada Tech School</p>

<table style="margin: 40px auto; border-collapse: collapse; font-size: 10pt; color: #333;">
<tr><td style="padding: 6px 18px; border: 1px solid #ccc;"><strong>Client réel</strong></td><td style="padding: 6px 18px; border: 1px solid #ccc;">AMT CGS GROUPE (~200 chauffeurs)</td></tr>
<tr><td style="padding: 6px 18px; border: 1px solid #ccc;"><strong>Stack</strong></td><td style="padding: 6px 18px; border: 1px solid #ccc;">Next.js 16 · TypeScript · PostgreSQL (Neon) · Drizzle</td></tr>
<tr><td style="padding: 6px 18px; border: 1px solid #ccc;"><strong>Statut</strong></td><td style="padding: 6px 18px; border: 1px solid #ccc;">MVP déployé en production — 240 tests au vert</td></tr>
</table>

</div>

<div style="page-break-after: always;">

## Sommaire

| # | Section | Contenu clé |
|---|---------|-------------|
| 1 | Présentation du projet | FR + EN, le problème et la solution |
| 2 | Compétences du référentiel | mapping CCP 1–3 → sections |
| 3 | Cahier des charges | contexte, personas, user stories, MVP, risques |
| 4 | Spécifications fonctionnelles | UML, MCD/MLD/MPD, maquettes, navigation |
| 5 | Spécifications techniques | architecture en couches, OWASP, stack justifiée |
| 6 | Gestion de projet | Git Flow, planning, qualité |
| 7 | Réalisation | architecture du code, extraits, parcours métier |
| 8 | Tests | jeu d'essai, 240 tests automatisés |
| 9 | Préparation au déploiement (CCP 3) | environnements, CI/CD, rollback |
| 10 | Veille sur les vulnérabilités | sources, exemple concret |
| 11 | Défis et recherche | verrou technique : 17 fix deploy |
| 12 | Conclusion | bilan honnête, axes d'amélioration |
| — | Annexes | inventaire des pièces à monter |

</div>

> **Légende des statuts de validation** — <span style="color:#2e7d32;">✅ rédigé et vérifié</span> · <span style="color:#e6a817;">🟡 rédigé, à valider par Alexis</span> · <span style="color:#c62828;">🔴 à produire (capture, maquette, précision chiffrée)</span> · ❓ à confirmer avec le code ou l'école
>
> *Document mis en forme pour impression A4 : sauts de page explicites, schémas vectoriels Mermaid, tableaux à lire en 5 secondes — le jury reçoit le dossier imprimé.*

---

## 1. Présentation du projet

### 1.1. Présentation en français 🟡

Dans le secteur du transport VTC/taxi, les petites et moyennes entreprises gèrent encore leurs courses, leurs chauffeurs et leur facturation avec des outils manuels : tickets papier, dispatch par téléphone, factures Excel. Pour une société comme AMT CGS GROUPE et ses ~200 chauffeurs, cela se traduit par des erreurs de saisie, des temps d'inactivité pour les chauffeurs et des retards de paiement.

AMT Express est une plateforme web full-stack qui centralise la gestion des courses pour trois rôles : les **administrateurs** (création et assignation des courses, tableaux de bord KPI), les **chauffeurs** (courses disponibles, demandes d'assignation, planning de shifts) et les **clients professionnels** de nombreux secteurs (réservation, historique, notation).

L'application est développée en TypeScript avec Next.js 16 (App Router), une base PostgreSQL hébergée sur Neon, l'ORM Drizzle, l'authentification Better Auth et la validation Zod. Elle peut être conteneurisée avec Docker, testée avec Vitest (unitaires et intégration) et déployée sur Vercel via une CI GitHub Actions, selon un Git Flow strict. Le projet a été développé en autonomie complète, de l'analyse des besoins à la mise en production, avec un budget de 0 € (free tiers).

<div align="center" style="border: 1px solid #176B87; border-radius: 10px; padding: 14px 18px; margin: 16px 0; background: #F0F7FA;">

**AMT Express en 4 chiffres** —  <span style="font-size: 15pt; color:#176B87;"><strong>200</strong></span> chauffeurs gérés (client réel) · <span style="font-size: 15pt; color:#176B87;"><strong>19</strong></span> tables PostgreSQL · <span style="font-size: 15pt; color:#176B87;"><strong>240</strong></span> tests automatisés au vert · <span style="font-size: 15pt; color:#176B87;"><strong>0 €</strong></span> de budget

</div>

### 1.2. Présentation en anglais 🟡

In the private-hire and taxi sector, small and medium companies still manage rides, drivers and billing with manual tools: paper tickets, phone dispatch, and Excel invoices. For a company like AMT CGS GROUPE and its ~200 drivers, this means typing errors, idle time between rides, and late payments.

AMT Express is a full-stack web platform that centralises ride management for three roles: administrators (ride creation and assignment, KPI dashboards), drivers (available rides, assignment requests, shift planning) and professional customers from the film and event industries (booking, history, ratings).

The application is built in TypeScript with Next.js 16 (App Router), a PostgreSQL database hosted on Neon, Drizzle ORM, Better Auth for authentication and Zod for validation. It can be containerised with Docker, tested with Vitest (unit and integration), and deployed to Vercel through GitHub Actions CI, following a strict Git Flow. The project was built entirely on my own, from requirements analysis to production, on a $0 budget (free tiers).

---

## 2. Liste des compétences du référentiel

Ce projet mobilise l'ensemble des compétences du titre professionnel Concepteur Développeur d'Applications (RNCP 37873, niveau 6). 🟡 *(numérotation exacte des compétences à coller depuis le référentiel officiel — Drive école)*

| Bloc | Compétence | Où c'est traité |
| ---- | ---------- | --------------- |
| CCP 1 | Installer et configurer son environnement de travail | § 5.3 (stack, pnpm, Docker) · § 6.1 |
| CCP 1 | Développer des interfaces utilisateur | § 7.2 (front-end, parallel routes, responsive, a11y) |
| CCP 1 | Développer des composants métier | § 7.3 (services, controllers) |
| CCP 1 | Contribuer à la gestion d'un projet informatique | § 6 (planning, Git Flow, qualité) |
| CCP 2 | Analyser les besoins et maquetter une application | § 3 (cahier des charges) · § 4.3 (maquettes) |
| CCP 2 | Définir l'architecture logicielle d'une application | § 5.1 (couches) · § 7.1 |
| CCP 2 | Concevoir et mettre en place une base de données relationnelle | § 4.2 (MCD/MLD/MPD, 19 tables) |
| CCP 2 | Développer des composants d'accès aux données | § 7.4 (Drizzle, jointures, optimisation SQL) |
| CCP 3 | Préparer et exécuter les plans de tests | § 8 (jeu d'essai, Vitest, CI) |
| CCP 3 | Préparer et documenter le déploiement | § 9 (environnements, CI/CD, Docker, README) |
| CCP 3 | Contribuer à la mise en production dans une démarche DevOps | § 9.2–9.5 (Vercel UAT/PROD, rollback) |

---

## 3. Cahier des charges

### 3.1. Contexte du projet 🟡

AMT CGS GROUPE est une société de transport VTC comptant environ **200 chauffeurs**, dont les clients sont principalement des **productions cinéma et des entreprises de toutes sortes**. Avant le projet, l'ensemble du cycle opérationnel était géré manuellement :

| Point de douleur | Processus existant | Impact |
| ---------------- | ------------------ | ------ |
| Saisie manuelle des courses | Tickets papier retranscrits | erreurs, délais, ~10 h/semaine perdues |
| Assignations inefficaces | Dispatch par téléphone | jusqu'à 20 % de temps d'inactivité chauffeur |
| Pas de visibilité | Clients appellent pour connaître l'état | insatisfaction, courses perdues |
| Facturation manuelle | Factures Excel | retards de paiement, erreurs |

En tant que Tech Lead / Project Manager unique du projet, j'ai conçu et développé une plateforme qui remplace ces processus : AMT Express, application web full-stack responsive (desktop + mobile, PWA).

```mermaid
flowchart LR
    subgraph AVANT["❌ Avant — tout manuel"]
        A1[Tickets papier] --> A2[Dispatch téléphonique] --> A3[Factures Excel] --> A4((Erreurs<br/>retards<br/>inactivité))
    end
    subgraph APRES["✅ Avec AMT Express"]
        B1[Course créée<br/>dans l'app] --> B2[Assignation validée<br/>dans l'app] --> B3[KPI dashboards<br/>export CSV] --> B4((Traçabilité<br/>fiabilité<br/>visibilité))
    end
    AVANT == "AMT Express" ==> APRES
```

### 3.2. Utilisateurs cibles et personas ✅

*(5 personas issus de mes spécifications fonctionnelles v2.0)*

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">

<div style="flex: 1; min-width: 45%; border: 1px solid #F4A259; border-left: 5px solid #F4A259; border-radius: 6px; padding: 10px 12px; background: #FFFDF8;">
<strong>👨‍💼 Marc, 55 ans — dirigeant de flotte</strong><br/>Veut zéro erreur de planification et une vision temps réel de la disponibilité. Frustré par 3–4 h/jour de planification manuelle.<br/><em>→ tableau admin type Excel, notifications push.</em>
</div>

<div style="flex: 1; min-width: 45%; border: 1px solid #F4A259; border-left: 5px solid #F4A259; border-radius: 6px; padding: 10px 12px; background: #FFFDF8;">
<strong>👩‍💼 Nathalie, 47 ans — assistante administrative</strong><br/>Veut des factures justes et envoyées à temps, sans chasser les tickets perdus.<br/><em>→ génération de factures en un clic, rappels automatiques.</em>
</div>

<div style="flex: 1; min-width: 45%; border: 1px solid #F4A259; border-left: 5px solid #F4A259; border-radius: 6px; padding: 10px 12px; background: #FFFDF8;">
<strong>🚗 Djamel, 39 ans — chauffeur indépendant</strong><br/>Veut maximiser ses revenus et voir prix et distance avant d'accepter.<br/><em>→ courses disponibles avec détails, demandes d'assignation.</em>
</div>

<div style="flex: 1; min-width: 45%; border: 1px solid #F4A259; border-left: 5px solid #F4A259; border-radius: 6px; padding: 10px 12px; background: #FFFDF8;">
<strong>🎫 Jean-Michel, 62 ans — client particulier</strong><br/>Veut un taxi vite, un prix connu à l'avance et un service ponctuel.<br/><em>→ prix verrouillé à la réservation, notation des chauffeurs.</em>
</div>

<div style="flex: 1; min-width: 45%; border: 1px solid #F4A259; border-left: 5px solid #F4A259; border-radius: 6px; padding: 10px 12px; background: #FFFDF8;">
<strong>🏢 Claire, 41 ans — assistante de direction (corporate)</strong><br/>Réserve pour des équipes entières, veut du reporting clair pour justifier les dépenses.<br/><em>→ réservations multiples, facturation groupée.</em>
</div>

</div>

### 3.3. User stories principales 🟡

1. *En tant qu'administrateur, je veux créer une course avec ses détails (départ, destination, horaire, prix, options), afin de cataloguer l'activité de l'entreprise.*
2. *En tant qu'administrateur, je veux affecter une course à un chauffeur — ou valider sa demande d'assignation — afin de distribuer l'effort de manière fiable.*
3. *En tant que chauffeur, je veux voir les courses disponibles et postuler, afin de maximiser mes revenus en choisissant mes courses.*
4. *En tant qu'administrateur, je veux générer des factures individuelles ou groupées avec des rappels automatiques, afin d'être payé à temps.* (objectif — non livré, cf. §3.4 hors périmètre)
5. *En tant que client, je veux réserver une course et retrouver mon historique, afin de commander sans friction.*
6. *En tant qu'administrateur, je veux importer mes anciennes données par CSV avec sauvegarde automatique, afin de migrer sans perte ni double saisie.*

### 3.4. Définition du MVP ✅

| # | Fonctionnalité MVP | Statut (main, 16/10/2026) |
| - | ------------------ | ------------------------ |
| 1 | Authentification + 3 rôles (admin/driver/customer), activation manuelle des chauffeurs, bannissement | ✅ livré |
| 2 | CRUD courses complet + cycle de statuts (`pending → assigned → completed/cancelled`) | ✅ livré |
| 3 | Demandes d'assignation chauffeur → validation admin | ✅ livré |
| 4 | Dashboards KPI (courses, revenus, taux d'assignation) + Recharts | ✅ livré |
| 5 | Import CSV en masse avec backup automatique | ✅ livré |
| 6 | Notation des courses (1–5 étoiles + commentaire) | ✅ livré |
| 7 | i18n FR/EN, PWA (Service Worker) | ✅ livré |
| 8 | Export CSV (jusqu'à 10 000 lignes) | ✅ livré |
| 9 | Journal d'audit (`activity_logs`) | ✅ livré |

**Hors périmètre MVP** (reporté et documenté) : GPS temps réel, OCR de tickets (Tesseract.js), paiements Stripe/PayPal, chat interne, notifications push, synchronisation calendrier, **module complet de facturation (création individuelle/groupée, remises, rappels J+7/J+14/J+30, export PDF) — planifié post-MVP, cf. roadmap admin dashboard**.

### 3.5. Risques et difficultés 🟡

| Risque identifié | Probabilité | Impact | Parade mise en place |
| ---------------- | ----------- | ------ | -------------------- |
| OCR insuffisant sur tickets manuscrits | Haute | Moyen | Reporté hors MVP : import CSV avec backup automatique + correction manuelle ; OCR planifié post-MVP |
| Adoption chauffeurs &lt; 80 % | Moyenne | Fort | Interface chauffeur minimale (courses, shifts, stats) ; activation par l'admin au cas par cas |
| Limites des free tiers (Neon 0,5 Go, bande passante Vercel) | Moyenne | Fort | Monitoring de l'usage, scripts `db:backup`, archivage possible ; scalabilité documentée (25–50 €/mois à 1 000+ utilisateurs) |
| Développement solo en temps partiel (jours d'école/alternance) | Certaine | Moyen | Git Flow strict, PR numérotées et revues, CI qui bloque tout merge non vert |
| Secrets exposés (`.env` réel) | Faible | Fort | `.gitignore` vérifié, README avec avertissements, procédure de révocation documentée |
| Un seul dev = risque de dérive technique | Moyenne | Moyen | Conventions de nommage, ESLint, `pnpm ci` obligatoire avant chaque PR, revue des retours de l'instructrice en session |

---

## 4. Spécifications fonctionnelles

> *Section critique : ~¼ du dossier. Le jury vérifie ici la partie « Concepteur ».*

### 4.1. Modélisation UML ✅ *(diagrammes produits v2 — à valider contre le code)*

**Diagramme de cas d'utilisation** — acteurs Admin / Chauffeur / Client (le système de facturation est hors MVP). *Nota : transcription en flowchart Mermaid ; le rendu UML canonique (acteurs en bonhommes, ellipses) sera produit dans l'outil de modélisation pour l'annexe #1.*

```mermaid
flowchart LR
    Admin([Administrateur])
    Driver([Chauffeur])
    Customer([Client])

    subgraph UC[Cas d'utilisation]
        UC1(Créer / éditer une course)
        UC2(Affecter une course<br/>ou valider une demande)
        UC3(Consulter les KPI)
        UC4(Importer des données CSV)
        UC5(Exporter en CSV)
        UC6(Bannir / activer un chauffeur)
        UC7(Voir les courses disponibles)
        UC8(Demander une assignation)
        UC9(Gérer ses shifts)
        UC10(Réserver une course)
        UC11(Consulter son historique)
        UC12(Noter une course)
    end

    Admin --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    Driver --- UC7 & UC8 & UC9
    Customer --- UC10 & UC11 & UC12
```

**Diagramme d'activité** — parcours « demande d'assignation » *(parcours cible — hypothèses à vérifier contre le code, cf. § 7.4 : une seule transaction réelle livrée, l'import CSV)* :

```mermaid
flowchart TD
    S([Chauffeur : course pending repérée]) --> C[Clic « demander »]
    C --> SA[Server Action<br/>validation Zod]
    SA --> VR{verifyRole<br/>'driver' ?}
    VR -- refus --> E1[ActionResponse UNAUTHORIZED — fin]
    VR -- ok --> S1[Service : contrôle du statut<br/>(plafond de demandes : à confirmer)]
    S1 -- statut invalide --> E2[ActionResponse erreur — fin]
    S1 -- ok --> I[(Insertion assignment_requests)]
    I --> N1[Notification admin]
    N1 --> D{Admin décide}
    D -- valide --> T[Objectif roadmap § 7.4 — non livré à ce stade :<br/>transaction d'assignation<br/>+ rejet des demandes concurrentes]
    T --> N2[Notification chauffeur → course assignée]
    D -- rejette --> N3[Notification chauffeur → demande rejetée]
    N2 --> F([Fin])
    N3 --> F
    style T fill:#F4A259,color:#000
```

**Diagramme de classes** (entités métier, préparatoire du MCD) :

```mermaid
classDiagram
    class User { +id +role : user_role +email +banned }
    class Driver { +id +user_id +active }
    class Production { +id +name }
    class Project { +id +production_id +name }
    class Ride { +id +project_id +driver_id? +status : ride_status +price +notation 1..5 étoiles +commentaire de notation }
    class RideCustomer { +ride_id +customer_id }
    class RideOption { +id +label +price }
    class RideSelectedOption { +ride_id +option_id }
    class AssignmentRequest { +ride_id +driver_id +status : request_status }
    class ShiftPlanning { +driver_id +status : shift_status }
    User "1" --> "0..1" Driver
    Production "1" *-- "0..n" Project
    Project "1" --> "0..n" Ride
    Driver "0..1" --> "0..n" Ride : assignee-a
    Ride "1" --> "1..n" RideCustomer
    Ride "1" --> "0..n" RideSelectedOption
    RideSelectedOption "0..n" --> "1" RideOption
    Ride "1" --> "0..n" AssignmentRequest
    AssignmentRequest "0..n" --> "1" Driver
    Driver "1" --> "0..n" ShiftPlanning
```

### 4.2. Conception de la base de données 🟡 ✅ *(schémas produits v2 — à valider)*

**19 tables** en production (vérifié sur `main`, 16/10/2026) : `users`, `drivers`, `productions`, `projects`, `rides`, `ride_options`, `ride_selected_options`, `ride_customers`, `ride_managers`, `shift_planning`, `assignment_requests`, `invoices`, `invoice_items`, `notifications`, `notification_preferences`, `activity_logs` + 3 tables Better Auth (`session`, `account`, `verification`).

**Enums** : `user_role` (admin/driver/customer) · `ride_status` (pending/assigned/completed/cancelled) · `invoice_status` (unpaid/paid/cancelled) · `request_status` (pending/approved/rejected) · `shift_status` (planned/active/completed/cancelled).

**MCD (Merise)** — entités métier, associations et cardinalités en notation Merise (cœur du modèle ; les tables d'auth, de notification et d'audit sont omises pour la lisibilité). Rappels de lecture : la cardinalité se lit **au pied de l'entité** ; les associations `transporte` et `embarque` sont **porteuses** (elles portent les tables associatives `ride_customers` et `ride_selected_options`) ; l'association `est-aussi` relie `USER` et `DRIVER` (1,1 du côté chauffeur : un chauffeur est exactement un utilisateur).

```mermaid
flowchart LR
    PROD[PRODUCTION] -- "(0,n)" --> A1{"contient"} -- "(1,1)" --> PROJ[PROJECT]
    PROJ -- "(0,n)" --> A2{"concerne"} -- "(1,1)" --> RIDE
    USER -- "(0,1)" --> A3{"est-aussi"} -- "(1,1)" --> DRV[DRIVER]
    DRV -- "(0,n)" --> A4{"est-assignee-a"} -- "(0,1)" --> RIDE
    DRV -- "(0,n)" --> A5{"emet"} -- "(1,1)" --> AR[ASSIGNMENT_REQUEST]
    RIDE -- "(0,n)" --> A6{"recoit"} -- "(1,1)" --> AR
    RIDE -- "(1,n)" --> A7{"transporte<br/>(porteuse : ride_customers)"} -- "(0,n)" --> USER
    RIDE -- "(0,n)" --> A8{"embarque<br/>(porteuse : ride_selected_options)"} -- "(0,n)" --> ROPT[RIDE_OPTION]
    DRV -- "(0,n)" --> A9{"planifie"} -- "(1,1)" --> SHP[SHIFT_PLANNING]
    USER -- "(0,n)" --> A10{"recoit"} -- "(1,1)" --> NT[NOTIFICATION]
    RIDE -- "(0,n)" --> A11{"concerne"} -- "(1,1)" --> NT
    style A1 fill:#F4A259,color:#000
    style A2 fill:#F4A259,color:#000
    style A3 fill:#F4A259,color:#000
    style A4 fill:#F4A259,color:#000
    style A5 fill:#F4A259,color:#000
    style A6 fill:#F4A259,color:#000
    style A7 fill:#F4A259,color:#000
    style A8 fill:#F4A259,color:#000
    style A9 fill:#F4A259,color:#000
    style A10 fill:#F4A259,color:#000
    style A11 fill:#F4A259,color:#000
```

*Nota : structure et cardinalités Merise strictes ci-dessus. Pour la version imprimée, seule la mise en page (chapelets horizontaux) pourra être redessinée dans l'outil de modélisation (cf. annexe #2) — le fond ne changera pas.*

**MLD** — transformation en tables relationnelles (extraits des règles de passage) :

- `rides (id, project_id*, driver_id*, status, price, …)` — FK vers `projects` (NOT NULL), FK vers `drivers` (NULLABLE : course non encore assignée).
- `ride_customers (ride_id*, customer_id*)` — table associative : (1,n) côté course (une course transporte au moins un client), (0,n) côté client (un client peut n'avoir aucune course).
- `assignment_requests (ride_id*, driver_id*, status)` — deux FK simples (`ride_id`, `driver_id`), statut contraint par l'enum `request_status`.
- `projects (id, production_id*, …)` — FK vers `productions` ; une production contient 0..n projets.

**MPD** 🟡 : schéma réel `lib/db/schema.ts` — 19 `pgTable`, 5 `pgEnum` (`user_role`, `ride_status`, `shift_status`, `request_status`, `invoice_status`), FK `ON DELETE SET NULL`/`CASCADE`, index mono-colonne uniquement (pas d'index composite ni partiel).

- *Amélioration planifiée* : contraintes CHECK (rating 1–5), UNIQUE composite (`ride_id`, `customer_id`), index composite (`driver_id`, `status`) — via migration Drizzle.

<div style="border: 1px solid #c62828; border-left: 5px solid #c62828; border-radius: 6px; padding: 10px 14px; margin: 12px 0; background: #FDF3F3;">
🔴 <strong>À capturer pour le rendu</strong> : export du schéma complet (ERD 19 tables) depuis le code réel — les diagrammes ci-dessus couvrent le cœur métier, l'annexe attend le schéma exhaustif.
</div>

### 4.3. Maquettes de l'interface 🔴

- **Identité graphique** : palette, typographie, logo — *captures à intégrer + test de contraste à documenter (RGAA)*. Le fichier `logo.svg` est référencé dans le README mais non présent dans `public/` (à produire).
- **Wireframes** des écrans clés (dashboard admin, formulaire course, vue chauffeur) — *à produire, même rétroactivement à partir des écrans*.
- **Maquettes haute-fidélité** : captures `public/screenshots/desktop-wide.png` / `mobile-narrow.png` + écrans réels (états : chargement, erreur, vide).
- **Enchaînement des écrans** : parallel routes `@admin` / `@driver` / `@customer` + page `connections` (authentification) — schéma de navigation ✅ produit ci-dessous.

```mermaid
flowchart TD
    C["Page connections (auth)"] --> R{verifyRole :<br/>rôle de session}
    R -- admin --> A["@admin — parallel route<br/>courses, assignations,<br/>import CSV, KPI dashboards"]
    R -- driver --> D["@driver — parallel route<br/>courses disponibles,<br/>demandes, shifts"]
    R -- customer --> CU["@customer — parallel route<br/>réservation, historique, notation"]
    A --> G[(Drizzle · PostgreSQL)]
    D --> G
    CU --> G
```

- **Accessibilité** 🟡 : aria-labels ajoutés sur toute l'application (retour instructrice, PR #75/76 du 16/10/2026), navigation clavier, contraste — *points à préciser avec l'IDE pour le détail RGAA*.

---

## 5. Spécifications techniques

### 5.1. Organisation en couches ✅

```mermaid
flowchart TB
    A["UI — Next.js App Router · React 19<br/>parallel routes @admin/@driver/@customer<br/>+ page connections (auth)"] --> B["Server Actions<br/>validation Zod"]
    B --> C["Controllers"]
    C --> D["Role Middleware<br/>verifyRole — admin ≥ driver ≥ customer"]
    D --> E["Services — logique métier pure"]
    E --> F["Drizzle ORM (type-safe)"]
    F --> G[("PostgreSQL 16 — Neon")]
    style A fill:#176B87,color:#fff
    style D fill:#F4A259,color:#000
    style G fill:#060605,color:#fff
```

- **Présentation** : App Router, React 19, CSS Modules + Tailwind 4, Recharts, i18next.
- **Logique métier** : Server Actions (validées Zod) → Controllers → Services purs.
- **Accès aux données** : Drizzle ORM type-safe.
- **Transversal** : Better Auth (sessions, rôles, bannissements), middleware de rôles, journalisation (`activity_logs`), i18n.

### 5.2. La sécurité (OWASP) 🟡

| Risque OWASP | Réponse dans AMT Express |
| ------------ | ------------------------ |
| A01 — Contrôle d'accès défaillant | `verifyRole()` dans **chaque** Server Action, hiérarchie de rôles, activation manuelle des chauffeurs, bannissement ; correction de fuites de données (commit `68cf1da`, 02/10/2026 : *fix data leaks*) |
| A02 — Cryptographie défaillante | Cookies HTTP-only (`nextCookies()`), secrets en variables d'environnement, HTTPS en production |
| A03 — Injection | Requêtes paramétrées via Drizzle, validation/sanitization Zod côté serveur sur **toutes** les entrées |
| A05 — Mauvaise configuration | `.env` hors dépôt, `NODE_ENV` géré, messages d'erreur génériques aux clients (`ActionResponse`) |
| A06 — Dépendances vulnérables | `pnpm audit` (à systématiser en CI — voir § 10) |
| A07 — Auth défaillante | Better Auth (hachage, sessions expirantes), secret ≥ 32 caractères, rôle par défaut minimal (`customer`) |

**RGPD** : données personnelles limitées au strict nécessaire, journal d'audit `activity_logs`, durée de conservation définie, procédure d'archivage des comptes désactivés. 🔴 *registre des traitements : une page à rédiger.*

### 5.3. Choix de stack justifiés 🟡

- **PostgreSQL (Neon)** : les données sont fortement relationnelles (users ↔ drivers ↔ rides ↔ shift_planning ↔ assignment_requests) ; l'import CSV s'appuie sur une transaction ACID pour la création production + projet générique (`db.transaction` dans `lib/db/import-csv.ts`), l'import global n'étant pas atomique (avertissement « This import is NOT transactional » affiché par le script ; restauration possible via le backup exécuté avant l'import, `pnpm db:backup`) — un NoSQL n'aurait aucun sens ici. Neon serverless : free tier compatible budget 0 €, branching pour les tests.
- **Next.js 16 + Server Actions** : une seule base de code pour front et back, typage de bout en bout avec TypeScript, suppression de la couche API REST redondante pour un MVP solo — itération plus rapide.
- **Drizzle ORM** : type-safe, requêtes proches du SQL (maîtrise réelle des requêtes, optimisations manuelles possibles — cf. RidesViewService), léger comparé à Prisma.
- **Zod** : une seule source de vérité pour la validation, schémas réutilisés côté front (erreurs de formulaire) et back.
- **Vitest** : cohérence avec l'écosystème Vite/Next, API compatible Jest, rapide.
- **Docker multi-étapes** (`node:20-alpine`, user non-root, healthcheck) : builds reproductibles, image de production légère.
- **Vercel** : déploiement natif Next.js, free tier (déploiements réels pilotés par `workflow_dispatch` — les préviews automatiques par PR restent à activer/à confirmer).

---

## 6. Gestion de projet

### 6.1. Environnement humain et technique ✅

- **Équipe** : Alexis SANTOS, Tech Lead / PM (architecture, back, front, DevOps, docs). Relecture externe : instructrice Ada Tech School (retours intégrés le 16/10/2026, PR #75/#76). Client réel : AMT CGS GROUPE.
- **Outils** : VS Code, Git/GitHub (issues, Projects, PR), GitHub Actions, pnpm, ESLint, Docker, Vercel, Neon.

### 6.2. Planning et suivi 🟡

- **Méthode** : itérations par fonctionnalité sur un rythme contraint (temps partiel), Git Flow strict : `main` (prod) ← `development` (intégration) ← `feature/*` / `hotfix/*`, **76 pull requests ouvertes (numérotées #1–#76, dont 36 merges traçables dans l'historique actuel)**.

```mermaid
flowchart LR
    F["feature/* · hotfix/*"] -- "PR + CI verte" --> DEV["development<br/>(intégration)"]
    DEV -- "PR + workflow_dispatch + confirmation manuelle" --> UAT["Vercel UAT"]
    UAT -- "validation humaine" --> MAIN["main — production<br/>Vercel PROD"]
    MAIN -.->|"rollback : re-déploiement du tag précédent"| MAIN
```

- **Suivi** : GitHub Projects (board), issues (~25 ouvertes pour le post-MVP), messages de commit conventionnels (`feat`, `fix`, `refactor`, `chore`).
- Jalons réels : auth + rôles (juil. 2026) → interfaces chauffeur/client (août) → consolidation docs (août) → CI/CD Vercel + 17 fix deploy consécutifs (11/09/2026) → optimisations sécurité/a11y/perf (02/10 et 16/10/2026).
- 🔴 *captures : board GitHub Projects, graphe de PRs, pipeline vert.*

### 6.3. Objectifs de qualité ✅

- Conventions de nommage (PascalCase composants, camelCase fonctions), ESLint, `pnpm ci` (build + tous les tests) obligatoire avant chaque PR — aucune PR mergée rouge.
- Validation Zod systématique, type `ActionResponse<T>` unifié avec `ErrorCodes` — **240 tests automatisés** (9 fichiers : 7 unitaires, 2 intégration ; `pnpm test` 16/10/2026 : 240 passed / 0 failed).
- Revue de code externe : retours de l'instructrice intégrés (sécurité, a11y, performance — PR #75/#76).

---

## 7. Réalisation

### 7.1. Architecture du projet ✅

```text
amt-express/
├── app/ (@admin, @customer, @driver — parallel routes + connections, rides, legal)
├── components/ (admin, customer, driver, dashboard, shared…)
├── lib/
│   ├── actions/        # Server Actions (auth, rides, dashboard…)
│   ├── controllers/    # orchestration entre actions et services
│   ├── services/       # logique métier pure
│   ├── middleware/     # roleMiddleware.ts — verifyRole()
│   ├── auth/           # auth.ts, session.ts (Better Auth)
│   ├── cache/          # requestCache.ts
│   ├── utils/          # email, logger, rideFilters
│   ├── db/             # client Drizzle + schema.ts (19 tables)
│   ├── types/          # ActionResponse, ErrorCodes
│   └── validations/    # schémas Zod
├── locales/ (fr.json, en.json)
└── test/ (unit/, integration/)
```

### 7.2. Front-end 🟡

*(extraits à sélectionner dans le code réel — propositions : un composant tableau admin avec filtres/tri multi-colonnes et pagination ; un formulaire de course avec états d'erreur Zod ; un dashboard KPI Recharts. Chaque extrait : 10–30 lignes + un paragraphe d'explication.)* Parallel routes Next.js pour cloisonner les espaces par rôle (`@admin`, `@driver`, `@customer`) + page `connections` pour l'authentification ; responsive (captures desktop/mobile) ; aria-labels (PR #75/#76) ; i18next FR/EN ; PWA avec Service Worker.

### 7.3. Back-end 🟡

*(propositions d'extraits : une Server Action de création de course avec son schéma Zod ; le middleware `verifyRole()` ; un service métier pur — cycle de statuts des courses ou logique d'assignation ; l'optimisation SQL de `RidesViewService` (anti full-table-scan, commit e7abfdf / 849b99d).)* Chaque action retourne un `ActionResponse<T>` : succès ou erreur typée avec code — le front ne gère jamais une erreur non prévue.

```mermaid
flowchart LR
    SA["Server Action<br/>(entrée : données brutes)"] --> Z["Zod<br/>validation"]
    Z -- invalide --> AR1["ActionResponse<br/>VALIDATION_ERROR"]
    Z -- valide --> CT["Controller<br/>(orchestration)"] --> MW["verifyRole()"]
    MW -- refus --> AR2["ActionResponse<br/>UNAUTHORIZED"]
    MW -- ok --> SV["Service<br/>(logique métier pure)"] --> DB["Drizzle → PostgreSQL"]
    SV --> AR3["ActionResponse&lt;T&gt;<br/>succès typé"]
```

### 7.4. Accès aux données 🟡

Drizzle type-safe ; jointures relationnelles (`db.query` avec `with`) pour les vues détaillées (course + chauffeur + clients) ; index mono-colonne documentés (§ 4.2). Une transaction ACID réelle : import CSV en masse (création atomique production + projet générique, `db.transaction` dans `lib/db/import-csv.ts`).

**Objectifs / roadmap** (non implémentés à ce stade) : environnement de facturation complet au sein de la solution, transactions multi-lignes, rejet des demandes concurrentes d'assignation.

### 7.5. Sécurité en action 🔴

*(extraits : `verifyRole()` ligne par ligne ; vérification de session `auth()` dans une action protégée ; gestion du bannissement Better Auth.)* Sessions cookies HTTP-only, hiérarchie admin ≥ driver ≥ customer, bypass désactivé hors `NODE_ENV=test`.

### 7.6. Fonctionnalité métier complète 🟡

**Parcours « demande d'assignation »** (proposition — de l'UI au stockage ; le diagramme d'activité complet est au § 4.1) : le chauffeur voit une course `pending` → clique « demander » → Server Action validée Zod → `verifyRole('driver')` → service : contrôle du statut et du plafond de demandes simultanées → insertion `assignment_requests` → notification admin → l'admin valide → *(objectif — non livré à ce stade, cf. § 7.4 : la transaction d'assignation et le rejet des demandes concurrentes sont en roadmap)* → notification chauffeur. *(à vérifier contre le code réel — cible idéale car elle traverse toutes les couches.)*

---

## 8. Tests

### 8.1. Jeu d'essai — fonctionnalité la plus représentative 🟡

**Fonctionnalité testée** : création d'une course (ou demande d'assignation — à trancher ensemble)

| Élément | Contenu |
| ------- | ------- |
| Pré-conditions | admin authentifié (`verifyRole('admin')`) ; base avec au moins 1 client et 1 chauffeur actifs |
| Données en entrée (cas nominal) | départ « Paris 15e », destination « Orly », horaire J+2 10h00, prix client 45,00 €, option « aéroport » |
| Résultat attendu | `ActionResponse` succès + id ; ligne `rides` créée en `pending` ; ligne `ride_customers` créée ; notification client |
| Résultat obtenu | ✅ conforme (test d'intégration `RidesManagementActions` — 🔴 capture à insérer) |
| Cas d'erreur 1 : horaire passé | Zod rejette → `ActionResponse` erreur `VALIDATION_ERROR`, champs signalés, **aucune écriture en base** |
| Cas d'erreur 2 : rôle non autorisé | `verifyRole()` → erreur `UNAUTHORIZED` ; 🔴 capture |
| Écart éventuel | *(à documenter si un écart est survenu pendant le développement)* |

```mermaid
flowchart TD
    IN[Départ : Paris 15e · Orly · J+2 10h00<br/>45,00 € · option aéroport] --> V{Zod : horaire futur ?}
    V -- non --> ERR1[VALIDATION_ERROR — aucun INSERT]
    V -- oui --> R{verifyRole : admin ?}
    R -- non --> ERR2[UNAUTHORIZED — aucun INSERT]
    R -- oui --> OK[rides : pending · ride_customers<br/>notification client]
    style ERR1 fill:#c62828,color:#fff
    style ERR2 fill:#c62828,color:#fff
    style OK fill:#2e7d32,color:#fff
```

### 8.2. Tests automatisés ✅

- **Unitaires** (Vitest + Testing Library) : services (ActionResponse, import CSV, rôles, traductions, validations), composants (Button), actions (AuthActions).
- **Intégration** (base réelle) : `AuthActions`, `RidesManagementActions`.
- **240 tests automatisés** au total (9 fichiers : 7 unitaires, 2 intégration — `pnpm test` 16/10/2026 : 240 passed / 0 failed) ; couverture mesurable via `pnpm test:coverage` (lib/ et utils/).
- 🔴 *capture : sortie `pnpm ci` verte + fichier de test commenté (mocks des dépendances externes expliqués).*

---

## 9. Préparation au déploiement (CCP 3)

### 9.1. Les environnements séparés ✅

| Environnement | Rôle | Mise en œuvre |
| ------------- | ---- | ------------- |
| Développement | itération rapide | local (Node 20) ou Docker Compose (PostgreSQL inclus, `node:20.12.2-alpine`), `pnpm db:push`, hot reload, logs verbeux |
| Tests / intégration | valider avant prod | branche `development`, base Neon dédiée, `NODE_ENV=test` (bypass de `verifyRole()` ciblé), CI GitHub Actions (Node 24.7.0) |
| UAT / préproduction | recette | déploiement Vercel UAT via `workflow_dispatch`, vérification manuelle |
| Production | vrais utilisateurs | branche `main`, Vercel PROD, secrets gérés, HTTPS |

Variables d'environnement distinctes (`DATABASE_URL`, `BETTER_AUTH_SECRET`/`AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`) ; fichier `.env.example` présent dans le repo (template documenté).

### 9.2. Intégration continue ✅

**7 workflows GitHub Actions** : build, tests unitaires (`tests-unit`), tests auth unitaires (`auth-unit`), tests auth intégration (`tests-auth`), tests rides (`tests-rides`), déploiement UAT et PROD (`deploy-to-vercel-uat`, `deploy-to-vercel-prod`) via `workflow_dispatch` avec confirmation manuelle « yes » + mise à jour base Neon. Déclencheurs : push (branches), PR (gates), merge main. `pnpm ci` = build + lint + tous les tests — toute PR rouge est bloquée.

```mermaid
flowchart LR
    P[Push / PR] --> B["Build"] --> L["Lint (ESLint)"] --> T1["Tests unitaires ×7 fichiers"] --> T2["Tests d'intégration ×2<br/>(base réelle)"] --> G{Vert ?}
    G -- non --> X["Merge bloqué"]
    G -- oui --> M["Merge possible"] --> D1["Deploy UAT<br/>(workflow_dispatch)"] --> D2["Confirmation manuelle « yes »<br/>Deploy PROD"]
    style X fill:#c62828,color:#fff
    style G fill:#2e7d32,color:#fff
```

🔴 *capture du pipeline vert à insérer.*

### 9.3. Les cinq questions ✅

1. **Tests/CI** : oui — tout passe en CI avant tout merge (36 PR mergées et traçables, pipeline vert).
2. **Documentation** : README complet (installation, variables, dépannage), documentation embarquée (architecture, sessions, import CSV, Docker, Git Flow).
3. **Gitflow** : `main` = prod ; `development` = intégration ; `feature/*`, `hotfix/*` ; merges par PR numérotées ; validation par CI.
4. **Hébergement des données** : données personnelles de transport (pas de santé) — Neon/Vercel retenus ; considérations UE à documenter 🔴 *(point RGPD à préciser : localisation des datacenters, transferts hors UE le cas échéant)*.
5. **Et si ça casse ?** : voir 9.4.

### 9.4. Stratégie de déploiement ✅

- **Interruption de service** : déploiement par re-déploiement Vercel — interruption quasi nulle (CDN + build atomique) ; acceptable pour un MVP, documenté.
- **Versionnement** : version 0.1.0, tags Git ; identification précise de ce qui tourne en prod à un instant T via le SHA déployé (ex. `bce57b7` au 16/10/2026).
- **Rollback** : re-déployer le commit/tag précédent via l'interface Vercel (testé pendant les 17 fix deploy du 11/09) ; restauration base via script `db:backup` (sauvegardes préalables à toute opération risquée, ex. import CSV).

### 9.5. Documentation du déploiement ✅

README (installation locale, Docker Compose, build production), `documentation/` à la racine du repo (TECHNICAL_ARCHITECTURE, SESSION_USAGE_GUIDE, CSV_Import, Docker, GitFlow, RESPONSIVE_DESIGN), Dockerfile multi-étapes commenté.

**Schéma de l'infrastructure de production** ✅ *(produit en v2)* :

```mermaid
flowchart LR
    U["Utilisateur<br/>(desktop / mobile / PWA)"] -- "HTTPS" --> V["Vercel — CDN + Next.js 16<br/>(build atomique)"]
    V -- "requêtes SQL chiffrées" --> N[("Neon — PostgreSQL 16<br/>(free tier, branching)")]
    P["Push / PR GitHub"] -- "déclenchent" --> GH["GitHub Actions<br/>(7 workflows)"]
    GH -- "deploy (workflow_dispatch,<br/>confirmation manuelle)" --> V
    N -- "pnpm db:backup" --> BK["Sauvegardes locales<br/>(préalables aux opérations risquées)"]
    style V fill:#176B87,color:#fff
    style N fill:#060605,color:#fff
```

---

## 10. Veille sur les vulnérabilités 🟡

- **Périodicité** : veille à chaque session de développement + revue des GitHub security advisories ; `pnpm audit` avant chaque PR. *(fréquence réelle à préciser par Alexis)*
- **Sources** : GitHub Dependabot / security advisories, releases des technos majeures (Next.js, Drizzle, Better Auth), npm audit.
- **Exemple concret** 🔴 *(à constituer — candidat : suivre et documenter une vraie alerte Dependabot/audit pendant la rédaction : package, sévérité, contexte, décision)*.

---

## 11. Défis et recherche 🟡

**Verrou technique choisi (proposition)** : *corriger et fiabiliser le cycle de déploiement Vercel du 11/09/2026 — 17 commits « fix vercel ? » à « fix vercel ? 17 » suivis du merge final PR #71 « Fix Prod Deploy » pour amener la production à un état vert.*

Trame 5 étapes (à raconter avec vos mots) :

1. **Besoin d'information** : déploiements en échec en chaîne (CLI, variables, configuration) sans message exploitable — je ne savais pas diagnostiquer une chaîne CI/CD Vercel + Neon.
2. **Recherche** : logs Vercel, docs officielles (anglais) — *(mots-clés réels à rappeler)*, issues GitHub, comparaison des workflows.
3. **Critères de sélection** : doc officielle &gt; blog ; date de publication (Next.js 16 récent) ; reproductibilité locale avant prod.
4. **Solution** : *(à préciser — ce qui a réellement débloqué : version CLI, NODE\_ENV, config ?)*
5. **Mise en œuvre** : PR #71 « Fix Prod Deploy », déploiement stable depuis ; méthode capitalisée dans la documentation.

```mermaid
flowchart LR
    D1["11/09 — déploiements KO"] --> D2["17 commits de diagnostic<br/>(fix vercel ? → ? 17)"] --> D3["PR #71 — Fix Prod Deploy"] --> D4["Production verte<br/>stable depuis"]
    D2 -. "pistes explorées" .-> F["fausse piste corrigée<br/>(à raconter : CLI, variables,<br/>configuration)"]
    style D4 fill:#2e7d32,color:#fff
    style F fill:#F4A259,color:#000
```

*Alternative possible* : l'optimisation SQL de RidesViewService (prévention du full scan sur IDs vides, 02/10/2026) — à choisir ensemble. Le guide précise qu'une **fausse piste corrigée** valorise la démarche : les 17 fix en contiennent sûrement une à raconter.

---

## 12. Conclusion

### Bilan honnête 🟡

Livré : un MVP complet en production réelle pour un client de ~200 chauffeurs — auth multi-rôles, CRUD courses, assignations, KPI, import CSV, i18n, PWA, CI/CD — 76 PR ouvertes (36 merges traçables), 240 tests automatisés (tous au vert — `pnpm test` 16/10/2026), budget 0 €. Moins bien réussi : le premier cycle de déploiement (17 itérations nécessaires — l'anticipation de la chaîne Vercel/Neon a manqué) ; l'OCR et le GPS reportés ; le module de facturation non livré (tables `invoices`/`invoice_items` présentes dans le schéma, logique à implémenter : création, rappels J+7/J+14/J+30, export PDF).

### Axes d'amélioration ✅

1. **Affectation automatique des courses** : algorithme de suggestion basé sur disponibilité/disposition (le besoin et la maquette existent dans les specs).
2. **OCR de tickets (Tesseract.js)** : fiabiliser la saisie des prix à partir de photos.
3. **Module complet de facturation** : création individuelle/groupée, remises justifiées, rappels J+7/J+14/J+30, export PDF côté serveur (tables `invoices`/`invoice_items` déjà dans le schéma ; cf. roadmap admin dashboard).
4. **Systématiser l'audit sécurité** (`pnpm audit` en CI) et uniformiser les noms de variables d'environnement (`BETTER_AUTH_SECRET` vs `AUTH_SECRET`).
5. **Accessibilité RGAA** : audit complet au-delà des aria-labels déjà posés.

### Ce que j'en retire 🟡

Un projet solo de A à Z force à tenir tous les rôles à la fois — architecte, dev, QA, DevOps, rédacteur de docs. Les retours de relecture externe (instructrice) ont été intégrés en PR mesurées : la revue n'est pas une contrainte, c'est un accélérateur. J'ai appris à défendre des choix techniques par écrit et à documenter pour un tiers.

---

## Annexe — inventaire des annexes à monter

| # | Pièce attendue | Statut v2 |
| - | -------------- | --------- |
| 1 | Diagrammes UML (cas d'utilisation, activité, classes) | ✅ produits § 4.1 — à valider contre le code |
| 2 | MCD/MLD | ✅ produits § 4.2 (cœur métier) — 🔴 ERD exhaustif 19 tables à exporter |
| 3 | Wireframes + maquettes | 🔴 à produire (§ 4.3) |
| 4 | Schéma de navigation | ✅ produit § 4.3 |
| 5 | Schéma d'architecture | ✅ produits § 5.1 + § 7.3 |
| 6 | Schéma d'infra (Vercel/Neon) | ✅ produit § 9.5 |
| 7 | Captures board GitHub Projects | 🔴 à capturer |
| 8 | Pipeline CI vert | 🔴 à capturer (§ 9.2) |
| 9 | Sortie de tests | 🔴 à capturer (§ 8) |
| 10 | Captures d'écrans application (admin/driver/customer, FR/EN, desktop/mobile) | 🔴 à capturer |
| 11 | Registre RGPD | 🔴 à rédiger (§ 5.2) |
| 12 | Extraits de code commentés | 🔴 à sélectionner (§ 7) |

*Schémas complémentaires produits en v2 : avant/après (§ 3.1), Git Flow (§ 6.2), pipeline CI (§ 9.2), jeu d'essai (§ 8.1), défi Vercel (§ 11).*

---

### Notes de rédaction (à supprimer avant rendu)

- Données vérifiées sur `main` au 16/10/2026 (SHA `bce57b7`, PR #76) : 19 tables, Next 16.1.1, React 19.2.3, Zod 4.3.5, Drizzle 0.45.1, Better Auth 1.4.10, Vitest 4, pnpm 9.15.4, 76 PR ouvertes (36 merges traçables #41–#76), 240 tests automatisés (sortie `pnpm test` 16/10/2026 : 9 fichiers, 240 passed / 0 failed), 7 workflows CI.
- **Corrections appliquées le 16/10/2026** : rappels factures J+7/J+14/J+30 retirés du MVP (champs schéma présents, logique non implémentée) ; export PDF retiré (CSV uniquement) ; `.env.example` confirmé présent ; enums corrigés (5 pgEnum réels, pas de `option_type`/`vehicle_type`) ; parallel routes corrigées (`connections` au lieu de `@auth`) ; workflows corrigés (7, pas 8).
- **Corrections appliquées le 16/10/2026 (2e passe, vérifiées contre le code)** : module de facturation retiré du MVP (aucun `insert` sur `invoices`/`invoice_items` dans `lib/` ; seul `AdminDashboardService` compte les factures impayées pour le KPI) et déplacé en « hors périmètre » ; user story 4 annotée « objectif — non livré » ; §7.4 : transactions multi-lignes et index composites retirés des livrés (une seule transaction réelle : import CSV, `lib/db/import-csv.ts:482`), sous-section « Objectifs / roadmap » ajoutée ; §4.2 MPD réécrit sur le schéma réel (19 `pgTable`, 5 `pgEnum`, FK `ON DELETE SET NULL`/`CASCADE`, index mono-colonne ; amélioration planifiée : CHECK rating 1–5, UNIQUE composite, index composite) ; §1.1/§1.2/§5.3/§7.3 : « facturation » retirée des fonctions présentées comme livrées ; chiffre de tests sourcé par exécution réelle (`pnpm test` 16/10/2026 : 9 fichiers, 240 passed / 0 failed ; les comptages statiques `it(` divergeaient à cause des tests générés par boucles, le commit `a0b372a` annonçait un chiffre différent).
- **Pass du 23/10/2026 (v2 — mise en forme & schémas)** : page de garde + sommaire ajoutés (logique des dossiers exemples de la Drive : Awaleh, Diaz) ; 11 diagrammes Mermaid produits (UML ×3, MCD/MLD, navigation, architecture, flux Server Action, Git Flow, pipeline CI, infra, jeu d'essai, avant/après) ; badges/encadrés HTML pour impression A4 ; annexe transformée en tableau de suivi. **Aucun fait nouveau inventé** : les schémas décrivent des mécanismes déjà documentés dans le dossier ; les parcours (§ 4.1 activité, § 7.6) restent marqués « à vérifier contre le code ». Diagrammes Mermaid : pour le PDF final, soit l'extension Mermaid est activée, soit exporter chaque schéma en SVG/PNG et insérer l'image.
- **Review anais0210 intégrée (23/10/2026, PR #77)** : UC12 « Noter une course » déplacé vers le Client ; diagramme d'activité requalifié « parcours cible » (transaction d'assignation et rejet des demandes concurrentes marqués non livrés, renvoi § 7.4 ; plafond de demandes à confirmer) ; entité Rating retirée (notation = attributs de `rides`, noms de colonnes à confirmer) ; cardinalités corrigées (Driver 0..1 → 0..n Ride ; RideSelectedOption → exactement 1 RideOption ; ride_customers (0,n) côté client) ; **MCD redessiné en notation Merise stricte** (associations en losanges, cardinalités (0,n)/(1,1) au pied de chaque entité, associations porteuses `transporte`/`embarque` explicitées) ; « FK composites » → deux FK simples ; `MAIN .->` → `-.->` ; schéma infra corrigé (push → Actions → Vercel, plus l'inverse ; « préviews par PR » marquées à confirmer) ; note ajoutée sur la transcription UML canonique attendue pour l'annexe #1.
- Les specs papier (janv. 2026, AMT Horizon, 20 tables) sont antérieures au refactor : le dossier s'appuie sur le repo, pas sur elles.
- Écart à arbitrer : les specs papier mentionnent Zustand, Socket.io, Stripe — **confirmé absent** de `package.json`.
- Le jury reçoit le dossier **imprimé** quelques minutes avant : chaque section doit être skimmable (titres, tableaux, schémas, légendes de captures).