# Annexe #2 — Modèle de données : ERD exhaustif (adapté impression)

> **Source de vérité** : `lib/db/schema.ts` @ `main` (SHA `bce57b7`, vérifié le 30/10/2026). Aucun champ inventé.
> **Guide d'impression** : la **carte relationnelle** et les **trois vues de module** ci-dessous tiennent en A4 portrait — ce sont elles qui vont dans le dossier imprimé. La vue exhaustive complète (toutes colonnes, 19 tables) reste en fin de document : elle est **faite pour l'écran** (source de vérité, zoom) et peut être imprimée en A4 paysage ou simplement référencée.

## Vue 0 — Carte relationnelle (synthèse, sans attributs — A4 portrait)

```mermaid
classDiagram
    class users { +id PK }
    class drivers { +id PK, +user_id FK }
    class ride_customers { +ride_id FK, +customer_id FK }
    class ride_managers { +ride_id FK, +user_id FK }
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
    class ride_managers { +ride_id FK, +user_id FK }
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

## Vue 3 — Facturation, notifications, audit (A4 portrait)

Tables : `invoices`, `invoice_items`, `notifications`, `notification_preferences`, `activity_logs`.

```mermaid
classDiagram
    class invoices { +id PK, +sub_total, +tax, +total, +status, +due_date, +pdf_url, +sent_via_app, +reminders_sent }
    class invoice_items { +id PK, +invoice_id FK, +ride_id FK, +shift_id FK, +description, +quantity, +unit_price, +total_price }
    class notifications { +id PK, +user_id FK, +message, +is_read }
    class notification_preferences { +id PK, +user_id FK, +email, +push }
    class activity_logs { +id PK, +user_id FK, +action, +details, +created_at }
    
    invoices "1" --> "0..n" invoice_items
    users "1" --> "0..n" notifications
    users "1" --> "0..n" notification_preferences
    users "1" --> "0..n" activity_logs
    rides "1" --> "0..n" invoice_items
    shift_planning "1" --> "0..n" invoice_items
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

> **⚠️ Note** : Ce diagramme utilise la syntaxe `classDiagram` pour une compatibilité maximale. Pour visualiser : utilisez [Mermaid Live Editor](https://mermaid.live/edit) ou l'extension VS Code "Mermaid".

```mermaid
classDiagram
    class users { +id PK uuid, +name, +email UK, +email_verified, +image, +created_at, +updated_at, +role, +banned, +ban_reason, +ban_expires, +latitude, +longitude, +last_location_update }
    class drivers { +id PK, +user_id FK NOT NULL, +accounting_code, +vehicle_type, +vehicle_plate NOT NULL, +vehicle_model, +vehicle_color, +available NOT NULL }
    class productions { +id PK, +name, +address, +contact_name, +contact_email NOT NULL, +contact_phone }
    class projects { +id PK, +production_id FK, +is_generic NOT NULL, +start_date NOT NULL, +end_date NOT NULL }
    class rides { +id PK, +departure NOT NULL, +destination NOT NULL, +departure_time NOT NULL, +arrival_time, +distance_km, +price, +driver_price, +status NOT NULL, +photo_url, +driver_id FK, +customer_notes, +project_id FK, +waiting_time, +driver_notes }
    class shift_planning { +id PK, +driver_id FK NOT NULL, +start_time NOT NULL, +end_time NOT NULL, +status, +project_id FK }
    class ride_options { +id PK, +name NOT NULL, +description, +additional_price NOT NULL }
    class ride_selected_options { +id PK, +ride_id FK NOT NULL, +option_id FK NOT NULL, +price NOT NULL }
    class ride_customers { +id PK, +ride_id FK NOT NULL, +customer_id FK NOT NULL, +rating, +comment }
    class ride_managers { +id PK, +ride_id FK NOT NULL, +manager_id FK NOT NULL }
    class assignment_requests { +id PK, +ride_id FK NOT NULL, +shift_id FK, +driver_id FK NOT NULL, +status NOT NULL, +requested_at }
    class invoices { +id PK, +waiting_fee, +sub_total NOT NULL, +tax, +total NOT NULL, +status, +invoice_date, +due_date NOT NULL, +pdf_url, +sent_via_app, +reminders_sent, +last_reminder_message }
    class invoice_items { +id PK, +invoice_id FK NOT NULL, +ride_id FK, +shift_id FK, +description, +quantity, +unit_price NOT NULL, +tax_rate, +tax_amount, +total_price NOT NULL }
    class notifications { +id PK, +user_id FK NOT NULL, +message NOT NULL, +is_read }
    class notification_preferences { +id PK, +user_id FK NOT NULL, +email, +push }
    class activity_logs { +id PK, +user_id FK NOT NULL, +action NOT NULL, +details, +created_at }
    class session { +id PK, +token UK, +expires_at NOT NULL, +ip_address, +user_agent, +user_id FK, +impersonated_by }
    class account { +id PK, +account_id NOT NULL, +provider_id NOT NULL, +user_id FK, +access_token, +refresh_token, +id_token, +scope, +password }
    class verification { +id PK, +identifier NOT NULL, +value NOT NULL, +expires_at NOT NULL }
    
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
    drivers "1" --> "0..n" invoice_items
    projects "1" --> "0..n" rides
    projects "1" --> "0..n" shift_planning
    rides "1" --> "1..n" ride_customers
    rides "1" --> "0..n" ride_selected_options
    rides "1" --> "0..n" ride_managers
    rides "1" --> "0..n" assignment_requests
    ride_options "1" --> "0..n" ride_selected_options
    shift_planning "1" --> "0..n" assignment_requests
    shift_planning "1" --> "0..n" invoice_items
    invoices "1" --> "0..n" invoice_items
    rides "1" --> "0..n" invoice_items
```
