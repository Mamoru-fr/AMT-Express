# Décisions Architecturales - AMT-Express

*Ce fichier documente les choix techniques majeurs et leurs justifications.*

---

## 📜 **Table des Matières**
1. [Backend](#backend)
2. [Frontend](#frontend)
3. [Base de Données](#base-de-données)
4. [Tests](#tests)
5. [CI/CD](#cicd)
6. [Sécurité](#sécurité)
7. [Internationalisation (i18n)](#internationalisation-i18n)

---

## 🏗 **Backend**

### **1. Utilisation de Next.js 16 (App Router)**
- **Décision** : Adopter Next.js 16 avec l’App Router pour la gestion des routes.
- **Pourquoi ?**
  - Supporte les **Parallel Routes** (ex: `@admin/`, `@driver/`, `@customer/`), essentiel pour les rôles distincts.
  - **Server Components** par défaut : optimisation des performances (moins de JS côté client).
  - Intégration native avec **React 19** et **TypeScript**.
  - **Middleware** (ex: `proxy.ts`) pour la gestion des requêtes avant le rendu.
- **Alternatives envisagées** : Remix, SvelteKit.
- **Date** : [À remplir]

---

### **2. Authentification avec Better Auth**
- **Décision** : Utiliser [Better Auth](https://better-auth.com/) au lieu de NextAuth.js.
- **Pourquoi ?**
  - **Léger** et **modulaire** (pas de dépendances lourdes comme NextAuth).
  - Supporte les **emails de vérification** et les **rôles personnalisés** (Admin/Driver/Customer).
  - Compatible avec **PostgreSQL** et **Drizzle ORM**.
- **Alternatives envisagées** : NextAuth.js, Clerk, Supabase Auth.
- **Date** : [À remplir]

---

### **3. Gestion des Rôles**
- **Décision** : Implémenter une logique de rôles **côté serveur** (pas seulement côté client).
- **Pourquoi ?**
  - **Sécurité** : Éviter la manipulation des rôles via le frontend.
  - **Parallel Routes** : Next.js permet d’afficher des layouts différents selon le rôle (ex: `@admin/layout.tsx`).
- **Implémentation** :
  - Vérification du rôle dans les **server actions** (ex: `actions/AuthActions.ts`).
  - Utilisation de **middlewares** pour rediriger les utilisateurs non autorisés.
- **Date** : [À remplir]

---

## 🎨 **Frontend**

### **1. Tailwind CSS 4**
- **Décision** : Passer à Tailwind CSS 4 (en beta).
- **Pourquoi ?**
  - **performances** : Réduction de la taille du CSS généré.
  - **@apply** et **arbitrary variants** améliorés.
  - Intégration native avec **PostCSS 4**.
- **Risques** : Version beta → surveillance des breaking changes.
- **Alternatives envisagées** : Styled Components, Emotion, CSS Modules.
- **Date** : [À remplir]

---

### **2. Composants Réutilisables**
- **Décision** : Structurer les composants en deux catégories :
  - **`classicComponents/`** : Boutons, inputs, modales (réutilisables par tous les rôles).
  - **`[role]/`** (ex: `admin/`, `driver/`) : Composants spécifiques à un rôle.
- **Pourquoi ?**
  - **Maintenabilité** : Éviter la duplication de code.
  - **Clarté** : Savoir immédiatement où chercher un composant.
- **Exemple** :
  - `Button.tsx` → `classicComponents/`
  - `AdminSidebar.tsx` → `components/admin/`
- **Date** : [À remplir]

---

### **3. Gestion d’État**
- **Décision** : Utiliser **React Context** + **usetState** pour l’état local, et **server actions** pour les mises à jour côté serveur.
- **Pourquoi ?**
  - **Simplicité** : Pas besoin de Redux ou Zustand pour ce projet (état global limité).
  - **Next.js 16** encourage les server actions pour les mutations.
- **Cas d’usage** :
  - **Context** : Thème, langue (i18n), état de l’authentification.
  - **Server Actions** : Création/modification de courses, gestion des utilisateurs.
- **Alternatives envisagées** : Redux Toolkit, Zustand, Jotai.
- **Date** : [À remplir]

---

### **4. Internationalisation (i18n)**
- **Décision** : Utiliser **i18next** + **react-i18next**.
- **Pourquoi ?**
  - **Flexibilité** : Supporte les traductions dynamiques et statiques.
  - **Intégration** : Fonctionne bien avec Next.js (via middleware ou client-side).
- **Structure** :
  - Fichiers de traduction dans `locales/en/` et `locales/fr/`.
  - Chargement côté client pour éviter les hydratation mismatches.
- **Alternatives enviasgées** : Next-Intl, Lingui.
- **Date** : [À remplir]

---

## 🗃 **Base de Données**

### **1. PostgreSQL + Drizzle ORM**
- **Décision** : Utiliser **PostgreSQL** avec **Drizzle ORM**.
- **Pourquoi ?**
  - **Drizzle** :
    - **Léger** (pas de runtime lourd comme Prisma).
    - **Type-safe** : Génère des types TypeScript automatiquement.
    - **SQL-like** : Proche du SQL brut (bon pour les devs habitués à PostgreSQL).
  - **PostgreSQL** :
    - **Fiabilité** : Base de données relationnelle mature.
    - **Scalabilité** : Supporte les grosses charges.
- **Alternatives envisagées** : Prisma, TypeORM, Supabase.
- **Date** : [À remplir]

---

### **2. Schéma de la Base de Données**
- **Décision** : Modéliser les tables suivantes :
  - **`users`** : Utilisateurs (Admin/Driver/Customer).
  - **`rides`** : Courses (statut, driver, customer, etc.).
  - **`ride_status`** : Statuts des courses (enum : `pending`, `assigned`, `completed`, etc.).
  - **`user_roles`** : Rôles des utilisateurs (pour la gestion des permissions).
- **Pourquoi ?**
  - **Normalisation** : Éviter la redondance (ex: statut d’une course = clé étrangère vers `ride_status`).
  - **Flexibilité** : Ajout facile de nouveaux statuts ou rôles.
- **Diagramme** : Voir [ModelDbMCD.md](https://github.com/alexissantos/AMT-Express/blob/development/documents/technicalSpecifications/modelDb/ModelBdMCD.md).
- **Date** : [À remplir]

---

## 🧪 **Tests**

### **1. Vitest pour les Tests Unitaires et d’Intégration**
- **Décision** : Utiliser **Vitest** au lieu de Jest.
- **Pourquoi ?**
  - **Vitesse** : Vitest est plus rapide (basé sur Vite).
  - **ESM** : Meilleure gestion des modules ES.
  - **Intégration** : Fonctionne bien avec Next.js et TypeScript.
- **Structure des tests** :
  - **`test/unit/`** : Tests unitaires (composants, utils, services).
  - **`test/integration/`** : Tests d’intégration (ex: actions Server Actions).
- **Alternatives envisagées** : Jest, Playwright (pour l’E2E).
- **Date** : [À remplir]

---

### **2. Couverture de Tests**
- **Décision** : Visible une couverture de tests **> 80%** pour le code critique (actions, services, utils).
- **Pourquoi ?**
  - **Qualité** : Réduire les bugs en production.
  - **Maintenabilité** : Faciliter les refactors.
- **Outils** : Utilisation de `vitest --coverage` avec **c8** ou **istanbul**.
- **Statut actuel** : 239 tests passent, 1 échoue (à investiguer).
- **Date** : [À remplir]

---

## ⚙️ **CI/CD**

### **1. GitHub Actions pour les Tests et Déploiement**
- **Décision** : Automatiser les workflows avec GitHub Actions.
- **Workflows existants** :
  - **`build.yml`** : Build du projet (sur PR vers `main`).
  - **`tests-unit.yml`** : Tests unitaires.
  - **`tests-integration.yml`** : Tests d’intégration.
  - **`deploy-to-vercel-*.yml`** : Déploiement sur Vercel (UAT et Production).
- **Pourquoi ?**
  - **Intégration continue** : Vérifier que le code fonctionne avant de merger.
  - **Déploiement continu** : Déployer automatiquement sur Vercel après un merge.
- **Améliorations possibles** :
  - Ajouter un workflow pour **vérifier les dépendances obsolètes** (ex: `pnpm outdated`).
  - **Cache** : Utiliser le cache pour accélérer les builds (déjà partiellement fait).
- **Date** : [À remplir]

---

### **2. Déploiement sur Vercel**
- **Décision** : Utiliser **Vercel** pour l’hébergement.
- **Pourquoi ?**
  - **Optimisation Next.js** : Vercel est conçu pour Next.js (edge functions, ISR, etc.).
  - **Facilité** : Déploiement en 1 clic depuis GitHub.
  - **Coût** : Gratuit pour les petits projets.
- **Alternatives envisagées** : Netlify, AWS, Fly.io.
- **Date** : [À remplir]

---

## 🔒 **Sécurité**

### **1. Vérification des Emails**
- **Décision** : Implémenter une **vérification par email** pour l’inscription.
- **Pourquoi ?**
  - **Éviter les faux comptes** : S’assurer que les utilisateurs ont une adresse email valide.
  - **Better Auth** : Gère cela nativement.
- **Flux** :
  1. Utilisateur s’inscrit → email de vérification envoyé.
  2. Liens de vérification **jetables** (expire après 24h).
  3. Accès restreint jusqu’à vérification.
- **Date** : [À remplir]

---

### **2. Protection des Routes**
- **Décision** : Utiliser des **middlewares** et des **server components** pour protéger les routes.
- **Pourquoi ?**
  - **Middleware** (`proxy.ts`) : Vérifie le rôle de l’utilisateur avant d’afficher la route.
  - **Server Components** : Évite d’exposer la logique métier côté client.
- **Exemple** :
  - `/app/@admin/page.tsx` → Accessible **uniquement** si `user.role === 'admin'`.
- **Date** : [À remplir]

---

### **3. Stockage des Secrets**
- **Décision** : Utiliser les **GitHub Secrets** pour les variables sensibles (ex: `DATABASE_URL`, `SMTP_PASSWORD`).
- **Pourquoi ?**
  - **Sécurité** : Éviter de committer des secrets dans le repo.
  - **Vercel** : Les secrets sont automatiquement injectés via les **Environment Variables**.
- **Fichier** : `.env.example` (template pour les nouveaux contributeurs).
- **Date** : [À remplir]

---

## 🌍 **Internationalisation (i18n)**

### **1. Support Français/Anglais**
- **Décision** : Supporter **deux langues** : Français (par défaut) et Anglais.
- **Pourquoi ?**
  - **Marché cible** : Utilisateurs francophones (ex: entreprises de transport au Québec).
  - **Scalabilité** : Facile d’ajouter d’autres langues plus tard.
- **Implémentation** :
  - Fichiers de traduction dans `locales/fr/translation.json` et `locales/en/translation.json`.
  - Utilisation de `useTranslation()` (react-i18next) dans les composants.
- **Alternatives envisagées** : Traductions côté serveur (MOUVE away).
- **Date** : [À remplir]

---

## 📝 **Template pour les Nouvelles Décisions**
```markdown
### **Titre de la Décision**
- **Décision** : [Description concise].
- **Pourquoi ?**
  - [Raison 1].
  - [Raison 2].
- **Alternatives envisagées** : [Liste des alternatives].
- **Risques/Inconvénients** : [Liste].
- **Date** : YYYY-MM-DD
- **Auteur** : [Nom]
- **Liens** : [Liens vers des docs, issues, etc.].
```

---

*Ce fichier est maintenu par **Ada** et l’équipe AMT-Express.*
