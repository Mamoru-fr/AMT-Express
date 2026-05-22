# Git Flow : Guide Pratique pour Alexis

---

## 📌 Concepts Clés
Git Flow est un modèle de gestion de branches pour Git, idéal pour les projets avec des cycles de release structurés.

### Branches Principales
| Branche    | Rôle                                                                 |
|------------|----------------------------------------------------------------------|
| `main`     | Code en production. **Jamais** modifié directement.                 |
| `develop`  | Branche d’intégration pour les nouvelles fonctionnalités.           |

### Branches de Support
| Type        | Préfixe      | Rôle                                                                 |
|-------------|--------------|----------------------------------------------------------------------|
| Feature     | `feature/*`  | Développement de nouvelles fonctionnalités.                         |
| Release     | `release/*`  | Préparation d’une nouvelle version (tests, corrections mineures).   |
| Hotfix      | `hotfix/*`   | Corrections urgentes en production.                                 |

---

## 🛠️ Commandes Essentielles

### 1. Initialisation (à faire une seule fois)
```bash
git flow init
# Suivre les instructions pour configurer les branches principales.
```

### 2. Démarrer une Nouvelle Feature
```bash
git flow feature start nom-de-la-feature
# Exemple :
git flow feature start ajout-panier
```
- Travaille sur ta feature, puis :
```bash
git flow feature finish nom-de-la-feature
# Cela merge automatiquement dans `develop`.
```

### 3. Préparer une Release
```bash
git flow release start 1.2.0
# Corrige les bugs si nécessaire, puis finalise :
git flow release finish 1.2.0
# Cela :
# - Merge la release dans `main` et `develop`.
# - Tag la version.
# - Supprime la branche de release.
```

### 4. Corriger un Bug en Production (Hotfix)
```bash
git flow hotfix start nom-du-hotfix
# Exemple :
git flow hotfix start bug-paiement
# Après correction :
git flow hotfix finish nom-du-hotfix
# Cela merge automatiquement dans `main` et `develop`.
```

---

## 📊 Workflow Visuel (ASCII)
```
┌───────────────────────────────────────────────────────┐
│                      main                             │
└───────────────────────┬───────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│                     develop                           │
└───────────────────────┬───────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌─────────────┐                   ┌─────────────────┐
│ feature/*   │                   │ release/*       │
└─────────────┘                   └─────────────────┘
        │                               │
        ▼                               ▼
┌───────────────────────────────────────────────────────┐
│             (merge dans develop)                      │
└───────────────────────────────────────┘               │
                                                        ▼
┌───────────────────────────────────────────────────────┐
│                     main (tag v1.2.0)                 │
└───────────────────────────────────────────────────────┘
        ▲                               ▲
        │                               │
┌─────────────┐                   ┌─────────────────┐
│ hotfix/*    │                   │ (merge depuis   │
└─────────────┘                   │  develop)       │
        │                           ┌─────────────────┐
        └───────────────┬───────────│   release/*     │
                    ┌───┴───┐       └─────────────────┘
                    │ main  │
                    └───────┘
```

---

## 💡 Bonnes Pratiques
- **Nomme tes branches clairement** : `feature/ajout-panier`, `hotfix/bug-paiement`.
- **Ne laisse pas traîner les branches** : Une feature finie ? Merge ou supprime.
- **Tag tes releases** : `git tag -a v1.2.0 -m "Release 1.2.0"`.
- **Utilise des Pull Requests** pour les merges dans `develop` ou `main`.

---

## ⚠️ Quand Ne Pas Utiliser Git Flow ?
- Projets **très petits** ou **solo** : Un simple `main` + `feature/` suffit.
- Équipes qui préfèrent **GitHub Flow** (branches courtes, merges fréquents dans `main`).
