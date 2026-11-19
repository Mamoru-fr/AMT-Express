# PROJET.md - AMT Express

**Source de vérité du chantier** - Dernière mise à jour : 2026-10-02 (Session 1 - Initialisation)

---

## 📌 Sommaire
1. [Contexte et Objectifs](#-contexte-et-objectifs)
2. [Équipe et Rôles](#-équipe-et-rôles)
3. [Stack Technique](#-stack-technique)
4. [Architecture](#-architecture)
5. [Conventions](#-conventions)
6. [Workflows](#-workflows)
7. [État Actuel du Projet](#-état-actuel-du-projet)
8. [Tâches Prioritaires](#-tâches-prioritaires)
9. [Décisions Architecturales](#-décisions-architecturales)
10. [Audit des Sessions](#-audit-des-sessions)
11. [Backlog](#-backlog)
12. [Ressources](#-ressources)

---

## 🎯 Contexte et Objectifs

### Description du Projet
**AMT Express** est une **plateforme web full-stack** de gestion de courses de taxi pour :
- **Entreprises de transport** (VTC, taxi).
- **Clients professionnels** (productions cinéma, événementiel).

**Objectifs principaux** :
| Objectif | Description | Statut |
|----------|-------------|--------|
| **Cataloguer** | Enregistrer et historiser toutes les courses avec leurs détails | ✅ |
| **Distribuer** | Affecter les courses aux chauffeurs via un planning dynamique | ✅ |
| **Facturer** | Générer des factures individuelles ou groupées | ✅ |
| **Importer** | Intégrer des données par formulaire, CSV ou OCR | ⚠️ (CSV OK, OCR en cours) |
| **Notifier** | Alerter les parties prenantes sur les événements critiques | 📋 |

### Fonctionnalités Clés
| Fonctionnalité | Statut | Priorité |
|----------------|--------|----------|
| Authentification (Better-Auth) | ✅ | ⭐⭐⭐ |
| Gestion des rôles (Admin/Chauffeur/Client) | ✅ | ⭐⭐⭐ |
| CRUD Courses | ✅ | ⭐⭐⭐ |
| Tableaux de bord avec KPI | ✅ | ⭐⭐⭐ |
| Import CSV avec backup automatique | ✅ | ⭐⭐ |
| Internationalisation (FR/EN) | ✅ | ⭐⭐ |
| Validation côté serveur (Zod) | ✅ | ⭐⭐⭐ |
| PWA (Service Worker) | ✅ | ⭐ |
| Suivi GPS en temps réel | 🚧 | ⭐⭐ |
| OCR pour scanning de tickets | 🚧 | ⭐ |
| Intégration paiement (Stripe/PayPal) | 🚧 | ⭐ |
| Chat interne | 🚧 | ⭐ |
| Notifications push | 📋 | ⭐ |

---

## 👥 Équipe et Rôles

| Rôle | Personne | Responsabilités |
|------|----------|------------------|
| **Lead Dev** | Alexis Santos (Mamoru) | Architecture, décisions techniques, reviews |
| **Agent Dev** | Ada (Vibe) | Implémentation, tests, documentation |

---

## 🏗️ Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.1.1 | Framework (App Router) |
| React | 19.2.3 | UI |
| TypeScript | ^5 | Langage |
| Tailwind CSS | 4 | Styles |
| Recharts | 3.6.0 | Graphiques |
| Lucide React | 0.562.0 | Icons |
| i18next + react-i18next | ^25.7.4 | Internationalisation |

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Better-Auth | 1.4.10 | Authentification |
| Drizzle ORM | 0.45.1 | ORM PostgreSQL |
| PostgreSQL (Neon) | 16 | Base de données serverless |
| Zod | 4.3.5 | Validation |

### DevOps
| Technologie | Version | Usage |
|-------------|---------|-------|
| PNPM | 9.15.4 | Package Manager |
| Docker | - | Containerisation |
| Vitest | 4.0.16 | Tests |
| ESLint | ^9 | Linting |

### PWA
- Service Worker (pour le mode hors ligne)
- `manifest.webmanifest`
- Icons adaptées pour mobile/desktop

---

## 🏛️ Architecture

### 1. Structure des Dossiers
```
amt-express/
├── app/                          # Routes Next.js (App Router)
│   ├── (admin)/                   # Groupe admin (garde isAdmin) : /ride-management, /ride-management/new
│   ├── (driver)/                  # Groupe chauffeur (garde isDriver) : /driver-rides, /driver-rides/[id]
│   ├── (connected)/               # Pages communes authentifiées : /settings, /profile
│   ├── connections/               # Authentification
│   ├── page.tsx                   # Dispatcher : lit le rôle en session et rend le dashboard adéquat
│   └── layout.tsx                 # Root Layout (providers, i18n, PWA)
│
├── components/                   # Composants React
│   ├── admin/                     # Composants Admin
│   ├── driver/                    # Composants Chauffeur
│   ├── customer/                  # Composants Client
│   ├── shared/                    # Composants partagés
│   └── classicComponents/         # Composants réutilisables (Button, Input)
│
├── context/                      # Contextes React
│   ├── I18nProvider.tsx           # i18n
│   └── SessionContext.tsx         # Session utilisateur
│
├── lib/                          # Logique métier
│   ├── actions/                   # Server Actions (points d'entrée)
│   ├── controllers/               # Contrôleurs (validation métier)
│   ├── services/                  # Services (logique métier pure)
│   ├── auth/                      # Authentification (Better-Auth)
│   ├── db/                        # Base de données (Drizzle)
│   ├── middleware/                # Middleware (rôles)
│   ├── types/                     # Types TypeScript
│   ├── utils/                     # Utilitaires
│   └── validations/               # Schémas Zod
│
├── content/                       # Contenu statique
│   └── database_types/            # Types DB (roles, rides, etc.)
│
├── locales/                       # Traductions
│   ├── en.json                    # Anglais
│   └── fr.json                    # Français
│
├── test/                         # Tests
│   ├── unit/                      # Tests unitaires (mocks complets)
│   │   ├── actions/               # Tests des Server Actions
│   │   ├── components/            # Tests des composants
│   │   └── services/              # Tests des services
│   └── integration/               # Tests d'intégration (DB mockée)
│       └── actions/
│
└── drizzle/                      # Migrations Drizzle
```

### 2. Flux de Données (Couches Strictes)
```
Client / Chauffeur / Admin
        ↓
   App Router (Next.js)
        ↓
   Server Actions (lib/actions/)
        ↓ (Validation Zod)
   Controllers (lib/controllers/)
        ↓ (Validation métier + Gestion d'erreurs)
   Services (lib/services/)
        ↓ (Logique métier)
   Drizzle ORM
        ↓
   PostgreSQL (Neon)
```

### 3. Route Groups + Dispatcher (Gestion des Rôles)
- **Plus de Parallel Routes** (décision 2 annulée, voir audit) : une seule page par URL
- `app/page.tsx` est un **dispatcher serveur** qui lit le rôle via `getSessionWithRole()` et rend le composant dashboard correspondant (`components/dashboard/{Admin,Driver,Customer}Dashboard.tsx`)
- Chaque groupe de rôle porte sa **garde** dans son `layout.tsx` : `(admin)/layout.tsx` vérifie `isAdmin`, `(driver)/layout.tsx` vérifie `isDriver`, `(connected)/layout.tsx` vérifie la session — la vérification précède **toujours** le rendu
- **Hiérarchie des rôles** : `admin > driver > customer`

### 4. Authentification
- **Better-Auth** + **Drizzle Adapter**
- **Plugins** : `nextCookies()`, `admin({ defaultRole: 'customer' })`
- **Email/Password** + vérification par email obligatoire
- **Sessions** : Cookies HTTP-only
- **Middleware** : `verifyRole('admin')` dans les Server Actions

---

## 📜 Conventions

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `DashboardCard.tsx` |
| Fonctions | camelCase | `getRides()` |
| Variables | camelCase | `const userRole = 'admin'` |
| Constantes | UPPER_CASE | `const MAX = 100` |
| Types | PascalCase | `type UserRole = ...` |
| Fichiers | kebab-case | `ride-management.ts` |
| Dossiers | kebab-case | `lib/validations/` |

### Commits
- **Format** : `[type](scope): message`
  - `type` : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - `scope` : `auth`, `rides`, `dashboard`, `db`, etc.
- **Exemples** :
  - `feat(auth): add email verification`
  - `fix(rides): correct status update bug`
  - `docs: update README.md`

### Branches
- **Git Flow** :
  - `main` : Production (jamais modifiée directement)
  - `development` : Intégration des features
  - `feature/*` : Nouvelles fonctionnalités
  - `hotfix/*` : Corrections urgentes

### Tests
- **Tests unitaires** (`test/unit/`) :
  - Toutes les dépendances externes **mockées**
  - Exécution **rapide** et **isolée**
- **Tests d'intégration** (`test/integration/`) :
  - DB **mockée** mais logique métier testée
  - Vérifient l'intégration entre modules
- **Commandes** :
  ```bash
  pnpm test:unit      # Tous les tests unitaires
  pnpm test:integration # Tous les tests d'intégration
  pnpm test:coverage  # Rapport de couverture
  ```

---

## 🔄 Workflows

### 1. Développement d'une Nouvelle Fonctionnalité
1. **Créer une branche** :
   ```bash
   git checkout development
   git checkout -b feature/[nom-de-la-feature]
   ```
2. **Écrire le test défaillant** (TDD-first) :
   - Créer un test unitaire dans `test/unit/` ou `test/integration/`
   - Le test doit **échouer** avant l'implémentation
3. **Implémenter** :
   - Suivre les **couches** : Server Action → Controller → Service → DB
   - **Ne pas court-circuiter** les couches
4. **Valider** :
   - `pnpm lint` → **0 erreur**
   - `pnpm build` → **succès**
   - `pnpm test` → **tous les tests passent**
5. **commit + push** :
   ```bash
   git add .
   git commit -m "feat([scope]): [message]"
   git push origin feature/[nom-de-la-feature]
   ```
6. **PR vers `development`** :
   - Décrire les changements
   - Lier la PR à une issue (si applicable)

### 2. Correction de Bug
1. **Reproduire le bug** :
   - Créer un **test défaillant** qui reproduit le bug
2. **Identifier la cause** :
   - Grep le codebase pour trouver le code concerné
   - Vérifier les logs et les erreurs
3. **Corriger** :
   - Modifier le code **minimalement**
   - Suivre les mêmes conventions
4. **Valider** :
   - Le test passe
   - `pnpm ci` (lint + build + tests) passe
5. **commit + push** :
   ```bash
   git checkout -b hotfix/[nom-du-bug]
   git commit -m "fix([scope]): [description]"
   git push origin hotfix/[nom-du-bug]
   ```

### 3. Review de Code
- **Checklist** :
  - [ ] Le code suit-il les **couches** ?
  - [ ] Les **Servers Actions** délèguent-elles aux Controllers ?
  - [ ] Les **Controllers** appellent-ils les Services ?
  - [ ] Les **Services** utilisent-ils Drizzle ORM ?
  - [ ] Les **tests** couvrent-ils la nouvelle logique ?
  - [ ] Le **lint** passe-t-il ?
  - [ ] Le **build** passe-t-il ?

---

## 📊 État Actuel du Projet

### ✅ Ce qui Fonctionne
- **Authentification** : Inscription/Connexion/Déconnexion avec Better-Auth
- **Gestion des rôles** : Admin/Chauffeur/Client avec hiérarchie
- **CRUD Courses** : Création, lecture, mise à jour, suppression
- **Tableaux de bord** : KPI et graphiques (Recharts)
- **Import CSV** : Avec backup automatique
- **Internationalisation** : FR/EN avec i18next
- **Validation** : Zod pour toutes les entrées
- **PWA** : Mode hors ligne avec Service Worker

### ⚠️ Problèmes Connus
| Problème | Impact | Priorité | Statut |
|----------|--------|----------|--------|
| **Lint échoue** (Hooks conditionnels) | Bloque le build | ⭐⭐⭐ | À corriger |
| **Schémas Zod dupliqués** (`AuthController` vs `validations/auth.ts`) | Maintenance difficile | ⭐⭐⭐ | À unifier |
| **By-pass sécurité en test** (`NODE_ENV=test` désactive `roleMiddleware`) | Tests peu réalistes | ⭐⭐ | À améliorer |
| **GPS non implémenté** | Fonctionnalité manquante | ⭐⭐ | En attente |
| **OCR non implémenté** | Fonctionnalité manquante | ⭐ | En attente |
| **Paiements non implémentés** | Fonctionnalité manquante | ⭐ | En attente |

### 📈 Métriques
- **Couverture de test** : À mesurer (`pnpm test:coverage`)
- **Nombre de tables DB** : 19
- **Nombre de Server Actions** : 10+
- **Nombre de Services** : 7+
- **Nombre de Controllers** : 8+

---

## 🎯 Tâches Prioritaires

### 🔥 Critiques (À faire avant toute nouvelle feature)
| ID | Tâche | Description | Priorité | Statut |
|----|-------|-------------|----------|--------|
| T-001 | **Fix Hooks conditionnels** | Corriger `useState`/`useEffect` dans `app/(admin)/ride-management/` | ⭐⭐⭐ | ⏳ |
| T-002 | **Unifier schémas Zod** | Supprimer les doublons entre `AuthController` et `validations/auth.ts` | ⭐⭐⭐ | ⏳ |
| T-003 | **Améliorer roleMiddleware en test** | Remplacer `NODE_ENV=test` par des mocks contrôlés | ⭐⭐ | ⏳ |

### ⭐ Importantes
| ID | Tâche | Description | Priorité | Statut |
|----|-------|-------------|----------|--------|
| T-004 | **Créer `code-map.md`** | Cartographier le projet pour le skill tour-de-main | ⭐⭐⭐ | ✅ (En cours) |
| T-005 | **Vérifier `pnpm build`** | S'assurer que le build passe | ⭐⭐ | ⏳ |
| T-006 | **Vérifier `pnpm typecheck`** | S'assurer que les types sont corrects | ⭐⭐ | ⏳ |

### 📋 Moyennes
| ID | Tâche | Description | Priorité | Statut |
|----|-------|-------------|----------|--------|
| T-007 | **Ajouter des tests manquants** | Couverture complète des Services/Controllers | ⭐ | ⏳ |
| T-008 | **Documenter les API** | Swagger/OpenAPI pour les routes | ⭐ | ⏳ |
| T-009 | **Optimiser les requêtes DB** | Index manquant, requêtes lentes | ⭐ | ⏳ |

---

## 🏛️ Décisions Architecturales

### Décision 1 : Architecture en Couches
- **Contexte** : Éviter le spaghetti code et rendre le projet maintenable
- **Décision** : Adopter une architecture **Server Actions → Controllers → Services → DB**
- **Justification** :
  - Séparation claire des responsabilités
  - Tests plus faciles (chaque couche peut être testée isolément)
  - Maintenance simplifiée (on sait où chercher pour un bug)
- **Date** : 2026-07-XX (avant le début du projet)

### Décision 2 : ~~Parallel Routes pour les Rôles~~ (ANNULÉE — remplacée par Route Groups + dispatcher)
- **Contexte** : Gérer 3 types d'utilisateurs avec des UI très différentes
- **Décision initiale** : Parallel Routes (`@admin`, `@driver`, `@customer`)
- **Pourquoi ça a échoué** : les slots se rendent *en plus* de la route primaire à la même URL et ne créent pas d'URL propres → pages déplacées en slot = URLs mortes (404 sur `/ride-management`, `/settings`, `/profile`, `/driver-rides`), double rendu (page en haut + dashboard en bas), hacks en cascade (page `null`, `SlotRenderer`, `default.tsx`)
- **Décision actuelle** : `app/page.tsx` = dispatcher serveur par rôle ; groupes `(admin)`/`(driver)`/`(connected)` avec garde par layout. Vérifié : chaque URL a exactement une page, zéro hack
- **Piège documenté pour settings/profile** : c'est le SEUL cas où un slot parallèle aurait du sens (panneaux spécifiques par rôle rendus *côte à côte* avec une page commune) — à rebrancher uniquement le jour où des sections exclusives par rôle existeront réellement
- **Date** : 2026-07-XX (initiale) — annulée le 2026-11-19

### Décision 3 : Better-Auth pour l'Authentification
- **Contexte** : Besoin d'une solution d'authentification **sécurisée** et **simple**
- **Décision** : Utiliser **Better-Auth** avec **Drizzle Adapter**
- **Justification** :
  - Intégration native avec Next.js
  - Support des rôles et bannissements
  - Sessions gérées avec cookies HTTP-only (sécurité)
  - Moins de code à maintenir que NextAuth.js
- **Date** : 2026-07-XX

### Décision 4 : Drizzle ORM
- **Contexte** : Choix d'un ORM pour PostgreSQL
- **Décision** : Utiliser **Drizzle ORM** (au lieu de Prisma, TypeORM, etc.)
- **Justification** :
  - **Type-safe** (génère des types TypeScript à partir du schema DB)
  - **Léger** (pas de runtime lourd)
  - **Moderne** (SQL-first, pas de syntaxe propriétaire)
  - **Bon support pour Neon (serverless PostgreSQL)**
- **Date** : 2026-07-XX

### Décision 5 : Zod pour la Validation
- **Contexte** : Validation des entrées (formulaires, API, etc.)
- **Décision** : Utiliser **Zod** pour toutes les validations
- **Justification** :
  - **Type-safe** (infère les types TypeScript)
  - **Composable** (schémas réutilisables)
  - **Messages d'erreur clairs**
- **Date** : 2026-07-XX

### Décision 6 : Vitest pour les Tests
- **Contexte** : Choix d'un framework de test
- **Décision** : Utiliser **Vitest** (au lieu de Jest)
- **Justification** :
  - **Rapide** (exécution en parallèle)
  - **Compatible avec ESM** (Next.js 16 utilise ESM)
  - **Bon support pour React Testing Library**
- **Date** : 2026-07-XX

---

## 📝 Audit des Sessions

### Session 1 - 2026-10-02 (Initialisation)
- **Objectif** : Explorer le projet et créer `PROJET.md` + `code-map.md`
- **Actions réalisées** :
  - [x] Exploration complète du projet (`amt-express/`)
  - [x] Lecture de `README.md` et `ARCHITECTURE_MODELE.md`
  - [x] Analyse des couches (Server Actions, Controllers, Services, DB)
  - [x] Identification des problèmes (Lint, doublons Zod, etc.)
  - [x] Création de `PROJET.md` (ce fichier)
  - [x] Création de `.vibe/plans/code-map.md`
- **Problèmes découverts** :
  - Lint échoue (`useState`/`useEffect` conditionnels)
  - Schémas Zod dupliqués (`AuthController` vs `validations/auth.ts`)
  - By-pass sécurité en test (`NODE_ENV=test`)
- **Prochaines étapes** :
  - Corriger les erreurs Lint (T-001)
  - Unifier les schémas Zod (T-002)
  - Créer un plan pour T-001 et T-002

### Session 2 - 2026-11-19 (Fix Parallel Routes → Route Groups)
- **Objectif** : Corriger le gros problème de rendu des Parallel Routes (double rendu, URLs 404)
- **Diagnostic** :
  - Les slots se rendent *en plus* de la route primaire : les pages déplacées en slot ont perdu leur URL
  - `app/page.tsx` (`return null`), `SlotRenderer` et les `default.tsx` null étaient des compensations du mauvais pattern
  - 404 : `/ride-management`, `/ride-management/new`, `/driver-rides`, `/settings`, `/profile` — mortes depuis la migration `a570287`
- **Actions réalisées** (branch `feature/parallel-routes`, commits `2c86a2e` + `0bea2e1`) :
  - [x] Dispatcher serveur `app/page.tsx` (admin > driver > customer, redirect `/connections`)
  - [x] Dashboards extraits en composants (`AdminDashboard`/`DriverDashboard` code mort recyclé, `CustomerDashboard` nouveau + fix `useEffect [t]`)
  - [x] Suppression : slots `@*`, `SlotRenderer`, hi-jacks du layout racine (−1451 lignes nettes)
  - [x] Groupes garde : `(admin)` isAdmin, `(driver)` isDriver, `(connected)` session — vérification AVANT tout rendu
  - [x] `(admin)/ride-management/new` : wrapper mince `AddRideModal mode="page"` (anti-doublon)
  - [x] `(driver)/driver-rides/[id]` déplacé dans le groupe → garde couvre le détail
- **Gates** : lint 0 erreur · 240/240 tests verts · build OK · curl non-auth : toutes les URLs → `/connections?returnTo=…`, plus aucune page blanche
- **Découvertes annexes (à traiter)** :
  `proxy.ts` appelle `getSessionWithRole()` 2× de suite (commentaire obsolète « manquant actuellement ») ; commentaires obsolètes mentionnant les Parallel Routes dans `proxy.ts`
- **Validation utilisateur restante** : parcours authentifié par rôle (admin/chauffeur/client × chaque URL) avec vraie session

### Session 3 - 2026-11-19 (RGPD : suppression de compte par anonymisation)
- **Objectif** : droit à l'effacement RGPD présentable en soutenance (commit `c6f9160`)
- **Actions réalisées** (TDD : 4 tests unit ProfileController écrits avant l'implémentation) :
  - [x] `ProfileService.anonymizeAccount` : PII effacées sur la ligne `users` (name='', email=`deleted-{id}@anonymized.invalid`, password null, image/coords null), **ligne conservée** donc FK courses/factures intactes
  - [x] Double verrou reconnexion : `banned=true` + `banReason='account_deleted'` + password effacé + sessions supprimées
  - [x] UI : zone danger en bas du profil (rouge tamisé → hover rouge vif), modale de confirmation RGAA, `signout()` gère le redirect
  - [x] Helper `getUserDisplayName` (i18n « Utilisateur supprimé »/« Deleted user ») appliqué aux 10 sites de rendu de noms — les filtres/tri restent sur données brutes (normal)
  - [x] i18n FR/EN (namespace `account`)
- **Gates** : lint 0 erreur · 244/244 tests (+4 RGPD) · build vert
- **Points à connaître pour la soutenance** :
  - Anonymisation ≠ suppression : obligation de conservation des données de facturation/organisation, effacement des PII (démonstration parlante)
  - `userId` vient toujours de la session serveur, jamais du client (durée de vie d'un token impossible à souvenir)
  - Le driver neon-http ne supporte pas les transactions : les 3 statements sont ordonnés, verrou le plus fort en premier (bannissement)
- **Découvertes annexes (backlog)** : les dropdowns admin (AddRideModal) listent les users anonymisés comme sélectionnables — à filtrer sur `banReason != 'account_deleted'` si besoin

---

## 📋 Backlog

### Audit du 2026-11-19 — écarts interface vs implémentation
| ID | Constat | Priorité |
|----|---------|----------|
| A-001 | Bouton « Mot de passe oublié ? » affiché (connections) mais écran informatif "coming soon" — aucun flux réel. Combiné à la suppression anonymisante, un mot de passe perdu = compte perdu définitivement | 🔴 |
| A-002 | KPI « Factures en attente » (dashboard admin) compte la table `invoices` qu'aucun code n'alimente — figé à 0 | 🔴 |
| A-003 | Clé i18n cassée `common.signingOut` (ProfilePopup) — affiche la clé brute pendant la déconnexion | 🟡 |
| A-004 | `AddRideModal` sans `role="dialog"` — seule modale non conforme RGAA de l'app | 🟡 |
| A-005 | 97 clés i18n absentes du dico, comblées par texte dur : pages légales (FR figé aussi en EN), DriverRidesView (EN figé aussi en FR), error/notFound, Authentication, messages ridesManagement | 🟡 |
| A-006 | `proxy.ts` appelle `getSessionWithRole()` 2× de suite (commentaire obsolète bloc 3→2) | 🟢 |
| A-007 | Tables `notifications`/`notification_preferences` en DB sans aucune UI ni écriture | 🟢 |
| A-008 | Badge « Navigation GPS — bientôt disponible » (LivingRide) — voulu, pointer F-001 en démo | ℹ️ |
| A-009 | Dropdowns admin (AddRideModal) listent les comptes anonymisés comme sélectionnables | 🟢 |

### Features à Implémenter
| ID | Titre | Description | Priorité | Statut |
|----|-------|-------------|----------|--------|
| F-001 | **Suivi GPS en temps réel** | Intégrer une API de géolocalisation (ex: Google Maps, Mapbox) | ⭐⭐ | 🚧 |
| F-002 | **OCR pour scanning de tickets** | Reconnaître les tickets papier via OCR (ex: Tesseract.js) | ⭐ | 🚧 |
| F-003 | **Intégration paiement** | Stripe/PayPal pour les factures | ⭐ | 🚧 |
| F-004 | **Chat interne** | Messagerie entre chauffeurs/admins/clients | ⭐ | 🚧 |
| F-005 | **Notifications push** | Notifications en temps réel (ex: nouvelle course) | ⭐ | 📋 |

### Améliorations Techniques
| ID | Titre | Description | Priorité | Statut |
|----|-------|-------------|----------|--------|
| I-001 | **Optimiser les requêtes DB** | Ajouter des index, éviter N+1 queries | ⭐⭐ | 📋 |
| I-002 | **Cacher les données fréquentes** | Redis pour les données rarement modifiées (ex: liste des chauffeurs) | ⭐ | 📋 |
| I-003 | **Améliorer les errors logs** | Centraliser les logs avec des IDs uniques | ⭐ | 📋 |

### Documentation
| ID | Titre | Description | Priorité | Statut |
|----|-------|-------------|----------|--------|
| D-001 | **Documenter les API** | Swagger/OpenAPI pour les routes | ⭐ | 📋 |
| D-002 | **Guide de déploiement** | Documenter le déploiement sur Vercel/Neon | ⭐⭐ | 📋 |
| D-003 | **Guide de contribution** | Pour les nouveaux contributeurs | ⭐ | 📋 |

---

## 🔗 Ressources

### Documentation Externe
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Better-Auth Docs](https://better-auth.com/)
- [Vitest Docs](https://vitest.dev/)
- [Zod Docs](https://zod.dev/)
- [Neon (PostgreSQL Serverless)](https://neon.tech/)

### Documentation Interne
- [README.md](README.md) - Installation, configuration, scripts
- [ARCHITECTURE_MODELE.md](ARCHITECTURE_MODELE.md) - Architecture détaillée
- [documentation/](documentation/) - Guides spécifiques (Docker, Git Flow, etc.)
- [Instructions/](Instructions/) - Spécifications fonctionnelles

### Outils
- **EditorConfig** : `.editorconfig` (à créer si absent)
- **ESLint** : `eslint.config.mjs`
- **TypeScript** : `tsconfig.json`
- **Drizzle** : `drizzle.config.ts`

---

## 📅 Historique des Changements

| Date | Auteur | Changement |
|------|--------|------------|
| 2026-10-02 | Ada (Vibe) | Création initiale de `PROJET.md` et `code-map.md` |

---

## 💡 Notes

- **Base de données** : Chaque branche a sa propre DB Neon (serverless PostgreSQL).
- **Middleware de rôle** : Doit être **utilisé en tests** (pas de by-pass via `NODE_ENV=test`).
- **Conventions** : Aucune convention spécifique supplémentaire évoquée. Suivre les standards du projet (PascalCase pour les composants, camelCase pour les fonctions, etc.).
- **Fichiers à ne pas toucher** : Aucun (tout peut être modifié avec justification).

---

*Ce fichier est la **source de vérité** du projet. toute modification doit être validée par Alexis Santos.*
