# Annexe #2 — Modèle de données : ERD exhaustif (adapté impression)

> **Source de vérité** : `lib/db/schema.ts` @ `main` (SHA `bce57b7`, vérifié le 30/10/2026). Aucun champ inventé.
> **Guide d'impression** : la **carte relationnelle** et les **trois vues de module** ci-dessous tiennent en A4 portrait — ce sont elles qui vont dans le dossier imprimé. La vue exhaustive complète (toutes colonnes, 19 tables) reste en fin de document : elle est **faite pour l'écran** (source de vérité, zoom) et peut être imprimée en A4 paysage ou simplement référencée.

## Vue 0 — Carte relationnelle (synthèse, sans attributs — A4 portrait)

```mermaid
erDiagram
    users ||--o| drivers : ""
    users ||--o{ ride_customers : "transporte"
    users ||--o{ ride_managers : "concerne"
    users ||--o{ notifications : "recoit"
    users ||--o{ notification_preferences : "parametre"
    users ||--o{ activity_logs : "produit"
    users ||--o{ session : ""
    users ||--o{ account : ""
    productions ||--o{ projects : "contient"
    drivers ||--o{ rides : "est assignee a"
    drivers ||--o{ shift_planning : "planifie"
    drivers ||--o{ assignment_requests : "emet"
    projects ||--o{ rides : "concerne"
    projects ||--o{ shift_planning : "concerne"
    rides ||--o{ ride_customers : "transporte"
    rides ||--o{ ride_selected_options : "embarque"
    rides ||--o{ ride_managers : ""
    rides ||--o{ assignment_requests : "recoit"
    ride_options ||--o{ ride_selected_options : "choisie dans"
    shift_planning ||--o{ assignment_requests : "liee a"
    invoices ||--o{ invoice_items : "contient"
    rides ||--o{ invoice_items : "ligne"
    shift_planning ||--o{ invoice_items : "ligne"
```

*La notation est « zéro attrait » : uniquement les tables et leurs liens — lisible à 100 % sur papier, elle raconte le modèle en un regard.*

## Vue 1 — Comptes, rôles et authentification (A4 portrait)

Tables : `users`, `drivers`, `session`, `account`, `verification`.

```mermaid
erDiagram
    users ||--o| drivers : "est aussi (0,1)"
    users ||--o{ session : "ouvre"
    users ||--o{ account : "possede"
    users {
        text id PK
        text name
        text email UK
        user_role role
        boolean banned
        text ban_reason
        timestamp ban_expires
        decimal latitude
        decimal longitude
        timestamp last_location_update
    }
    drivers {
        text id PK
        text user_id FK "NOT NULL"
        text vehicle_type
        text vehicle_plate "NOT NULL"
        text vehicle_model
        text vehicle_color
        boolean available "NOT NULL"
        text accounting_code
    }
    session {
        text id PK
        text token UK
        timestamp expires_at
        text ip_address
        text user_agent
        text user_id FK
        text impersonated_by
    }
    account {
        text id PK
        text account_id
        text provider_id
        text user_id FK
        text access_token
        text refresh_token
        text password "hache - Better Auth"
    }
    verification {
        text id PK
        text identifier
        text value
        timestamp expires_at
    }
```

## Vue 2 — Cœur métier : courses, shifts, assignations (A4 portrait)

Tables : `productions`, `projects`, `rides`, `shift_planning`, `ride_options`, `ride_selected_options`, `ride_customers`, `ride_managers`, `assignment_requests`.

```mermaid
erDiagram
    productions ||--o{ projects : "contient"
    drivers ||--o{ rides : "assignee a"
    drivers ||--o{ shift_planning : "planifie"
    drivers ||--o{ assignment_requests : "emet"
    projects ||--o{ rides : "concerne"
    projects ||--o{ shift_planning : "concerne"
    rides ||--o{ ride_customers : "transporte (porte la note)"
    rides ||--o{ ride_selected_options : "embarque"
    rides ||--o{ ride_managers : ""
    rides ||--o{ assignment_requests : "recoit"
    ride_options ||--o{ ride_selected_options : "choisie dans"
    shift_planning ||--o{ assignment_requests : "liee a"
    rides {
        text id PK
        varchar departure "NOT NULL"
        varchar destination "NOT NULL"
        timestamp departure_time "NOT NULL"
        ride_status status "NOT NULL"
        decimal price
        decimal driver_price
        text driver_id FK
        text project_id FK
        integer waiting_time
    }
    ride_customers {
        text id PK
        text ride_id FK "CASCADE"
        text customer_id FK "CASCADE"
        integer rating "1-5 : la notation vit ICI"
        text comment
    }
    ride_selected_options {
        text id PK
        text ride_id FK "CASCADE"
        text option_id FK
        decimal price "fige a la selection"
    }
    assignment_requests {
        text id PK
        text ride_id FK "CASCADE"
        text shift_id FK
        text driver_id FK "NOT NULL"
        request_status status
        timestamp requested_at
    }
    shift_planning {
        text id PK
        text driver_id FK "NOT NULL"
        timestamp start_time
        timestamp end_time
        shift_status status
        text project_id FK
    }
```

## Vue 3 — Facturation, notifications, audit (A4 portrait)

Tables : `invoices`, `invoice_items`, `notifications`, `notification_preferences`, `activity_logs`.

```mermaid
erDiagram
    invoices ||--o{ invoice_items : "contient"
    users ||--o{ notifications : "recoit"
    users ||--o{ notification_preferences : "parametre"
    users ||--o{ activity_logs : "produit"
    rides ||--o{ invoice_items : "ligne"
    shift_planning ||--o{ invoice_items : "ligne"
    invoices {
        text id PK
        decimal sub_total "NOT NULL"
        decimal tax
        decimal total "NOT NULL"
        invoice_status status
        timestamp due_date "NOT NULL"
        text pdf_url
        boolean sent_via_app
        integer reminders_sent
    }
    invoice_items {
        text id PK
        text invoice_id FK "CASCADE"
        text ride_id FK
        text shift_id FK
        text description
        integer quantity
        decimal unit_price
        decimal total_price "NOT NULL"
    }
    notifications {
        text id PK
        text user_id FK "NOT NULL"
        text message "NOT NULL"
        boolean is_read
    }
    notification_preferences {
        text id PK
        text user_id FK "NOT NULL"
        boolean email
        boolean push
    }
    activity_logs {
        text id PK
        text user_id FK "NOT NULL"
        varchar action "NOT NULL"
        text details
        timestamp created_at
    }
```

*Note de cohérence (déjà dite § 3.4 du dossier) : `invoices`/`invoice_items` sont présentes au schéma mais **sans FK vers le reste** et sans code d'écriture — module non livré, table prêtée au futur. Les liens `invoice_items → rides/shift_planning` existent dans le schéma ; le reste du module n'existe pas encore dans l'application.*

## Enumérations (5)

| Enum | Valeurs |
| --- | --- |
| `user_role` | `admin` · `driver` · `customer` |
| `ride_status` | `pending` · `assigned` · `completed` · `cancelled` |
| `shift_status` | `planned` · `active` · `completed` · `cancelled` |
| `request_status` | `pending` · `approved` · `rejected` |
| `invoice_status` | `unpaid` · `paid` · `cancelled` |

## Index (tous mono-colonne — § 4.2 MPD)

| Table | Index |
| --- | --- |
| users | `email` · `role` |
| drivers | `userId` |
| productions | `name` |
| projects | `productionId` · `isGeneric` |
| rides | `driverId` · `projectId` · `status` |
| shift_planning | `driverId` · `projectId` |
| ride_options | `name` |
| ride_selected_options | `rideId` · `optionId` |
| ride_customers | `rideId` · `customerId` |
| ride_managers | `rideId` · `managerId` |
| assignment_requests | `rideId` · `driverId` |
| invoices | `status` |
| invoice_items | `invoiceId` · `rideId` · `shiftId` |
| notifications | `userId` · `isRead` |
| notification_preferences | `userId` |
| activity_logs | `userId` · `createdAt` |

## Améliorations planifiées (§ 4.2 — reprises)

Contrainte `CHECK` sur `ride_customers.rating` (1–5) · `UNIQUE` composites (`ride_id, customer_id`) et (`ride_id, option_id`) · index composite (`driver_id, status`) sur `rides` · nuance : plusieurs colonnes `NOT NULL` portent `ON DELETE SET NULL` — le `SET NULL` échouera à l'exécution si la ligne référencée est supprimée (dette connue, non bloquante).

## Vue exhaustive complète (pour l'écran / A4 paysage)

> 19 tables, toutes les colonnes. **À ne pas imprimer en A4 portrait** — c'est la source de vérité consultable dans le repo, et la pièce à sortir en soutenance sur écran si le jury creuse.

```mermaid
erDiagram
    users ||--o| drivers : "est aussi (0,1)"
    users ||--o{ ride_customers : "transporte"
    users ||--o{ ride_managers : "supervise"
    users ||--o{ notifications : "recoit"
    users ||--o{ notification_preferences : "parametre"
    users ||--o{ activity_logs : "produit"
    users ||--o{ session : "ouvre"
    users ||--o{ account : "possede"
    productions ||--o{ projects : "contient"
    drivers ||--o{ rides : "est assignee a"
    drivers ||--o{ shift_planning : "planifie"
    drivers ||--o{ assignment_requests : "emet"
    drivers ||--o{ invoice_items : "concerne"
    projects ||--o{ rides : "concerne"
    projects ||--o{ shift_planning : "concerne"
    rides ||--o{ ride_customers : "transporte"
    rides ||--o{ ride_selected_options : "embarque"
    rides ||--o{ ride_managers : "concerne"
    rides ||--o{ assignment_requests : "recoit"
    rides ||--o{ invoice_items : "ligne"
    ride_options ||--o{ ride_selected_options : "choisie dans"
    shift_planning ||--o{ assignment_requests : "liee a"
    shift_planning ||--o{ invoice_items : "ligne"
    invoices ||--o{ invoice_items : "contient"

    users { text id PK "uuid" text name text email UK boolean email_verified text image timestamp created_at timestamp updated_at user_role role boolean banned text ban_reason timestamp ban_expires decimal latitude decimal longitude timestamp last_location_update }
    drivers { text id PK text user_id FK "NOT NULL" text accounting_code text vehicle_type text vehicle_plate "NOT NULL" text vehicle_model text vehicle_color boolean available "NOT NULL" }
    productions { text id PK text name text address text contact_name text contact_email "NOT NULL" text contact_phone }
    projects { text id PK text production_id FK boolean is_generic "NOT NULL" timestamp start_date "NOT NULL" timestamp end_date "NOT NULL" }
    rides { text id PK varchar departure "NOT NULL" varchar destination "NOT NULL" timestamp departure_time "NOT NULL" timestamp arrival_time decimal distance_km decimal price decimal driver_price ride_status status "NOT NULL" text photo_url text driver_id FK text customer_notes text project_id FK integer waiting_time text driver_notes }
    shift_planning { text id PK text driver_id FK "NOT NULL" timestamp start_time "NOT NULL" timestamp end_time "NOT NULL" shift_status status text project_id FK }
    ride_options { text id PK text name "NOT NULL" text description decimal additional_price "NOT NULL" }
    ride_selected_options { text id PK text ride_id FK "NOT NULL" text option_id FK "NOT NULL" decimal price "NOT NULL" }
    ride_customers { text id PK text ride_id FK "NOT NULL" text customer_id FK "NOT NULL" integer rating text comment }
    ride_managers { text id PK text ride_id FK "NOT NULL" text manager_id FK "NOT NULL" }
    assignment_requests { text id PK text ride_id FK "NOT NULL" text shift_id FK text driver_id FK "NOT NULL" request_status status "NOT NULL" timestamp requested_at }
    invoices { text id PK decimal waiting_fee decimal sub_total "NOT NULL" decimal tax decimal total "NOT NULL" invoice_status status timestamp invoice_date timestamp due_date "NOT NULL" text pdf_url boolean sent_via_app integer reminders_sent text last_reminder_message }
    invoice_items { text id PK text invoice_id FK "NOT NULL" text ride_id FK text shift_id FK text description integer quantity decimal unit_price "NOT NULL" decimal tax_rate decimal tax_amount decimal total_price "NOT NULL" }
    notifications { text id PK text user_id FK "NOT NULL" text message "NOT NULL" boolean is_read }
    notification_preferences { text id PK text user_id FK "NOT NULL" boolean email boolean push }
    activity_logs { text id PK text user_id FK "NOT NULL" varchar action "NOT NULL" text details timestamp created_at }
    session { text id PK text token UK timestamp expires_at "NOT NULL" text ip_address text user_agent text user_id FK text impersonated_by }
    account { text id PK text account_id "NOT NULL" text provider_id "NOT NULL" text user_id FK text access_token text refresh_token text id_token text scope text password }
    verification { text id PK text identifier "NOT NULL" text value "NOT NULL" timestamp expires_at "NOT NULL" }
```
