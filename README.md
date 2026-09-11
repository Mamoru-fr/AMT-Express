# AMT Express

<p align="center">
  <img src="amt-express/public/logo.svg" alt="AMT Express Logo" width="200" />
</p>

<p align="center">
  <strong>Plateforme web de gestion de courses de taxi pour entreprises de transport et clients professionnels</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/licence-MIT-green" alt="MIT Licence" />
</p>

<p align="center">
  <a href="#-avertissements">⚠️ Avertissements</a> •
  <a href="#-apercu">Aperçu</a> •
  <a href="#-fonctionnalites">Fonctionnalités</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-tests">Tests</a> •
  <a href="#-contribution">Contribution</a>
</p>

---

## ⚠️ Avertissements

> **A lire avant tout clone ou fork**

- Le fichier `amt-express/.env` contient des **secrets réels** (URL Neon, clé Better Auth). Il ne doit **jamais** être poussé sur un dépôt public. Vérifiez qu'il est dans `.gitignore` et **révoquez immédiatement** les credentials s'ils ont été exposés.
- Il n'existe **pas** de fichier `.env.example`. Créez-en un manuellement à partir du template de la section [Variables d'environnement](#️-variables-denvironnement).
- Le `docker-compose.yml` référence `.env.example` comme `env_file` — il ne fonctionnera pas sans ce fichier.
- Le Dockerfile cible **Node.js 20** (`node:20.12.2-alpine`). Utilisez cette version pour des builds reproductibles.
- Le projet est en **développement actif**. Plusieurs fonctionnalités (GPS, OCR, paiements, chat) sont partiellement ou non implémentées.

---

## 📋 A propos

**AMT Express** est une application web full-stack pour les entreprises de transport VTC/taxi. Elle centralise la gestion des courses, des chauffeurs, des clients professionnels (productions cinéma, événementiel…) et de la facturation.

| Objectif | Description |
|----------|-------------|
| **Cataloguer** | Enregistrer et historiser toutes les courses avec leurs détails |
| **Distribuer** | Affecter les courses aux chauffeurs via un planning dynamique |
| **Facturer** | Générer des factures individuelles ou groupées |
| **Importer** | Intégrer des données par formulaire, CSV ou OCR |
| **Notifier** | Alerter les parties prenantes sur les événements critiques |

### Statut

| État | Fonctionnalité |
|------|----------------|
| ✅ | Authentification et gestion des rôles (Admin, Chauffeur, Client) |
| ✅ | Gestion complète des courses (CRUD, statuts, options) |
| ✅ | Tableaux de bord avec KPI |
| ✅ | Import CSV avec sauvegarde automatique |
| ✅ | Schéma de base de données (19 tables) |
| ✅ | Internationalisation Français / Anglais |
| ✅ | Validation côté serveur avec Zod |
| ✅ | PWA avec Service Worker |
| 🚧 | Suivi GPS en temps réel |
| 🚧 | OCR pour scanning de tickets |
| 🚧 | Intégration de paiement (Stripe / PayPal) |
| 🚧 | Chat interne |
| 📋 | Notifications push |
| 📋 | Synchronisation calendrier |

---

## 🖼️ Apercu

<p align="center">
  <img src="amt-express/public/screenshots/desktop-wide.png" alt="Vue desktop" width="800" />
</p>
<p align="center">
  <img src="amt-express/public/screenshots/mobile-narrow.png" alt="Vue mobile" width="300" />
</p>

---

## 🎨 Fonctionnalites

### Utilisateurs

- Inscription / Connexion par email + mot de passe (Better Auth)
- Trois rôles : `admin`, `driver`, `customer` — défaut : `customer`
- Activation manuelle des comptes chauffeurs par un admin
- Bannissement temporaire ou permanent avec motif
- Journal d'activité tracé en base (`activity_logs`)

### Courses

- Formulaire complet : départ, destination, horaire, prix client/chauffeur, options, temps d'attente
- Cycle de statuts : `pending` → `assigned` → `completed` / `cancelled`
- Options tarifaires configurables (nuit, aéroport, véhicule large…)
- Demandes d'assignation : les chauffeurs postulent, l'admin valide
- Notation des trajets (1–5 étoiles + commentaire)
- Import CSV en masse avec backup automatique

### Admin

- Tableau de toutes les courses, filtres avancés, tri multi-colonnes
- KPI : nombre de courses, revenus, taux d'assignation
- Graphiques via Recharts
- Export CSV / PDF (jusqu'à 10 000 lignes)
- Gestion des productions et projets

### Chauffeur

- Courses disponibles et assignées
- Planning des shifts
- Historique et statistiques personnels

### Facturation

- Génération de factures à partir de courses sélectionnées
- Facturation groupée par client ou par période
- Statuts : `unpaid`, `paid`, `cancelled`
- Rappels automatiques (J+7, J+14, J+30)
- Remises exceptionnelles avec justification

---

## 🏗️ Architecture

### Stack technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js App Router | 16.1.1 |
| Langage | TypeScript | ^5 |
| UI | React | 19.2.3 |
| Base de données | PostgreSQL (Neon) | 16 |
| ORM | Drizzle ORM | ^0.45.1 |
| Auth | Better Auth | ^1.4.10 |
| Validation | Zod | ^4.3.5 |
| Tests | Vitest + Testing Library | ^4.0.16 |
| i18n | i18next + react-i18next | ^25.7.4 |
| Graphiques | Recharts | ^3.6.0 |
| Package manager | pnpm | 9.15.4 |

### Structure des dossiers

```
amt-express/
├── app/
│   ├── @admin/             # Espace administrateur (parallel route)
│   ├── @auth/              # Pages connexion / inscription
│   ├── @customer/          # Espace client (history, profile, rides)
│   ├── @driver/            # Espace chauffeur
│   └── connections/        # Layout connexion
├── components/             # Composants React (admin, customer, driver, dashboard…)
├── lib/
│   ├── actions/            # Server Actions (auth, rides, dashboard…)
│   ├── auth/               # Config Better Auth + session helpers
│   ├── controllers/        # Couche entre actions et services
│   ├── db/                 # Client Drizzle + schema.ts
│   ├── middleware/         # roleMiddleware.ts
│   ├── services/           # Logique metier
│   ├── types/              # ActionResponse, ErrorCodes…
│   └── validations/        # Schemas Zod
├── locales/                # fr.json, en.json
├── test/
│   ├── unit/               # Tests unitaires (services, composants, actions)
│   └── integration/        # Tests avec base de donnees
├── Dockerfile
├── docker-compose.yml
└── drizzle.config.ts
```

### Flux de donnees

```
Client / Chauffeur / Admin
        |
    App Router  (Next.js)
        |
   Server Actions  ← validation Zod
        |
    Controllers
        |
  Role Middleware  ← verifyRole()
        |
     Services
        |
   Drizzle ORM
        |
    PostgreSQL
```

### Authentification

- Sessions sécurisées avec cookies HTTP-only via `nextCookies()`
- Plugin `admin` de Better Auth pour les rôles et bannissements
- `verifyRole()` appelé dans chaque Server Action — bypasse en `NODE_ENV=test`
- Rôle par défaut : `customer`

---

## 🗄️ Base de donnees

Schema : [amt-express/lib/db/schema.ts](amt-express/lib/db/schema.ts)

| Table | Description |
|-------|-------------|
| `users` | Tous les utilisateurs — géolocalisation + bannissement |
| `drivers` | Profil chauffeur (plaque, véhicule, code comptable) |
| `productions` | Sociétés clientes (production, événementiel) |
| `projects` | Projets rattachés à une production |
| `rides` | Courses : lieux, horaires, prix, statut, chauffeur |
| `ride_options` | Suppléments tarifaires configurables |
| `ride_selected_options` | Options choisies par course |
| `ride_customers` | Association course ↔ client + note |
| `ride_managers` | Association course ↔ admin |
| `shift_planning` | Planning des shifts par chauffeur |
| `assignment_requests` | Demandes d'assignation chauffeur → course |
| `invoices` | Factures (totaux, TVA, statut, rappels) |
| `invoice_items` | Lignes de facturation |
| `notifications` | Notifications in-app |
| `notification_preferences` | Préférences email / push |
| `activity_logs` | Journal d'audit |
| `session` / `account` / `verification` | Tables Better Auth |

**Enums :** `ride_status` (`pending`, `assigned`, `completed`, `cancelled`) — `invoice_status` (`unpaid`, `paid`, `cancelled`) — `user_role` (`admin`, `driver`, `customer`)

---

## 🚀 Installation

### Prerequis

| Outil | Version | Notes |
|-------|---------|-------|
| Node.js | 20.x | Version du Dockerfile |
| pnpm | 9.x | `npm install -g pnpm` |
| PostgreSQL | 16+ | Neon (cloud) ou Docker (local) |

### Developpement local

```bash
git clone https://github.com/Mamoru-fr/AMT-Express.git
cd AMT-Express/amt-express

pnpm install

# Créer le fichier d'env (voir section Variables d'environnement)
# et remplir avec vos propres credentials
cp .env .env.local

pnpm db:migrate
pnpm dev
```

→ [http://localhost:3000](http://localhost:3000)

### Docker Compose (PostgreSQL local inclus)

```bash
cd amt-express

# Créer .env.example à partir du template ci-dessous
nano .env.example

docker compose up -d --build
docker compose logs -f app   # suivre les logs
docker compose down
```

> La `DATABASE_URL` est automatiquement configurée pour pointer vers le conteneur PostgreSQL interne — pas besoin de Neon.

### Production

```bash
docker build \
  --build-arg DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --build-arg CSRF_SECRET="votre-csrf-secret" \
  -t amt-express:latest .

docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e BETTER_AUTH_SECRET="..." \
  -e BETTER_AUTH_URL="https://votre-domaine.com" \
  -e NODE_ENV="production" \
  amt-express:latest
```

---

## ⚙️ Variables d'environnement

```bash
# Base de données
# Neon : sslmode=require&channel_binding=require
# Docker : sslmode=disable
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"

# Optionnel — "postgres-js" pour TCP classique, vide pour Neon HTTP
# DB_DRIVER="postgres-js"

# Better Auth — générer avec : openssl rand -base64 32
BETTER_AUTH_SECRET="votre-secret-32-chars-minimum"
BETTER_AUTH_URL="http://localhost:3000"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NODE_ENV="production"  # décommenter en production
```

| Variable | Requise | Description |
|----------|---------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL |
| `BETTER_AUTH_SECRET` | ✅ | Clé de chiffrement des sessions (min. 32 caractères) |
| `BETTER_AUTH_URL` | ✅ | URL publique — utilisée par Better Auth pour les redirections |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL de base pour les métadonnées |
| `DB_DRIVER` | ❌ | `"postgres-js"` pour TCP ; omis pour Neon HTTP |

---

## 🧪 Tests

```bash
pnpm test:unit         # Unitaires (services, validations, composants)
pnpm test:auth         # Intégration — authentification
pnpm test:rides        # Intégration — gestion des courses
pnpm test:integration  # Tous les tests d'intégration
pnpm test:coverage     # Rapport de couverture (lib/ et utils/)
pnpm ci                # Build + tous les tests (pipeline CI)
```

```
test/
├── unit/
│   ├── actions/AuthActions.unit.test.ts
│   ├── components/Button.test.tsx
│   └── services/
│       ├── actionResponse.test.ts
│       ├── import-csv.test.ts
│       ├── isValidUserRole.test.ts
│       ├── translations.test.ts
│       └── validations.test.ts
└── integration/
    └── actions/
        ├── AuthActions.test.ts
        └── RidesManagementActions.test.ts
```

> Les tests d'intégration nécessitent une `DATABASE_URL` valide. `verifyRole()` est bypasse automatiquement en `NODE_ENV=test`.

---

## 🔧 Depannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| `Cannot connect to database` | `DATABASE_URL` manquante ou incorrecte | Vérifier `.env.local`, tester la connexion avec `psql` |
| `Migration failed` | Schema et DB désynchronisés | `pnpm db:push` en développement, `pnpm db:migrate` sinon |
| Docker : `env_file not found` | `.env.example` absent | Créer le fichier (voir section Variables) |
| `BETTER_AUTH_URL` mismatch | URL différente de celle en production | Mettre l'URL publique exacte, sans slash final |
| Build Docker échoue | `DATABASE_URL` non passé en `--build-arg` | Ajouter `--build-arg DATABASE_URL=...` au `docker build` |
| Tests d'intégration échouent | `DATABASE_URL` de test pointe sur la prod | Utiliser une DB de test dédiée |

---

## 🛠️ Scripts

```bash
pnpm db:backup       # Sauvegarde complète de la base
pnpm db:migrate      # Génère et applique les migrations
pnpm db:push         # Pousse le schema sans migration (dev uniquement)
pnpm db:import-csv   # Backup + import CSV
pnpm lint            # ESLint
```

---

## 🤝 Contribution

Le projet suit **Git Flow** :

| Branche | Role |
|---------|------|
| `main` | Production — jamais modifiée directement |
| `develop` | Intégration des features |
| `feature/*` | Nouvelles fonctionnalités |
| `hotfix/*` | Corrections urgentes en production |

```bash
# Démarrer une feature
git checkout develop
git checkout -b feature/ma-fonctionnalite

# Terminer
git checkout develop
git merge feature/ma-fonctionnalite
```

**Avant d'ouvrir une PR :**
1. `pnpm ci` doit passer sans erreur
2. Ajouter un test unitaire pour tout nouveau service ou action
3. Message de commit clair et conventionnel

**Conventions de nommage :** `PascalCase` composants/types — `camelCase` fonctions/variables — `UPPER_CASE` constantes

---

## 📄 Documentation complementaire

| Document | Description |
|----------|-------------|
| [TECHNICAL_ARCHITECTURE.md](documentation/TECHNICAL_ARCHITECTURE.md) | Architecture technique détaillée |
| [SESSION_USAGE_GUIDE.md](documentation/SESSION_USAGE_GUIDE.md) | Utilisation des sessions |
| [CSV_IMPORT_README.md](documentation/CSV_Import/CSV_IMPORT_README.md) | Import CSV |
| [DOCKER_COMMANDS.md](documentation/Docker/DOCKER_COMMANDS.md) | Commandes Docker |
| [GitFlow.md](documentation/GitFlow.md) | Guide Git Flow complet |
| [Cahier des charges](Instructions/Functional%20Requierement%20Moonshot.md) | Spécifications fonctionnelles |

---

## 📜 Licence

MIT © 2026 Alexis Santos (Mamoru)

---

<p align="center">
  Made with care by <a href="https://github.com/Mamoru-fr">Mamoru</a>
</p>