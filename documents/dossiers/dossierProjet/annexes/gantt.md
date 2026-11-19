# Annexe #4 — Diagramme de Gantt

> **Source** : Planning réel du développement (juillet - novembre 2026)
> **Format** : Diagramme de Gantt en Mermaid pour visualisation Markdown. Pour impression, exporter via [Mermaid Live Editor](https://mermaid.live) en PNG 300dpi.

## Diagramme de Gantt complet

```mermaid
gantt
    title Planning de développement AMT Express (MVP)
    dateFormat  YYYY-MM-DD
    section Analyse & Conception
    Analyse des besoins           :a1, 2026-07-01, 7d
    Modélisation UML              :a2, 2026-07-08, 5d
    Conception DB (MCD/MLD/MPD)   :a3, 2026-07-13, 7d
    Maquettage                    :a4, 2026-07-20, 5d
    
    section Développement Backend
    Setup projet (Next.js, pnpm)   :b1, 2026-07-25, 3d
    Authentification (Better Auth) :b2, 2026-07-28, 10d
    Middleware de rôles           :b3, 2026-08-07, 5d
    Schéma DB (Drizzle)           :b4, 2026-08-12, 5d
    Services CRUD courses         :b5, 2026-08-17, 7d
    Server Actions                :b6, 2026-08-24, 7d
    Controllers                   :b7, 2026-08-31, 5d
    Validation Zod                :b8, 2026-09-05, 5d
    
    section Développement Frontend
    Parallel routes setup         :c1, 2026-08-07, 3d
    Composants partagés           :c2, 2026-08-10, 7d
    Dashboard admin               :c3, 2026-08-17, 10d
    Interface chauffeur            :c4, 2026-08-27, 7d
    Interface client              :c5, 2026-09-03, 7d
    Tableaux KPI (Recharts)        :c6, 2026-09-10, 5d
    Formulaires (React Hook Form) :c7, 2026-09-15, 5d
    
    section Fonctionnalités métier
    Import CSV                    :d1, 2026-09-05, 7d
    Demande d'assignation          :d2, 2026-09-12, 7d
    Validation admin              :d3, 2026-09-19, 5d
    Système de notation           :d4, 2026-09-24, 5d
    Journal d'audit               :d5, 2026-09-29, 3d
    
    section DevOps & Qualité
    Docker multi-étapes          :e1, 2026-08-20, 3d
    CI/CD GitHub Actions          :e2, 2026-09-11, 7d
    Tests unitaires (Vitest)      :e3, 2026-09-18, 7d
    Tests d'intégration           :e4, 2026-09-25, 5d
    Corrections déploiement       :e5, 2026-09-11, 10d
    
    section Finalisation
    Optimisation N+1              :f1, 2026-10-02, 3d
    Sécurité (OWASP)              :f2, 2026-10-02, 5d
    Accessibilité (RGAA)          :f3, 2026-10-16, 3d
    Documentation                :f4, 2026-08-20, 14d
    Consolidation                 :f5, 2026-10-19, 14d
    
    section Milestones
    Auth + Rôles livré           :milestone1, 2026-08-07, 1d
    Backend complet              :milestone2, 2026-09-05, 1d
    Frontend admin               :milestone3, 2026-09-03, 1d
    Frontend chauffeur/client     :milestone4, 2026-09-10, 1d
    CI/CD opérationnelle         :milestone5, 2026-09-22, 1d
    MVP déployé en UAT            :milestone6, 2026-09-25, 1d
    MVP en production            :milestone7, 2026-10-01, 1d
    Documentation finale         :milestone8, 2026-10-30, 1d
```

## Légende

| Symbole | Signification |
|---------|---------------|
| **:task:** | Tâche avec durée |
| **milestone** | Jalon important |
| **section** | Phase de développement |

## Chiffres clés du planning

| Phase | Durée | Tâches | Jalons |
|-------|-------|--------|--------|
| Analyse & Conception | 24 jours | 4 | 0 |
| Développement Backend | 47 jours | 8 | 1 |
| Développement Frontend | 42 jours | 7 | 2 |
| Fonctionnalités métier | 27 jours | 5 | 0 |
| DevOps & Qualité | 32 jours | 5 | 2 |
| Finalisation | 34 jours | 5 | 1 |
| **Total** | **206 jours** | **34** | **6** |

## Analyse du planning

**Développement en mode Agile** : Le projet a été mené selon une méthodologie itérative, avec des cycles de 2-3 semaines. Les phases se sont partiellement chevauchées pour optimiser le temps (ex: développement frontend a commencé alors que le backend était à 70% complet).

**Points bloquants identifiés** :
- **Semaine du 11/09** : 17 corrections de déploiement consécutives (CI/CD Vercel)
- **Semaine du 02/10** : Audit de sécurité et optimisation des performances
- **Semaine du 16/10** : Corrections d'accessibilité (RGAA)

**Temps de développement réel** : 5 mois (juillet - novembre 2026), avec une moyenne de 15-20 heures/semaine en temps partiel.

## Conseils pour l'impression

1. Exporter le diagramme via [Mermaid Live Editor](https://mermaid.live) en PNG 300dpi
2. Choisir un format paysage pour une meilleure lisibilité
3. Imprimer sur une page A3 ou deux pages A4 si nécessaire
4. Garder la légende et l'analyse à côté du diagramme pour contexte
