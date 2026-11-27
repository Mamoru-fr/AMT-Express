# Annexe #2 — Modèle de données : ERD (version A4, 2 pages)

> **Source de vérité** : `lib/db/schema.ts` @ `main` (SHA `bce57b7`, vérifié le 30/10/2026). Aucun champ inventé. Page 1 : carte relationnelle (synthèse sans attributs) puis comptes, rôles et authentification. Page 2 : cœur métier. La vue « facturation, notifications, audit », le détail des index et la vue exhaustive (écran / A4 paysage) restent dans le dépôt ; note : `invoices`/`invoice_items` sont au schéma sans FK d'écriture (module facturation non livré).

## Page 1 — Carte relationnelle + comptes, rôles, authentification

## Vue 0 — Carte relationnelle (synthèse, sans attributs — A4 portrait)

```mermaid
classDiagram
    class users { +id PK }
    class drivers { +id PK, +user_id FK }
    class ride_customers { +ride_id FK, +customer_id FK }
    class ride_managers { +ride_id FK, +manager_id FK, +created_at }
    class notifications { +id PK }
    class notification_preferences { +id PK }
    class activity_logs { +id PK }
    class session { +id PK }
    class account { +id PK }
    class productions { +id PK }
    class projects { +id PK, +production_id FK }
    class rides { +id PK, +project_id FK, +driver_id FK }
    class shift_planning { +id PK, +driver_id FK }
    class assignment_requests { +id PK, +ride_id FK, +driver_id FK }
    class ride_options { +id PK }
    class ride_selected_options { +ride_id FK, +option_id FK }
    class invoices { +id PK }
    class invoice_items { +id PK, +invoice_id FK, +ride_id FK, +shift_id FK }
    
    users "1" --> "0..1" drivers
    users "1" --> "0..n" ride_customers
    users "1" --> "0..n" ride_managers
    users "1" --> "0..n" notifications
    users "1" --> "0..n" notification_preferences
    users "1" --> "0..n" activity_logs
    users "1" --> "0..n" session
    users "1" --> "0..n" account
    productions "1" --> "0..n" projects
    drivers "1" --> "0..n" rides
    drivers "1" --> "0..n" shift_planning
    drivers "1" --> "0..n" assignment_requests
    projects "1" --> "0..n" rides
    projects "1" --> "0..n" shift_planning
    rides "1" --> "1..n" ride_customers
    rides "1" --> "0..n" ride_selected_options
    rides "1" --> "0..n" ride_managers
    rides "1" --> "0..n" assignment_requests
    ride_options "1" --> "0..n" ride_selected_options
    shift_planning "1" --> "0..n" assignment_requests
    invoices "1" --> "0..n" invoice_items
    rides "1" --> "0..n" invoice_items
    shift_planning "1" --> "0..n" invoice_items
```

*La notation est « zéro attrait » : uniquement les tables et leurs liens — lisible à 100 % sur papier, elle raconte le modèle en un regard.*

## Vue 1 — Comptes, rôles et authentification (A4 portrait)

Tables : `users`, `drivers`, `session`, `account`, `verification`.

```mermaid
classDiagram
    class users { +id PK, +name, +email UK, +role, +banned, +ban_reason, +ban_expires, +latitude, +longitude, +last_location_update }
    class drivers { +id PK, +user_id FK NOT NULL, +vehicle_type, +vehicle_plate NOT NULL, +vehicle_model, +vehicle_color, +available NOT NULL, +accounting_code }
    class session { +id PK, +token UK, +expires_at, +ip_address, +user_agent, +user_id FK, +impersonated_by }
    class account { +id PK, +account_id, +provider_id, +user_id FK, +access_token, +refresh_token, +password }
    class verification { +id PK, +identifier, +value, +expires_at }
    
    users "1" --> "0..1" drivers
    users "1" --> "0..n" session
    users "1" --> "0..n" account
```

## Page 2 — Cœur métier : courses, shifts, assignations

## Vue 2 — Cœur métier : courses, shifts, assignations (A4 portrait)

Tables : `productions`, `projects`, `rides`, `shift_planning`, `ride_options`, `ride_selected_options`, `ride_customers`, `ride_managers`, `assignment_requests`.

```mermaid
classDiagram
    class productions { +id PK }
    class projects { +id PK, +production_id FK }
    class rides { +id PK, +project_id FK, +driver_id FK, +departure, +destination, +departure_time, +status, +price, +driver_price, +waiting_time }
    class shift_planning { +id PK, +driver_id FK, +start_time, +end_time, +status, +project_id FK }
    class ride_options { +id PK }
    class ride_selected_options { +id PK, +ride_id FK, +option_id FK, +price }
    class ride_customers { +id PK, +ride_id FK, +customer_id FK, +rating, +comment }
    class ride_managers { +ride_id FK, +manager_id FK, +created_at }
    class assignment_requests { +id PK, +ride_id FK, +shift_id FK, +driver_id FK, +status, +requested_at }
    
    productions "1" --> "0..n" projects
    drivers "1" --> "0..n" rides
    drivers "1" --> "0..n" shift_planning
    drivers "1" --> "0..n" assignment_requests
    projects "1" --> "0..n" rides
    projects "1" --> "0..n" shift_planning
    rides "1" --> "1..n" ride_customers
    rides "1" --> "0..n" ride_selected_options
    rides "1" --> "0..n" ride_managers
    rides "1" --> "0..n" assignment_requests
    ride_options "1" --> "0..n" ride_selected_options
    shift_planning "1" --> "0..n" assignment_requests
```

*Types énumérés (5) : `user_role`, `ride_status`, `request_status`, `shift_status`, `invoice_status` — contraintes PostgreSQL `pgEnum`, voir § 5.2 du dossier.*
