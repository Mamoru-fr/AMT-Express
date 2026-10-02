# Guide de Contribution - AMT-Express

*Merci de contribuer à AMT-Express ! Ce guide explique comment particper au projet.*

---

## 📌 **Table des Matières**
1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Installation du Projet](#installation-du-projet)
4. [Conventions de Code](#conventions-de-code)
5. [Soumettre une Pull Request (PR)](#soumettre-une-pull-request-pr)
6. [Processus de Revue de Code](#processus-de-revue-de-code)
7. [Rapporter un Bug](#rapporter-un-bug)
8. [Proposer une Nouvelle Fonctionnalité](#proposer-une-nouvelle-fonctionnalité)

---

## 🤝 **Code de Conduite**
En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md).
**Soyez respectueux, bienveillant et constructif.**

---

## 🛠 **Comment Contribuer**

### **1. Trouver une Tâche**
- Consultez les **issues** sur [GitHub Issues](https://github.com/alexissantos/AMT-Express/issues).
- Filtrez par label : `good first issue` (pour les débutants), `bug`, `enhancement`, etc.
- Consultez le [SUIVI.md](./SUIVI.md) pour voir les tâches prioritaires.

### **2. Types de Contributions**
| Type                | Description                                  | Exemples                                  |
|---------------------|----------------------------------------------|-------------------------------------------|
| **Bug Fix**         | Corrections de bugs.                        | Fix d’un crash, correction d’un style.    |
| **Nouvelle Fonctionnalité** | Ajout d’une feature.               | Nouvelle page, amélioration UI.        |
| **Documentation**   | Amélioration des docs.                        | Mise à jour du README, ajout de commentaires. |
| **Refactor**        | Amélioration du code existant.               | Optimisation, suppression de code mort. |
| **Tests**           | Ajout ou correction de tests.                | Tests unitaires, d’intégration.            |
| **Chore**           | Tâches de maintenance.                     | Mise à jour des dépendances, ci/cd.       |

---

## 💻 **Installation du Projet**

### **Prérequis**
- [Node.js](https://nodejs.org/) (v20+ recommandé)
- [pnpm](https://pnpm.io/) (obligatoire, voir `pnpm-workspace.yaml`)
- [PostgreSQL](https://www.postgresql.org/) (v16+)
- [Git](https://git-scm.com/)

### **Étapes**
1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/alexissantos/AMT-Express.git
   cd AMT-Express/amt-express
   ```

2. **Installer les dépendances** :
   ```bash
   pnpm install
   ```

3. **Configurer la base de données** :
   - Créer une base PostgreSQL locale.
   - Copier `.env.example` en `.env` et remplir les variables :
     ```bash
     cp .env.example .env
     ```
   - Exécuter les migrations :
     ```bash
     pnpm db:push
     ```

4. **Démarrer le projet** :
   ```bash
   pnpm dev
   ```
   Le projet sera accessible sur [http://localhost:3000](http://localhost:3000).

### **Variables d’Environnement**
| Variable               | Description                          | Exemple                                      |
|------------------------|--------------------------------------|----------------------------------------------|
| `DATABASE_URL`         | URL de la base PostgreSQL.           | `postgresql://user:pass@localhost:5432/db`   |
| `AUTH_SECRET`          | Secret pour l’authentification.     | `un-secret-très-sécurisé`                     |
| `AUTH_SMTP_HOST`       | Hôte SMTP pour les emails.           | `smtp.gmail.com`                             |
| `AUTH_SMTP_PORT`       | Port SMTP.                           | `587`                                        |
| `AUTH_SMTP_USER`       | Utilisateur SMTP.                   | `mon-email@gmail.com`                        |
| `AUTH_SMTP_PASSWORD`   | Mot de passe SMTP.                  | `mon-mot-de-passe`                          |
| `NEXT_PUBLIC_URL`      | URL de l’application.                | `http://localhost:3000`                      |

---

## 📜 **Conventions de Code**

### **1. Formatage**
- **ESLint** : Utilisez la config existante (`eslint.config.mjs`).
  - Exécutez le linter avant de committer :
    ```bash
    pnpm lint
    ```
- **Prettier** : Intégré à ESLint (pas de config séparée).
- **Indentation** : 2 espaces (pas de tabs).

### **2. Nommage**
| Type               | Convention          | Exemple               |
|--------------------|----------------------|-----------------------|
| **Composants**     | PascalCase          | `AdminSidebar.tsx`   |
| **Fonctions**      | camelCase           | `fetchRides()`        |
| **Variables**      | camelCase           | `currentUser`         |
| **Constantes**     | UPPER_SNAKE_CASE    | `MAX_RETRIES = 3`     |
| **Fichiers**       | kebab-case          | `ride-management.ts` |
| **Dossiers**       | kebab-case          | `components/admin/`  |
| **Tests**          | `[nom].test.ts`      | `AuthActions.test.ts`|

### **3. TypeScript**
- **`strict: true`** : Toujours activé (voir `tsconfig.json`).
- **Éviter `any`** : Utilisez des types explicites ou `unknown` si nécessaire.
- **Interfaces Types** : Préférez les `interface` pour les objets, `type` pour les unions/alias.
  ```typescript
  // ✅ Bon
  interface User {
    id: string;
    name: string;
  }
  
  // ❌ À éviter
  type User = {
    id: any;
    name: any;
  };
  ```

### **4. React**
- **Hooks** : Toujours appelés **au niveau racine** du composant (pas dans des `if` ou des boucles).
- **Server Components** : Par défaut dans Next.js 16. Utilisez `'use client'` uniquement si nécessaire.
- **Props** : Typez toujours les props avec une `interface` ou `type`.
  ```tsx
  // ✅ Bon
  interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
  }
  export function Button({ onClick, children }: ButtonProps) { ... }
  ```

### **5. Drizzle ORM**
- **Nommage des tables** : Singulier (ex: `user`, `ride`).
- **Relations** : Utilisez les `relations` de Drizzle pour les jointures.
  ```typescript
  // Exemple : Relation entre User et Ride
  export const rideRelations = relations(rideTable, ({ one }) => ({
    driver: one(userTable, {
      fields: [rideTable.driverId],
      references: [userTable.id],
    }),
  }));
  ```

### **6. Messages de Commit**
Utilisez des messages **clairs et descriptifs**. Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/) :
```bash
# ✅ Bon
feat(ride): add pagination to ride list
fix(auth): prevent duplicate email registration
chore(deps): update pnpm dependencies

# ❌ À éviter
git commit -m "fix stuff"
git commit -m "WIP"
```

---

## 🔀 **Soumettre une Pull Request (PR)**

### **1. Avant de Commencer**
- **Vérifiez les issues** : Assurez-vous qu’aucune issue similaire n’est déjà ouverte.
- **Discutez de la feature** : Pour les grosses modifications, ouvrez une **issue** pour en discuter avant de coder.

### **2. Créer une Branche**
- Nommez votre branche selon la tâche :
  ```bash
  git checkout -b feat/ride-filtering  # Pour une nouvelle feature
  git checkout -b fix/auth-bug        # Pour un bug fix
  git checkout -b chore/update-deps   # Pour une tâche de maintenance
  ```

### **3. Pousser vos Changements**
```bash
git add .
git commit -m "feat(ride): add filtering by status"
git push origin feat/ride-filtering
```

### **4. Ouvrir une PR**
- Allez sur [GitHub PRs](https://github.com/alexissantos/AMT-Express/pulls) et cliquez sur **New Pull Request**.
- **Titre** : court et descriptif (ex: `feat(ride): add filtering by status`).
- **Description** :
  - **Quoi** : Décrivez les changements.
  - **Pourquoi** : Expliquez la motivation (lien vers une issue si applicable).
  - **Comment** : Décrivez brièvement l’implémentation.
  - **Screenshots** : Si UI, ajoutez des captures.
  - **Checklist** :
    - [ ] J’ai vérifié que le code compile (`pnpm build`).
    - [ ] J’ai exécuté `pnpm lint` sans erreurs bloquantes.
    - [ ] J’ai ajouté des tests si nécessaire.
    - [ ] J’ai mis à jour la documentation.

### **5. Cibler la Bonne Branche**
- **Pour les fixes/corrections** : Ciblez `development`.
- **Pour les releases** : Ciblez `main` (uniquement après validation).

---

## 👀 **Processus de Revue de Code**

### **1. Critères pour une PR**
- ✅ **Code fonctionnel** : Pas de bugs évidents.
- ✅ **Tests passés** : Tous les tests locaux passent.
- ✅ **Lint passé** : Aucune erreur bloquante.
- ✅ **Description claire** : La PR explique ce qu’elle fait.
- ✅ **Taille raisonnable** : Les PR trop grosses sont difficiles à reviewer. Préférez les **petites PR** (max 300 lignes de code changé).

### **2. Revue par les Mainteneurs**
- Un mainteneur (ex: Alexis) **review** la PR dans les **48h** (selon la charge).
- **Commentaires** : Les reviews peuvent demander des modifications (ex: typage, formatage, tests).
- **Approbation** : Une fois validée, la PR est **squash & merged** (pour garder l’historique propre).

### **3. Résultat**
- **Merge** : La PR est mergeée dans la branche cible.
- **Rejet** : Si la PR ne répond pas aux critères, elle sera **fermée avec des commentaires** pour être améliorée.

---

## 🐛 **Rapporter un Bug**

### **1. Avant de Créer une Issue**
- Vérifiez que le bug n’est pas déjà rapporté (recherchez dans [GitHub Issues](https://github.com/alexissantos/AMT-Express/issues)).
- Essayez de reproduire le bug sur la **dernière version** de `development`.

### **2. Créer une Issue**
Utilisez le **template** suivant (ou le template GitHub si configuré) :
```markdown
### **Titre**
`bug(ride): [Description concise]`

### **Description**
- **Étapes pour reproduire** :
  1. Aller sur [page X].
  2. Cliquer sur [bouton Y].
  3. Observer [comportement Z].

- **Comportement attendu** : [Ce qui devrait arriver].
- **Comportement actuel** : [Ce qui arrive vraiment].

- **Screenshots/Vidéos** :
  *(Ajoutez des captures si applicable.)*

- **Environnement** :
  - OS: [Windows/macOS/Linux]
  - Navigateur: [Chrome/Firefox/Safari]
  - Version de l’app: [commit hash ou branche]

- **Logs** :
  *(Si erreur dans la console, ajoutez les logs.)*
```

### **3. Labels**
Ajoutez les labels suivants à votre issue :
- `bug`
- `priority:high` (si bloquant) ou `priority:low`
- Le module concerné (ex: `ride`, `auth`, `ui`)

---

## 🚀 **Proposer une Nouvelle Fonctionnalité**

### **1. Avant de Créer une Issue**
- Vérifiez que la feature n’a pas déjà été proposée.
- Réfléchissez à l’**impact** (complexité, temps de dev, maintenance).

### **2. Créer une Issue**
 Utilisez le **template** suivant :
```markdown
### **Titre**
`feat: [Description de la feature]`

### **Description**
- **Problème** : [Pourquoi cette feature est nécessaire ?]
- **Solution proposée** : [Comment l’implémenter ?]
- **Avantages** : [Quels bénéfices pour les utilisateurs ?]

### **Spécifications**
- **NS (Non-Fonctionnel)** :
  - Performances attendues.
  - Compatibilité (ex: mobile/desktop).
- **Fonctionnel** :
  - Cas d’usage.
  - Exigences (ex: "Doit fonctionner hors ligne").

### **马 (Alternatives)**
- [ ] Alternative 1: [Description].
- [ ] Alternative 2: [Description].

### **Notes**
- [ ] Cette feature nécessite une mise à jour de la base de données.
- [ ] Cette feature impacte les performances.
```

### **3. Labels**
Ajoutez les labels :
- `enhancement`
- `priority:medium` (par défaut)
- Le module concerné (ex: `ride`, `dashboard`)

---

## 📚 **Ressources Utilities**
- [Architecture du Projet](https://github.com/alexissantos/AMT-Express/blob/development/ARCHITECTURE_MODELE.md)
- [Documentation Technique](https://github.com/alexissantos/AMT-Express/tree/development/documentation)
- [Suivi du Projet](https://github.com/alexissantos/AMT-Express/blob/development/Suivie%20de%20projet/SUIVI.md)
- [Décisions Architecturales](https://github.com/alexissantos/AMT-Express/blob/development/Suivie%20de%20projet/DECISIONS.md)

---

## 🙏 **Remerciements**
Merci pour votre contribution ! Ensemble, on rend **AMT-Express** meilleur. ❤️

*Maintenu par **Ada** et l’équipe AMT-Express.*
