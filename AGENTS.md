# Instructions pour Ada - Projet AMT-Express

## 🎯 Règles Projects Spécifiques

### 🔴 Sécurité - TOUJOURS Vérifier en Premier
**Ce projet a des enjeux de sécurité critiques.**

#### Règles Obligatoires :
1. **Toutes les requêtes client DOIVENT filtrer par `customerId`**
   - ❌ `fetchPendingRides()` → ✅ `fetchCustomerPendingRides(user.id)`
   - Vérifier avec : `git grep "fetchPendingRides\|fetchAvailableRides" | grep -v "fetchCustomer\|fetchDriver"`

2. **Toutes les actions chauffeur DOIVENT vérifier `driverId`**
   - ❌ `getDriverRideDetail(rideId)` sans check → ✅ Ajouter `if (ride.driverId !== driver.id) return FORBIDDEN`
   - Vérifier avec : `git grep "getDriverRideDetail\|DriverDashboardController"`

3. **Jamais de contourner les Controller**
   - ❌ `Service.method()` directement dans une Action → ✅ Toujours passer par le Controller
   - Vérifier avec : `git grep "Service\." lib/actions/ | grep -v "Controller"`

---

### 🟡 Performance - Éviter les Boucles Infinity
**Problèmes récurrents dans ce codebase** :

#### Règles Obligatoires :
1. **Aucun `useEffect` avec `t` (useTranslation) dans les dépendances**
   - ❌ `}, [t]);` → ✅ `}, []);` ou `}, [someStableDeps]);`
   - Vérifier avec : `git grep "useEffect.*\[.*t\|useCallback.*\[.*t"`

2. **Les fonctions de fetch DOIVENT être stables**
   - ❌ `loadRides` dépend de `filters` ET dans les dépendances du `useEffect` → ✅ Déplacer `loadRides` **hors** des dépendances
   - Vérifier avec : `git grep "useEffect.*loadRides\|useEffect.*loadAvailableDrivers"`

3. **Un seul `useEffect` par responsabilité**
   - ❌ Deux `useEffect` pour le redirect admin → ✅ Garder un seul
   - Vérifier avec : `git grep "Security: Redirect" app/@admin/ride-management/page.tsx | wc -l`

---

### 🟢 Accessibilité - Standards RGAA
**Ce projet doit respecter les normes d'accessibilité.**

#### Règles Obligatoires :
1. **Toutes les modals DOIVENT avoir `role="dialog" aria-modal="true" aria-labelledby="id-title"`**
   - Vérifier avec : `git grep "role=\"dialog\"" | wc -l` (devrait être >= 7)
   - Lister celles manquantes : `find components/ -name "*Modal.tsx" -exec grep -L "role=\"dialog\"" {} \;`

2. **Aucun `outline: none` sans compensation**
   - ❌ `outline: none;` → ✅ `outline: 2px solid transparent; outline-offset: 2px;`
   - Vérifier avec : `git grep "outline: none;" -- "*.css" -- "*.module.css"`

3. **Tous les inputs DOIVENT avoir un label**
   - Vérifier avec : `git grep "<input" | grep -v "htmlFor=\|aria-label=" | head -20`
   - `BookingForm.tsx` est déjà OK (à utiliser comme référence)

---

### 🟢 Architecture - Éviter les Doublons
**Problèmes identifiés dans ce codebase** :

#### Règles Obligatoires :
1. **Vérifier les imports avant de supprimer un fichier**
   ```bash
   git grep "NomDuComposant" | grep -v ".module.css"
   ```

2. **Doublons identifiés à corriger** :
   - ✅ `RidesManagementBoard.tsx` vs `app/@admin/ride-management/page.tsx` → Garder `page.tsx`
   - ✅ `app/@admin/ride-management/new/page.tsx` vs `AddRideModal.tsx` → Garder `AddRideModal`

3. **Ne JAMAIS créer de nouveau doublon**
   - Avant de créer un nouveau composant/page, vérifier :
   ```bash
   find components/ app/ -name "*Nom*" -type f
   ```

---

## 🔧 Outils Préférés pour ce Projet

### 1. Vérifier la sécurité
```bash
# Trouver les appels directs aux Services (contournement de Controller)
git grep "Service\." lib/actions/ | grep -v "Controller"

# Trouver les fetch sans filtre user
git grep "fetch.*Rides\|fetch.*Users" lib/actions/ | grep -v "customerId\|userId\|driverId"
```

### 2. Vérifier les performances
```bash
# Trouver les useEffect avec t dans les dépendances
git grep "useEffect.*\[.*t" -- "*.tsx"

# Trouver les fonctions instables dans useEffect
git grep "useEffect.*loadRides\|useEffect.*load.*" -- "*.tsx"
```

### 3. Vérifier l'accessibilité
```bash
# Modals sans role=dialog
find components/ -name "*Modal.tsx" -exec grep -L "role=\"dialog\"" {} \;

# CSS avec outline: none
Git grep "outline: none;" -- "*.css" -- "*.module.css"

# Inputs sans label
Git grep "<input" -- "*.tsx" | grep -v "htmlFor=\|aria-label=" | head -20
```

### 4. Vérifier les doublons
```bash
# Chercher les composants similaires
find components/ app/ -name "*.tsx" -exec basename {} \; | sort | uniq -d

# Vérifier les imports avant suppression
Git grep "RidesManagementBoard\|AddRideModal" -- "*.tsx" -- "*.ts" | grep -v "\.module\.css"
```

---

## 📋 Workflow Recommandé pour ce Projet

### Étape 1 : Analyse Initiale
```bash
# 1. Voir ce qui a changé
git status --porcelain
git diff --stat HEAD

# 2. Identifier les fichiers critiques
git diff --name-only HEAD | grep -E "(actions|controllers|services)"
```

### Étape 2 : Priorisation
1. **Sécurité** : Vérifier les fichiers `lib/actions/` et `lib/controllers/`
2. **Performance** : Vérifier les `useEffect` et `useCallback`
3. **Accessibilité** : Vérifier les modals et CSS
4. **Architecture** : Vérifier les doublons

### Étape 3 : Correction
- **Un seul edit par fichier** si possible
- **Scripts pour les corrections massives** (CSS, modals)
- **Valider après chaque groupe de corrections**

### Étape 4 : Validation
```bash
# Lint
pnpm lint

# Build
pnpm build

# Vérifier les imports cassés
git diff --name-only HEAD | xargs -I {} sh -c 'git grep "{}" 2>/dev/null | grep -v "\.module\.css\|{}" || echo "{}: OK"'
```

---

## 🎯 Règle Ultime pour ce Projet

> **"Sécurité D'abord, Performance Ensuite, le Reste Peut Attendre."**

1. **Corriger les failles de sécurité** (fuite de données, accès non autorisé) → **PRIORITÉ ABSOLUE**
2. **Corriger les bugs bloquants** (erreur SQL, crash)
3. **Optimiser les performances** (boucles infinies)
4. **Améliorer l'accessibilité** (RGAA)
5. **Nettoyer l'architecture** (doublons)

---

## 📌 Raccourcis Utiles

| Besoin | Commande |
|--------|----------|
| Trouver tous les useEffect problématiques | `git grep "useEffect.*\[" -- "*.tsx" \| grep -E "t\|load.*\|fetch.*"` |
| Trouver les appels DB non filtrés | `git grep "findMany\|findFirst\|query\." lib/services/ -- "*.ts"` |
| Vérifier les permissions manquantes | `git grep "async.*\(" lib/controllers/ -- "*.ts" \| grep -v "verifyRole\|getSession"` |
| Lister les fichiers modifiés | `git diff --name-only HEAD` |
| Voir le diff d'un fichier | `git diff HEAD path/vers/fichier.ts` |

---

## 🚀 Template de Réponse

### Analyse Rapide
```markdown
## 🔍 **Problèmes Identifiés**

### 🔴 **Critique - À corriger URGEMMENT**
1. [Problème] dans [Fichier] → [Impact]

### 🟡 **Important - à corriger ensuite**
1. [Problème] dans [Fichier] → [Impact]

### 🟢 **Moyen - Optimisation**
1. [Problème] dans [Fichier] → [Impact]

## ✅ **Actions Recommandées**
1. Corriger [Problème 1]
2. Corriger [Problème 2]
3. Valider avec `pnpm lint`

## 💬 **Question**
Veux-tu que je commence par [priorité 1] ?
```

---

## 📝 Notes de Session

- **Node.js** : Version **24.7.0** (CI et `.nvmrc`)
- **Base de données** : Neon (PostgreSQL)
- **Framework** : Next.js 16 + Drizzle ORM
- **Auth** : Better Auth + Session middleware
- **Structure** : `app/` (App Router) + `components/` + `lib/` (actions, controllers, services)

---

## 🔄 Mise à Jour Automatique

Ce fichier doit être mis à jour après chaque :
- Nouvelle faille de sécurité identifiée
- Nouveau pattern de performance problématique
- Nouvelle règle d'accessibilité
- Changement majeur dans l'architecture

**Dernière mise à jour** : 2026-10-02 (après analyse complète des retours)
