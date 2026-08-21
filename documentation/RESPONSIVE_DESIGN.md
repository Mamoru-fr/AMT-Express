# Design Responsive — AMT Express

> Ce document décrit les breakpoints, les patterns CSS et les règles de mise en page responsive appliqués dans l'application.

---

## Breakpoints

| Nom | Largeur | Usage |
|-----|---------|-------|
| Mobile portrait | < 640px | Défaut (approche mobile-first) |
| Mobile landscape / petite tablette | 640px – 767px | Ajustements compacts |
| Tablette | 768px – 1023px | Mise en page intermédiaire |
| Desktop | 1024px+ | Mise en page complète |

```css
/* Mobile-first — on surcharge vers le haut */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```

---

## Règles générales

### Espacement

L'espacement suit une progression cohérente selon la taille d'écran :

```css
.container {
  padding: 0.75rem; /* mobile */
}
@media (min-width: 640px) {
  .container { padding: 1rem; }
}
@media (min-width: 768px) {
  .container { padding: 1.5rem; }
}
```

### Typographie

Les titres et textes s'adaptent progressivement :

```css
.heading-xl {
  font-size: 1.5rem; /* mobile */
}
@media (min-width: 640px) {
  .heading-xl { font-size: 1.875rem; }
}
@media (min-width: 768px) {
  .heading-xl { font-size: 2.25rem; }
}
```

### Boutons

Sur mobile, les boutons d'action principaux occupent toute la largeur :

```css
.btn-action {
  width: 100%;
}
@media (min-width: 640px) {
  .btn-action { width: auto; }
}
```

---

## Patterns de mise en page

### Grille KPI (cartes de statistiques)

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 colonnes sur mobile */
  gap: 0.5rem;
}
@media (min-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 colonnes sur desktop */
    gap: 1rem;
  }
}
```

### Graphiques

```css
.charts-grid {
  display: grid;
  grid-template-columns: 1fr; /* empilés sur mobile et tablette */
  gap: 1rem;
}
@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### En-tête avec actions

Sur mobile, l'en-tête et les boutons d'action s'empilent verticalement :

```css
.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
```

### Tableaux de données

Les tableaux défilent horizontalement sur mobile plutôt que d'être compressés :

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  min-width: 640px; /* largeur minimale avant scroll horizontal */
}
```

---

## Hauteur viewport

Pour les mises en page pleine hauteur, utiliser `dvh` plutôt que `vh` pour corriger le comportement des navigateurs mobiles (barre d'adresse rétractable) :

```css
.full-height {
  min-height: 100dvh;
}
```

---

## Modales

Les modales s'adaptent à la taille de l'écran :

```css
.modal {
  width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
}
@media (min-width: 640px) {
  .modal {
    width: 90vw;
    max-height: 70vh;
  }
}
@media (min-width: 768px) {
  .modal {
    width: auto;
    min-width: 500px;
    max-width: 800px;
  }
}
```

---

## Composants concernés

| Composant | Adaptations principales |
|-----------|------------------------|
| `AdminDashboard` | Grille KPI 2→4 colonnes, padding progressif, boutons pleine largeur sur mobile |
| `DriverDashboard` | En-tête empilé → horizontal, toggle disponibilité redimensionné |
| `DashboardDataCard` | Dimensions fixes supprimées, texte et icônes progressifs |
| `RidesManagementBoard` | Barre de recherche compacte, filtres empilés, boutons adaptatifs |
| `RecentRidesTable` | Padding compact, texte réduit, badge plus petits sur mobile |
| `MonthlyRidesChart` / `MonthlyRevenueChart` / `StatusPieChart` | Padding et titres réduits sur mobile |
| `EditRideModal` | Max-height + overflow-y, padding réduit |
| Page `connections` | Modal adaptée mobile (95vw), padding réduit |

---

## Principes

- **Mobile-first** : les styles de base ciblent le mobile, les media queries surchargent vers le haut
- **Pas de largeurs fixes** sur les cartes et composants — utiliser `min-width` + `flex-1` ou grille
- **Texte tronqué** avec `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` combiné à `min-width: 0` sur les flex children pour éviter le débordement
- **Icônes** : taille réduite sur mobile, taille normale à partir de 640px
