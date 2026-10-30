# Annexe #2 bis — Dictionnaire de données (MPD, tables cœur)

> Chaque ligne vérifiée dans \`lib/db/schema.ts\` @ \`main\` (SHA \`bce57b7\`, 30/10/2026). Le dictionnaire couvre les tables que le jury interroge en premier ; l'ERD (annexe #2) donne la vue d'ensemble.

## `rides` — la course

| Colonne | Type | Contraintes | Signification |
| --- | --- | --- | --- |
| `id` | text (uuid) | PK | Identifiant de la course |
| `departure` | varchar(255) | NOT NULL | Adresse de départ |
| `destination` | varchar(255) | NOT NULL | Adresse de destination |
| `departure_time` | timestamp | NOT NULL | Horaire de départ (rejetée si passée — Zod `refine`) |
| `arrival_time` | timestamp | | Horaire d'arrivée (renseigné à la complétion) |
| `distance_km` | numeric(10,2) | | Distance parcourue |
| `price` | numeric(10,2) | | Prix client (calculé) |
| `driver_price` | numeric(10,2) | | Prix relevé au compteur par le chauffeur |
| `status` | enum `ride_status` | NOT NULL, def `pending` | pending · assigned · completed · cancelled |
| `photo_url` | text | | Preuve photo (ticket, itinéraire) |
| `driver_id` | text | FK `drivers`, SET NULL | Chauffeur assigné |
| `customer_notes` | text | | Consignes du client |
| `project_id` | text | FK `projects`, SET NULL | Rattachement projet/production |
| `waiting_time` | integer | def 0 | Temps d'attente en minutes |
| `driver_notes` | text | | Retours du chauffeur |

## `ride_customers` — clients transportés (et la notation)

| Colonne | Type | Contraintes | Signification |
| --- | --- | --- | --- |
| `id` | text (uuid) | PK | Identifiant de la ligne |
| `ride_id` | text | NOT NULL, FK `rides`, CASCADE | Course concernée |
| `customer_id` | text | NOT NULL, FK `users`, CASCADE | Client transporté |
| `rating` | integer | | **Note 1–5 émise par le client pour cette course** (la notation vit ici, pas dans `rides`) |
| `comment` | text | | Commentaire de notation |

## `assignment_requests` — demandes d'assignation

| Colonne | Type | Contraintes | Signification |
| --- | --- | --- | --- |
| `id` | text (uuid) | PK | Identifiant de la demande |
| `ride_id` | text | NOT NULL, FK `rides`, CASCADE | Course visée |
| `shift_id` | text | FK `shift_planning`, SET NULL | Shift du chauffeur au moment de la demande |
| `driver_id` | text | NOT NULL, FK `drivers`, SET NULL | Chauffeur demandeur |
| `status` | enum `request_status` | NOT NULL, def `pending` | pending · approved · rejected |
| `requested_at` | timestamp | def now | Horodatage de la demande |

## `shift_planning` — planning des chauffeurs

| Colonne | Type | Contraintes | Signification |
| --- | --- | --- | --- |
| `id` | text (uuid) | PK | Identifiant du shift |
| `driver_id` | text | NOT NULL, FK `drivers`, SET NULL | Chauffeur planifié |
| `start_time` | timestamp | NOT NULL | Début du shift |
| `end_time` | timestamp | NOT NULL | Fin du shift |
| `status` | enum `shift_status` | def `planned` | planned · active · completed · cancelled |
| `project_id` | text | FK `projects`, SET NULL | Rattachement projet |

## `ride_selected_options` — options embarquées (prix instantané)

| Colonne | Type | Contraintes | Signification |
| --- | --- | --- | --- |
| `id` | text (uuid) | PK | Identifiant de la ligne |
| `ride_id` | text | NOT NULL, FK `rides`, CASCADE | Course concernée |
| `option_id` | text | NOT NULL, FK `ride_options`, SET NULL | Option choisie |
| `price` | numeric(10,2) | NOT NULL | **Prix figé au moment de la sélection** (l'option peut changer de tarif ensuite ; la course facturée, non) |

## `users` — comptes et rôles (extrait des colonnes métier)

| Colonne | Type | Contraintes | Signification |
| --- | --- | --- | --- |
| `id` | text (uuid) | PK | Identifiant du compte |
| `name` | text | | Nom affiché |
| `email` | text | UNIQUE | Courriel de connexion |
| `role` | enum `user_role` | def `customer` | admin · driver · customer (hiérarchie vérifiée par `verifyRole`) |
| `banned` / `ban_reason` / `ban_expires` | boolean / text / timestamp | | Bannissement administré |
| `latitude` / `longitude` / `last_location_update` | numeric / timestamp | | Dernière position (chauffeur) et son horodatage |
