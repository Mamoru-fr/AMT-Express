<h1 style='text-align: center'>AMT Horizon</h1>
<h2 style='text-align: center'>Functional Specification / Technical Specification Document</h2>

<h3 style='text-align: center'>DOCUMENT VERSION 1.1</h3>
<h3 style='text-align: center'>08/01/2026</h3>

---

<h3>Author</h3>

| Name          | Role                        |
| ------------- | --------------------------- |
| Alexis SANTOS | Program Manager / Tech Lead |

<h3>Revision History</h3>

| Date       | Version | Description of Changes                                                                                                       |
| ---------- | :-----: | ---------------------------------------------------------------------------------------------------------------------------- |
| 04/01/2026 |   1.0   | <li>Document creation and drafting of sections Overview, A to E.</li> <li>Added Functional Requirements.</li>                |
| 08/01/2026 |   1.1   | <li>Translated code and technical sections to English.</li> <li>Adapted for NextJS, Vitest, Neon, Drizzle, better-auth.</li> |

---

<details>
<summary>Table of Contents</summary>

- [I. General Overview](#i-general-overview)
  - [A. Product Description](#a-product-description)
  - [B. Product Functional Capabilities](#b-product-functional-capabilities)
    - [User Management](#user-management)
    - [Ride Management](#ride-management)
    - [Admin View (Excel-like)](#admin-view-excel-like)
    - [Billing](#billing)
    - [Notifications](#notifications)
    - [Additional Features](#additional-features)
  - [C. Project Organization](#c-project-organization)
    - [Project Representatives](#project-representatives)
    - [Stakeholders](#stakeholders)
- [II. Requirements](#ii-requirements)
  - [A. Functional Requirements](#a-functional-requirements)
    - [User Management](#user-management-1)
    - [Gestion des Courses](#gestion-des-courses)
    - [Admin View (Excel-like)](#admin-view-excel-like-1)
    - [Billing](#billing-1)
    - [Notifications](#notifications-1)
    - [Additional Features](#additional-features-1)
    - [Security](#security)
  - [B. Non-Functional Requirements](#b-non-functional-requirements)
  - [C. Personas](#c-personas)
      - [**1. Chef d’Entreprise (Gestion du Planning)**](#1-chef-dentreprise-gestion-du-planning)
      - [**2. Secrétaire Générale et Administrative**](#2-secrétaire-générale-et-administrative)
      - [**3. Chauffeur (Peu Motivé mais Opportuniste)**](#3-chauffeur-peu-motivé-mais-opportuniste)
      - [**4. Client Classique (Taxi Île-de-France)**](#4-client-classique-taxi-île-de-france)
      - [**5. Client Entreprise (Planification de Trajets)**](#5-client-entreprise-planification-de-trajets)
        - [A. Synthèse des Attentes et Points de Friction](#a-synthèse-des-attentes-et-points-de-friction)
        - [B. Prochaines Étapes](#b-prochaines-étapes)
  - [D. Database Structure (PostgreSQL/Neon)](#d-database-structure-postgresqlneon)
    - [Conceptual Schema](#conceptual-schema)
    - [Explanations](#explanations)
  - [E. SQL Query Examples](#e-sql-query-examples)
    - [1. List unassigned rides](#1-list-unassigned-rides)
    - [2. Generate an invoice](#2-generate-an-invoice)
    - [3. Update assignment request status](#3-update-assignment-request-status)
    - [4. Retrieve user's unread notifications](#4-retrieve-users-unread-notifications)
    - [5. List available drivers within a 5 km radius](#5-list-available-drivers-within-a-5-km-radius)
    - [6. Calculate driver's average rating](#6-calculate-drivers-average-rating)
    - [7. Send invoice via application](#7-send-invoice-via-application)
    - [8. List invoices eligible for reminder (unpaid, overdue)](#8-list-invoices-eligible-for-reminder-unpaid-overdue)
    - [9. Send manual reminder](#9-send-manual-reminder)
- [Glossary](#glossary)

</details>

---

# I. General Overview

Our client requested the development of a web/mobile application in NextJS with better-auth to manage taxi rides, their distribution, and billing. The goal is to provide an intuitive solution for admins, drivers, and customers, with advanced features such as data import via photo (OCR) and automatic ride suggestions.

## A. Product Description

This application allows you to:
- **Cataloging** taxi rides.
- **Distributing** rides among drivers via a dynamic schedule.
- **Generating** invoices from rides (individual or grouped).
- **Suggesting** rides to drivers and allowing them to request assignment.
- **Importing** ride data via form, text, schema, or photo (OCR).
 
## B. Product Functional Capabilities

### User Management
- **Registration/Login**: Distinct roles (Admin, Driver, Customer) with secure authentication (better-Auth).
- **Password Recovery**: Reset link valid for 24 hours.

### Ride Management
- **Manual Addition**: Form to enter details (date, time, location, price).
- **Import via Text/Photo**: Automatic data extraction via OCR (Tesseract.js/Google Vision).
- **Ride Suggestions**: Matching algorithm based on availability and location.
- **Assignment Request**: Drivers can request to be assigned to a ride.

### Admin View (Excel-like)
- **Dynamic Table**: Filters, sorting, data export.
- **Export**: Generate CSV/PDF files.

### Billing
- **Invoice Creation**: Select rides, automatic numbering.
- **Invoice Sending**: By email, with status tracking.

### Notifications
- **Real-time Alerts**: New rides, assignments, invoices.

### Additional Features
- **Geolocation**: Integration with Mapbox/Google Maps.
- **Online Payment**: Stripe/PayPal.
- **Internal Chat**: Communication between drivers and customers.

## C. Project Organization

### Project Representatives

| Project Owner | Represented by...               |
| ------------- | ------------------------------- |
| Client        | Alexis SANTOS (Program Manager) |

### Stakeholders

| Stakeholder | Interest                                  |
| ----------- | ----------------------------------------- |
| Admins      | Full management of rides and invoices.    |
| Drivers     | View suggested rides, request assignment. |
| Customers   | Add rides, track trips.                   |

---

# II. Requirements

## A. Functional Requirements

### User Management
| **ID** | **Feature**               | **Actors** | **Inputs**                | **Outputs**                     | **Business Rules**                                     |
| ------ | ------------------------- | ---------- | ------------------------- | ------------------------------- | ------------------------------------------------------ |
| FR-001 | Registration/Login        | All        | Email, password, role     | Account created, active session | Roles: Admin, Driver, Customer                         |
| FR-002 | Password Recovery         | All        | Email                     | Reset link                      | Link valid for 24h                                     |
| FR-003 | Driver Account Validation | Admin      | ID card, driver's license | Account validated or rejected   | Manual verification within 24h.                        |
| FR-004 | Profile Modification      | All        | New email, phone number   | Profile updated, notification   | Unique email, valid format.                            |
| FR-005 | Account Deactivation      | Admin      | User, Reason (optional)   | Account deactivated             | Account disabled, notification, Data archiving (GDPR). |

### Gestion des Courses
| **ID** | **Fonctionnalité**               | **Acteurs**        | **Entrées**                        | **Sorties**                      | **Règles Métier**                                       |
| ------ | -------------------------------- | ------------------ | ---------------------------------- | -------------------------------- | ------------------------------------------------------- |
| FR-010 | Manual Ride Addition             | All                | Form (date, time, location, price) | Ride recorded, notification      | Required fields validated                               |
| FR-011 | Ride Import via Photo            | Admin, Drivers     | Photo (ticket, invoice)            | Extracted data, ride created     | OCR + manual validation                                 |
| FR-012 | Ride Suggestions                 | System             | Availability, location             | List of suggested rides          | Matching algorithm                                      |
| FR-013 | Manual Validation of OCR Imports | Admin              | Extracted data, manual correction  | Ride validated or rejected       | Notification required for rejection (reason mandatory). |
| FR-014 | Ride History                     | Drivers, Customers | Filters (date, status)             | List of past rides               | Customers only see their own rides.                     |
| FR-015 | Ride Cancellation                | Drivers, Customers | Reason, ride ID                    | Ride cancelled, notification     | Max delay: 2 hours before departure.                    |
| FR-016 | Driver Rating                    | Customers          | Rating (1-5), comment              | Rating recorded, average updated | Only after a completed ride.                            |
| FR-017 | Automatic Ride Suggestions       | System             | Location, availability             | List of 3 priority rides         | Algorithm based on proximity and history.               |
| FR-018 | Assignment Request with Comment  | Drivers            | Ride ID, message                   | Request sent, admin notification | Max 5 simultaneous requests.                            |

### Admin View (Excel-like)
| **ID** | **Feature**     | **Actors** | **Inputs**             | **Outputs**                     | **Business Rules**             |
| ------ | --------------- | ---------- | ---------------------- | ------------------------------- | ------------------------------ |
| FR-020 | Dynamic Table   | Admin      | Filters (date, status) | Sortable/exportable list        | Access restricted to admins    |
| FR-021 | Custom Export   | Admin      | Selected columns       | CSV/PDF file with filtered data | Limit: 10,000 rows per export. |
| FR-022 | Ride Statistics | Admin      | Period, data type      | Charts (number, revenue, etc.)  | Automatic daily refresh.       |

### Billing
| **ID** | **Fonctionnalité**         | **Acteurs** | **Entrées**                | **Sorties**                                 | **Règles Métier**                                                             |
| ------ | -------------------------- | ----------- | -------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| FR-030 | Invoice Creation           | Admin       | Ride selection             | Generated PDF invoice                       | Automatic numbering                                                           |
| FR-031 | Grouped Billing            | Admin       | Ride selection             | Single PDF invoice                          | Grouping by customer or period.                                               |
| FR-032 | Automatic Reminder         | System      | Overdue due date           | Reminder email                              | Max 3 reminders (D+7, D+14, D+30).                                            |
| FR-033 | Exceptional Discount       | Admin       | Invoice ID, percentage     | Updated invoice                             | Justification required.                                                       |
| FR-034 | Send Invoice via App       | Admin       | Invoice ID, recipient      | Invoice sent (PDF attached), status updated | Immediate sending, history preserved. Notifies customer via email and in-app. |
| FR-035 | Manual Reminder Management | Admin       | Invoice ID, custom message | Reminder sent (email/app), status updated   | Only after explicit admin validation. Max 3 reminders (configurable).         |

### Notifications
| **ID** | **Feature**             | **Actors** | **Inputs**               | **Outputs**        | **Business Rules**                 |
| ------ | ----------------------- | ---------- | ------------------------ | ------------------ | ---------------------------------- |
| FR-040 | Real-time Notifications | All        | Event (ride, invoice)    | Email/in-app alert | Channel customization              |
| FR-041 | Channel Customization   | All        | Preferences (email, app) | Channels updated   | Email by default, can be disabled. |
| FR-042 | Urgent Notifications    | System     | Critical event           | Push + email alert | Ex: ride cancellation by customer. |

### Additional Features
| **ID** | **Feature**          | **Actors**         | **Inputs**                   | **Outputs**                  | **Business Rules**             |
| ------ | -------------------- | ------------------ | ---------------------------- | ---------------------------- | ------------------------------ |
| FR-050 | Route Geolocation    | Drivers, Customers | GPS coordinates              | Interactive map              | Mapbox/Google Maps integration |
| FR-051 | Real-time Chat       | Drivers, Customers | Text message                 | Saved conversation           | History kept for 30 days.      |
| FR-052 | Live GPS Tracking    | Customers          | Ride ID                      | Driver position in real-time | Can be disabled by driver.     |
| FR-053 | Partial Payment      | Customers          | Partial amount               | Invoice updated              | Minimum 30% of total amount.   |
| FR-054 | Calendar Integration | Drivers            | Google Calendar/Outlook link | Synchronized events          | Bidirectional synchronization. |

### Security

| ID     | Feature                   | Actors | Inputs                 | Outputs                  | Business Rules            |
| ------ | ------------------------- | ------ | ---------------------- | ------------------------ | ------------------------- |
| FR-060 | Activity Log              | Admin  | Filters (user, action) | List of actions          | 6-month retention (GDPR). |
| FR-061 | Two-Factor Authentication | All    | SMS/email code         | Access granted or denied | Mandatory for admins.     |

---

## B. Non-Functional Requirements
- **OCR**: Minimum 90% accuracy for data extraction.
- **Performance**: Response time < 2s for critical actions.
- **Security**: Encryption of sensitive data (GDPR).

---

## C. Personas

#### **1. Chef d’Entreprise (Gestion du Planning)**
**Nom** : Marc Lefèvre
**Âge** : 55 ans
**Rôle** : Gérant d’une petite flotte de taxis en Île-de-France
**Outils utilisés** : Carnet papier, Excel basique, téléphone fixe, SMS.

**Objectifs principaux** :
- Organiser les plannings des chauffeurs et véhicules **sans erreurs**.
- Trouver des chauffeurs disponibles pour couvrir les demandes, surtout aux heures de pointe.
- Réduire le temps passé à gérer les plannings manuellement.

**Besoins** :
- Un outil **simple et visuel** pour :
  - Voir en un coup d’œil les disponibilités des chauffeurs et véhicules.
  - Assigner des courses rapidement, même en dernière minute.
  - Recevoir des alertes en cas de désistement ou de retard.
- Une fonctionnalité pour **motiver les chauffeurs** (ex : bonus pour les courses acceptées en urgence).

**Frustrations** :
- Passer **3-4 heures par jour** à gérer les plannings sur papier et à appeler les chauffeurs un par un.
- Les chauffeurs qui ne répondent pas ou oublient de confirmer leur disponibilité.
- Les courses non attribuées faute de chauffeurs, ce qui fait perdre des clients.

**Scénario typique** :
*« Il est 16h, j’ai 5 courses à assigner pour ce soir, mais 3 chauffeurs n’ont pas encore confirmé. Je dois les appeler un par un, et si personne ne répond, je dois annuler la course et risquer de perdre le client. »*

**Citation** :
*« Si je pouvais voir en temps réel qui est disponible et leur envoyer une course en un clic, ça me ferait gagner un temps fou. »*

---

#### **2. Secrétaire Générale et Administrative**
**Nom** : Nathalie Dubois
**Âge** : 47 ans
**Rôle** : Secrétaire administrative dans une PME
**Outils utilisés** : Excel, Word, emails, factures papier, classeurs.

**Objectifs principaux** :
- Gérer les factures fournisseurs et clients **sans retard**.
- Créer et envoyer les factures rapidement, sans erreur.
- Suivre les paiements et relancer les clients en retard.

**Besoins** :
- Un système **automatisé** pour :
  - Générer et envoyer les factures en 1 clic (intégration avec les données des courses).
  - Suivre les paiements et envoyer des relances automatiques.
  - Centraliser les documents (factures, contrats, bons de commande) pour éviter de les perdre.
- Une interface **claire et intuitive** pour éviter les erreurs de saisie.

**Frustrations** :
- Les factures qui s’accumulent et les retards de paiement qui pénalisent la trésorerie.
- Le temps perdu à chercher des documents égarés ou à recopier des données.
- Les chauffeurs qui oublient de lui transmettre les justificatifs de course.

**Scénario typique** :
*« Je passe mon après-midi à recopier les courses du jour dans Excel pour créer les factures. Si un chauffeur oublie de me donner son ticket, je dois tout recommencer. »*

**Citation** :
*« J’en ai marre de perdre du temps à faire du copier-coller entre les carnets des chauffeurs et Excel. »*

---

#### **3. Chauffeur (Peu Motivé mais Opportuniste)**
**Nom** : Djamel Kebabti
**Âge** : 39 ans
**Rôle** : Chauffeur de taxi indépendant
**Outils utilisés** : WhatsApp, GPS basique, application de courses concurrentes.

**Objectifs principaux** :
- **Maximiser ses revenus** avec un minimum d’effort.
- Choisir les courses **les plus rentables** (longues distances, tarifs élevés).
- Éviter les clients problématiques ou les trajets compliqués.

**Besoins** :
- Une appli qui lui permet de :
  - Voir les courses disponibles **avec le prix et la distance** avant d’accepter.
  - Refuser discrètement les courses peu intéressantes.
  - Recevoir des notifications pour les courses bien payées.
- Un système de **notation des clients** (pour éviter les mauvais payeurs ou les trajets trop longs pour rien).

**Frustrations** :
- Devoir appeler la centrale pour connaître les détails de la course.
- Les courses mal payées ou les clients qui changent de destination en route.
- Le manque de transparence sur les tarifs et les bonus.

**Scénario typique** :
*« Je suis garé près de la gare, je vois une notification pour une course à 50€ vers l’aéroport. Je l’accepte direct. Mais si c’est juste un trajet à 10€ en banlieue, je laisse tomber. »*

**Citation** :
*« Je ne bouge que si la course vaut le coup. Sinon, je reste au chaud dans ma voiture. »*

---

#### **4. Client Classique (Taxi Île-de-France)**
**Nom** : Jean-Michel Durand
**Âge** : 62 ans
**Rôle** : Retraité, utilisateur régulier de taxis
**Outils utilisés** : Téléphone, applications basiques (Uber occasionnellement).

**Objectifs principaux** :
- Trouver un taxi **rapidement et sans complication**.
- Avoir un chauffeur **ponctuel et professionnel**.
- Payer en espèces ou par carte sans problème.

**Besoins** :
- Une solution **simple et fiable** pour :
  - Commander un taxi par téléphone ou via une appli basique.
  - Connaître le prix à l’avance (sans surprise).
  - Avoir un chauffeur qui connaît bien la région.

**Frustrations** :
- Les temps d’attente trop longs aux heures de pointe.
- Les chauffeurs qui ne connaissent pas les raccourcis ou les bouchons.
- Les applications trop complexes ou qui plantent.

**Scénario typique** :
*« Je sors de chez le médecin, il pleut, et je dois rentrer vite. J’appelle le numéro habituel, mais on me dit qu’il n’y a pas de taxi disponible avant 30 minutes. »*

**Citation** :
*« Je veux un taxi comme avant : j’appelle, il arrive, je paie, c’est tout. »*

---

#### **5. Client Entreprise (Planification de Trajets)**
**Nom** : Claire Laurent
**Âge** : 41 ans
**Rôle** : Assistante de direction dans une grande entreprise
**Outils utilisés** : Outlook, Excel, ERP interne.

**Objectifs principaux** :
- Planifier les trajets pour **10 collaborateurs** chaque semaine.
- Suivre l’avancée des trajets en temps réel.
- Avoir un **contact direct avec les chauffeurs** en cas de problème.

**Besoins** :
- Une plateforme pour :
  - Réserver des trajets récurrents (ex : tous les lundis à 8h pour le PDG).
  - Recevoir des **notifications en temps réel** (retards, annulations).
  - Contacter le chauffeur directement si besoin (ex : changement d’adresse).
- Un **reporting clair** pour justifier les dépenses auprès de la comptabilité.

**Frustrations** :
- Les chauffeurs qui n’arrivent pas à l’heure et font attendre les collaborateurs.
- Le manque de visibilité sur l’état des trajets (ex : « Où est le taxi de M. Dupont ? »).
- Les factures qui arrivent en retard ou avec des erreurs.

**Scénario typique** :
*« Le PDG doit être à l’aéroport à 14h, mais son taxi a 20 minutes de retard. Je n’ai aucun moyen de joindre le chauffeur pour savoir ce qui se passe. »*

**Citation** :
*« Je dois pouvoir suivre chaque trajet comme un colis Amazon. »*

---

##### A. Synthèse des Attentes et Points de Friction

| Rôle                     | Attentes Clés                                                                 | Points de Friction à Résoudre                          |
|--------------------------|------------------------------------------------------------------------------|-------------------------------------------------------|
| **Chef d’Entreprise**    | Planning visuel, assignation rapide, alertes en temps réel.                 | Gestion manuelle, chauffeurs indisponibles.           |
| **Secrétaire**           | Facturation automatisée, centralisation des documents, suivi des paiements. | Factures en retard, documents égarés.                 |
| **Chauffeur**            | Courses rentables, transparence sur les tarifs, notation des clients.      | Courses mal payées, manque d’infos avant d’accepter.  |
| **Client Classique**     | Simplicité, ponctualité, prix clair.                                        | Temps d’attente, applications complexes.             |
| **Client Entreprise**    | Planification récurrente, suivi en temps réel, contact direct.             | Retards, manque de visibilité, factures erronées.     |

---

##### B. Prochaines Étapes
- **Validation** : *« Ces personas te semblent-ils réalistes et complets, Alexis ? »*
- **Priorisation** : *« On pourrait commencer par développer les features pour le chef d’entreprise et la secrétaire, non ? Ce sont eux qui ont les frustrations les plus critiques. »*
- **Exigences fonctionnelles** : *« Je peux te proposer une liste détaillée des fonctionnalités à développer pour chaque persona, si tu veux. »*

---
**Question** : *« Est-ce que tu veux qu’on affine un persona en particulier, ou qu’on passe directement à la définition des exigences fonctionnelles pour le MVP ? »*

---

## D. Database Structure (PostgreSQL/Neon)

### Conceptual Schema

```sql
-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'driver', 'customer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rides Table
CREATE TABLE rides (
    ride_id SERIAL PRIMARY KEY,
    departure VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
    photo_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id),
    driver_id INT REFERENCES users(user_id)
);

-- Assignment Requests Table
CREATE TABLE assignment_requests (
    request_id SERIAL PRIMARY KEY,
    ride_id INT REFERENCES rides(ride_id),
    driver_id INT REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    ride_id INT REFERENCES rides(ride_id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled')),
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    pdf_url VARCHAR(512),
    sent_via_app BOOLEAN DEFAULT FALSE,
    app_sent_at TIMESTAMP,
    reminders_sent INT DEFAULT 0,
    last_reminder_message TEXT
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings Table
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    ride_id INT REFERENCES rides(ride_id),
    customer_id INT REFERENCES users(user_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    email BOOLEAN DEFAULT TRUE,
    push BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Explanations

- **users**: Stores user information (role, email, hashed password).
- **rides**: Details of trips, including times, status, and user links.
- **assignment_requests**: Manages driver assignment requests for rides.
- **invoices**: Invoices generated from rides.
- **notifications**: Alerts sent to users.

## E. SQL Query Examples

### 1. List unassigned rides

```sql
SELECT * FROM rides
WHERE status = 'pending' AND driver_id IS NULL;
```

### 2. Generate an invoice

```sql
INSERT INTO invoices (ride_id, amount, status, invoice_date, due_date)
VALUES (1, 25.50, 'unpaid', NOW(), NOW() + INTERVAL '30 days');
```

### 3. Update assignment request status

```sql
UPDATE assignment_requests
SET status = 'approved'
WHERE request_id = 1;
```

### 4. Retrieve user's unread notifications

```sql
SELECT * FROM notifications
WHERE user_id = 1 AND is_read = FALSE;
```

### 5. List available drivers within a 5 km radius

```sql
-- Assuming `latitude` and `longitude` columns in the users table
SELECT u.user_id, u.email
FROM users u
WHERE u.role = 'driver'
  AND u.available = TRUE
  AND ST_DWithin(
      ST_MakePoint(u.longitude, u.latitude)::geography,
      ST_MakePoint(:client_longitude, :client_latitude)::geography,
      5000  -- 5 km in meters
  );

```

### 6. Calculate driver's average rating

```sql
SELECT AVG(rating) as average_rating
FROM ratings
WHERE driver_id = :driver_id;
```

### 7. Send invoice via application

```sql
UPDATE invoices
SET
    sent_via_app = TRUE,
    app_sent_at = NOW(),
    status = 'sent'
WHERE invoice_id = :invoice_id;
-- Send PDF by email and in-app notification (backend logic)
```

### 8. List invoices eligible for reminder (unpaid, overdue)

```sql
SELECT invoice_id, ride_id, amount, due_date
FROM invoices
WHERE status = 'unpaid'
  AND due_date < NOW()
  AND reminders_sent < 3;
```

### 9. Send manual reminder

```sql
UPDATE invoices
SET
    reminders_sent = reminders_sent + 1,
    last_reminder_message = :custom_message,
    status = 'reminder_sent'
WHERE invoice_id = :invoice_id;
-- Send email/notification with custom message
```

# Glossary

- **OCR**: Optical Character Recognition, technology to extract text from images (tickets, invoices).
- **Neon**: Serverless service for PostgreSQL, optimized for scalable and modern applications.
- **GDPR**: General Data Protection Regulation, legal framework for personal data protection in Europe.
- **Stripe/PayPal**: Secure online payment solutions.
- **Mapbox/Google Maps**: Mapping APIs for geolocation and route display.
- **2FA**: Two-Factor Authentication, security method requiring two proofs of identity.
- **ST_DWithin**: PostgreSQL/PostGIS function for geospatial queries.