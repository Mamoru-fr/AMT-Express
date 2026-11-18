# Annexe 15 — Modèle Conceptuel de Données complet (format A4)

> MCD complet cité en §4.2 du dossier, en notation Merise (cardinalités portées par les liens). À imprimer en A4 pour le jury. La version miniaturisée du dossier ne montre que le cœur métier.

```mermaid
flowchart LR
    PROD[PRODUCTION] -- "(0,n) contient (1,1)" --> PROJ[PROJECT]
    PROJ -- "(0,n) concerne (1,1)" --> RIDE
    USER -- "(0,1) est-aussi (1,1)" --> DRV[DRIVER]
    DRV -- "(0,n) est-assignée-à (0,1)" --> RIDE
    DRV -- "(0,n) émet (1,1)" --> AR[ASSIGNMENT_REQUEST]
    RIDE -- "(0,n) reçoit (1,1)" --> AR
    RIDE -- "(1,n) transporte (0,n)<br/>porteuse : ride_customers" --> USER
    RIDE -- "(0,n) embarque (0,n)<br/>porteuse : ride_selected_options" --> ROPT[RIDE_OPTION]
    DRV -- "(0,n) planifie (1,1)" --> SHP[SHIFT_PLANNING]
    USER -- "(0,n) reçoit (1,1)" --> NT[NOTIFICATION]
    RIDE -- "(0,n) concerne (1,1)" --> NT
    style PROD fill:#F4A259,color:#000
    style RIDE fill:#F4A259,color:#000
    style USER fill:#176B87,color:#fff
    style DRV fill:#176B87,color:#fff
```

Les tables techniques (authentification Better Auth : `session`, `account`, `verification` ; journal d'audit `activity_logs` ; facturation `invoices` / `invoice_items`) ne sont pas représentées, conformément au MCD. Le modèle logique (MLD) et le modèle physique (MPD) figurent en §4.2 du dossier ; le dictionnaire de données complet est en annexe #2 bis et l'ERD des 19 tables en annexe #2.
