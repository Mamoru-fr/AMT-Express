# Annexe #1 bis — UML canonique (sources PlantUML)

> Les diagrammes du dossier (§ 4.1) sont des **transcriptions Mermaid** — pratiques à maintenir, mais le jury attend un rendu UML canonique (acteurs en bonhommes, cas d'utilisation en ellipses, classes en rectangles compartimentés). Ce fichier donne les **sources PlantUML** à rendre en image pour l'annexe #1. Rendu : [plantuml.com](https://www.plantuml.com/plantuml) en ligne, ou l'extension VS Code *PlantUML* — exporter en **PNG** (300 dpi pour l'impression).

## Cas d'utilisation (acteurs Admin / Chauffeur / Client)

```plantuml
@startuml
left to right direction
skinparam actorStyle awesome

actor "Administrateur" as Admin
actor "Chauffeur" as Driver
actor "Client" as Customer

rectangle "AMT Express (MVP)" {
  usecase "Créer / éditer une course" as UC1
  usecase "Affecter une course\nou valider une demande" as UC2
  usecase "Consulter les KPI" as UC3
  usecase "Importer des données CSV" as UC4
  usecase "Exporter en CSV" as UC5
  usecase "Bannir / activer un chauffeur" as UC6
  usecase "Voir les courses disponibles" as UC7
  usecase "Demander une assignation" as UC8
  usecase "Gérer ses shifts" as UC9
  usecase "Réserver une course" as UC10
  usecase "Consulter son historique" as UC11
  usecase "Noter une course" as UC12
}

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
UC2 ..> UC8 : <<include>>
UC8 ..> UC1 : <<extend>>
@enduml
```

## Diagramme de classes (canonique, corrigé contre le schéma réel — 30/10)

```plantuml
@startuml
class User { +id : uuid
+role : user_role
+email
+banned }
class Driver { +id : uuid
+user_id : FK
+available : bool
+vehicle_plate }
class Production { +id : uuid
+name }
class Project { +id : uuid
+production_id : FK }
class Ride { +id : uuid
+project_id : FK
+driver_id : FK?
+status : ride_status
+price }
class RideCustomer { +ride_id : FK
+customer_id : FK
+rating : 1..5
+comment }
class RideOption { +id : uuid
+additional_price }
class RideSelectedOption { +ride_id : FK
+option_id : FK
+price (figé à la sélection) }
class AssignmentRequest { +ride_id : FK
+shift_id : FK?
+driver_id : FK
+status : request_status }
class ShiftPlanning { +driver_id : FK
+status : shift_status }

User "1" --> "0..1" Driver
Production "1" *-- "0..n" Project
Project "1" --> "0..n" Ride
Driver "0..1" --> "0..n" Ride : est assigné à
Ride "1" --> "1..n" RideCustomer : transporte (porte la note)
Ride "1" --> "0..n" RideSelectedOption : embarque
RideSelectedOption "0..n" --> "1" RideOption
Ride "1" --> "0..n" AssignmentRequest
AssignmentRequest "0..n" --> "1" Driver
ShiftPlanning "0..1" <-- "0..n" AssignmentRequest : lie un shift
Driver "1" --> "0..n" ShiftPlanning
User "0..n" <-- "1..n" RideCustomer
@enduml
```

*Corrections du 30/10 intégrées : la notation (1–5 + commentaire) vit dans `RideCustomer` (table associative `ride_customers`), pas dans `Ride` ; `AssignmentRequest.shift_id` (FK nullable vers `ShiftPlanning`) apparaît ; `RideSelectedOption` porte son prix figé. Cohérent avec l'ERD de l'annexe #2.*
