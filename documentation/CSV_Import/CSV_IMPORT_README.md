# Import CSV — AMT Express

> Outil d'import en masse de courses depuis un fichier CSV. Un backup automatique de la base est effectué avant chaque import.

---

## Prérequis

- Base de données PostgreSQL configurée et migrations appliquées (`pnpm db:migrate`)
- Fichier `.env` avec une `DATABASE_URL` valide

---

## Utilisation

```bash
pnpm db:import-csv /chemin/vers/fichier.csv
```

**Exemple :**
```bash
pnpm db:import-csv ~/Downloads/AGENDA-2025-DECEMBRE.csv
```

Le script effectue d'abord un backup (`pnpm db:backup`), puis importe les données.

---

## Format du fichier CSV

Les colonnes doivent être dans cet ordre :

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `JOUR` | Date | `"Monday, December 1, 2025"` |
| `HEURE` | Heure de prise en charge | `"7.30"` |
| `FACTURATION` | Société de production | `"WARNER"` |
| `BT/BC` | Référence projet | `"THE EXPEDITION"` |
| `NOM` | Nom du ou des clients | `"ESTELLE MOSELY"` |
| `DEPART` | Lieu de départ | `"CDG"` |
| `ARRIVEE` | Lieu d'arrivée | `"P18+CHAMPIGNY"` |
| `ID CHAUFFEUR` | Identifiant chauffeur | `"CFR00132"` |
| `CHAUFFEUR` | Nom du chauffeur | `"TOUFIK ROMAINVILLE"` |
| `COURSE ENVOYE` | Type de véhicule dispatché | `"VAN / VIP / MISE A DISPO"` |
| `ATTENTE` | Notes (temps d'attente, options) | `"VAN / VIP"` |
| `TARIF CHAUFFEUR` | Prix chauffeur (avec options) | `"120.00 €"` |
| `TARIF AGENDA` | Prix planifié | `"€ 120.00"` |
| `TARIF CLIENT` | Prix final facturé | `"€ 139.20"` |
| `FACT CHAUFFEUR` | Chauffeur facture lui-même | `"FACT"` |
| `FORFAIT` | Prix forfaitaire | `` |
| `ATTENTION MENTION` | Notes additionnelles | `"FACT AVOIR"` |

---

## Ce que fait le script

1. **Lecture et parsing** du CSV (gestion des champs entre guillemets)
2. **Création automatique** des chauffeurs absents de la base
3. **Création automatique** des productions absentes de la base
4. **Import des courses** avec :
   - Départ, arrivée, date et heure
   - Affectation chauffeur
   - Lien production/projet
   - Prix final (priorité : prix client → prix planifié → prix chauffeur)
   - Notes chauffeur (attente, options, forfait, mentions)

### Logique de prix

```
prix retenu = prix client → sinon prix planifié → sinon prix chauffeur
```

### Courses ignorées automatiquement

- Courses annulées (`ANNULE` dans les champs)
- Lignes sans champs obligatoires (départ, arrivée, date)
- Lignes avec date invalide
- Lignes sans prix valide

---

## Sortie du script

```
📂 CSV Ride Import Script

📄 Reading file: ~/Downloads/AGENDA-2025-DECEMBRE.csv

📋 Parsing CSV file...
✅ Found 150 ride(s) to import

[1/150] Processing ride: ESTELLE MOSELY
  ➕ Created driver: TOUFIK ROMAINVILLE (CFR00132)
  ➕ Created production: WARNER
  ✅ Imported: CDG → P18+CHAMPIGNY (€139.20)

...

==================================================
📊 Import Summary:
   ✅ Successfully imported: 120
   ⏭️  Skipped: 25
   ❌ Errors: 5
   📝 Total processed: 150
==================================================
```

---

## Impact sur la base de données

| Table | Action |
|-------|--------|
| `users` | Création des nouveaux chauffeurs (`role='driver'`) |
| `productions` | Création des nouvelles sociétés de production |
| `rides` | Création des courses avec `status='completed'` |

**Génération automatique des emails :**
- Chauffeur : `{driverId}@amt-express.com`
- Production : `{production-slug}@production.com`

Les doublons (même `driverId` ou même nom de production) sont détectés et ignorés.

---

## Depannage

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Please provide a CSV file path` | Chemin manquant | Passer le chemin en argument |
| `No valid rides found in CSV` | Structure CSV incorrecte | Vérifier l'ordre des colonnes |
| Erreur de connexion DB | `DATABASE_URL` incorrecte | Vérifier `.env` |
| Courses ignorées | Voir la sortie console | Vérifier les champs `ANNULE`, dates et prix |

Pour diagnostiquer les lignes ignorées, lire la sortie console — chaque ligne skippée indique la raison.
