# Git Flow — AMT Express

> Modèle de gestion de branches pour un cycle de release structuré.

---

## Branches

| Branche | Role |
|---------|------|
| `main` | Code en production — jamais modifié directement |
| `develop` | Intégration des features — branche de travail principale |
| `feature/*` | Nouvelles fonctionnalités |
| `release/*` | Préparation d'une release (tests, corrections mineures) |
| `hotfix/*` | Corrections urgentes en production |

---

## Workflow standard

### 1. Démarrer une feature

```bash
git checkout develop
git checkout -b feature/ma-fonctionnalite

# ... développement, commits ...

# Terminer la feature
git checkout develop
git merge feature/ma-fonctionnalite
git branch -d feature/ma-fonctionnalite
```

Ou avec git-flow :
```bash
git flow feature start ma-fonctionnalite
git flow feature finish ma-fonctionnalite  # merge auto dans develop
```

### 2. Préparer une release

```bash
git flow release start 1.2.0
# Corrections mineures, mise à jour du numéro de version
git flow release finish 1.2.0
# → merge dans main ET develop, tag v1.2.0 créé automatiquement
```

### 3. Corriger un bug en production (hotfix)

```bash
git flow hotfix start bug-critique
# Correction du bug
git flow hotfix finish bug-critique
# → merge dans main ET develop
```

---

## Workflow visuel

```
main       ────────────────────────────────────────────── (tag v1.2.0)
                                                 ↑
develop    ──────────┬──────────────────────┬────┘
                     │                      │
feature/*            └── feature/... ───────┘
                                            │
release/*                              release/1.2.0 ──┘
                                                        ↑
hotfix/*                           hotfix/bug ──────────┘
```

---

## Bonnes pratiques

- **Nommer les branches clairement** : `feature/csv-import`, `hotfix/auth-redirect`
- **Ne pas laisser traîner les branches** : merger ou supprimer dès que terminé
- **Tagger les releases** : `git tag -a v1.2.0 -m "Release 1.2.0"`
- **Passer par une Pull Request** pour tout merge dans `develop` ou `main`
- **`pnpm ci` doit passer** avant d'ouvrir une PR

---

## Initialisation (une seule fois)

```bash
git flow init
# Accepter les valeurs par défaut (main / develop)
```
