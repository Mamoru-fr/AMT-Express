# Annexe #1 — UML : cas d'utilisation, activité, classes (version A4, 2 pages)

> Rendu de référence pour le § 5.1 du dossier. Diagrammes Mermaid, exportables en PNG 300 dpi via [Mermaid Live Editor](https://mermaid.live). Les sources PlantUML (pour un rendu canonique : acteurs en bonhommes, cas d'utilisation en ellipses, classes en rectangles compartimentés) restent dans l'historique du dépôt — à rendre en image avant l'impression finale.

## Page 1 — Cas d'utilisation et parcours d'activité

**Cas d'utilisation** — acteurs Admin / Chauffeur / Client :

```mermaid
flowchart LR
    subgraph Actors
        Admin([Administrateur])
        Driver([Chauffeur])
        Customer([Client])
    end

    subgraph AMT["AMT Express (MVP)"]
        UC1[Créer / éditer une course]
        UC2[Affecter une course ou valider une demande]
        UC3[Consulter les KPI]
        UC4[Importer des données CSV]
        UC5[Exporter en CSV]
        UC6[Bannir / activer un chauffeur]
        UC7[Voir les courses disponibles]
        UC8[Demander une assignation]
        UC9[Gérer ses shifts]
        UC10[Réserver une course]
        UC11[Consulter son historique]
        UC12[Noter une course]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Driver --> UC7
    Driver --> UC8
    Driver --> UC9
    Customer --> UC10
    Customer --> UC11
    Customer --> UC12

    %% Relations entre cas d'utilisation
    UC2 -.->|include| UC8
    UC8 -.->|extend| UC1

    %% Style
    style AMT fill:#FFFDF8,stroke:#F4A259
```

**Diagramme d'activité** — parcours « demande d'assignation d'une course » :

```mermaid
flowchart TD
    S([Chauffeur : course en attente repérée]) --> C[Clic « demander »]
    C --> P{Demande autorisée ?<br/>plafond de 5 demandes simultanées,<br/>course non assignée,<br/>pas de demande déjà en cours}
    P -- non --> E[Message d'erreur explicite — fin]
    P -- oui --> I[Demande enregistrée,<br/>administrateur notifié]
    I --> D{Administrateur décide}
    D -- refus --> R[Demande rejetée — fin]
    D -- validation --> A[Course assignée au chauffeur<br/>demandes concurrentes rejetées]
    A --> F([Fin : course visible dans l'espace chauffeur])
```

*Version volontairement resserrée pour tenir sur une page A4 ; le déroulé technique complet (contrôle du rôle, transaction d'assignation, rejet des demandes concurrentes) est décrit en § 7.3 du dossier.*


## Page 2 — Diagramme de classes (modèle conceptuel des données)

```mermaid
classDiagram
    class User {
        +id uuid, +role user_role, +email, +banned
        +getRole() user_role
        +isBanned() bool
    }
    class Driver {
        +id uuid, +user_id FK, +available bool, +vehicle_plate
        +isAvailable() bool
    }
    class Production { +id uuid, +name }
    class Project { +id uuid, +production_id FK }
    class Ride {
        +id uuid, +project_id FK, +driver_id FK?, +status ride_status, +price
        +isAssignable() bool
        +assignTo(driverId) void
    }
    class RideCustomer { +ride_id FK, +customer_id FK, +rating 1..5, +comment }
    class RideManager { +ride_id FK, +manager_id FK, +created_at }
    class RideOption { +id uuid, +additional_price }
    class RideSelectedOption { +ride_id FK, +option_id FK, +price }
    class AssignmentRequest {
        +ride_id FK, +shift_id FK?, +driver_id FK, +status request_status
        +approve() void
        +reject() void
    }
    class ShiftPlanning { +driver_id FK, +status shift_status }
    
    User "1" --> "0..1" Driver
    Production "1" *-- "0..n" Project
    Project "1" --> "0..n" Ride
    Driver "0..1" --> "0..n" Ride
    Ride "1" --> "1..n" RideCustomer
    Ride "1" --> "0..n" RideManager : est créée par
    User "1" --> "0..n" RideManager : est responsable de
    Ride "1" --> "0..n" RideSelectedOption
    RideSelectedOption "0..n" --> "1" RideOption
    Ride "1" --> "0..n" AssignmentRequest
    AssignmentRequest "0..n" --> "1" Driver
    ShiftPlanning "1" --> "0..n" AssignmentRequest
    Driver "1" --> "0..n" ShiftPlanning
    User "1" --> "0..n" RideCustomer : est client
    
    %% Style
    style User fill:#FFFDF8,stroke:#F4A259
    style Driver fill:#FFFDF8,stroke:#F4A259
    style Production fill:#FFFDF8,stroke:#F4A259
    style Project fill:#FFFDF8,stroke:#F4A259
    style Ride fill:#FFFDF8,stroke:#F4A259
```
