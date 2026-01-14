<h1 style='text-align: center'>AMT Horizon</h1>
<h2 style='text-align: center'>Functional Specification Document</h2>

<h3 style='text-align: center'>DOCUMENT VERSION 1.2</h3>
<h3 style='text-align: center'>14/01/2026</h3>

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
| 14/01/2026 |   1.2   | <li>Separated Functional and Technical Specifications into distinct documents.</li> <li>Added Page Functionality section.</li> <li>Updated Functional Requirements with detailed descriptions.</li>              |

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
    - [1. Business Manager (Schedule Management)](#1-business-manager-schedule-management)
    - [2. General and Administrative Secretary](#2-general-and-administrative-secretary)
    - [3. Driver (Unmotivated but Opportunistic)](#3-driver-unmotivated-but-opportunistic)
    - [4. Classic Customer (Taxi Île-de-France)](#4-classic-customer-taxi-île-de-france)
    - [5. Corporate Customer (Trip Planning)](#5-corporate-customer-trip-planning)
  - [D. Page Functionality](#d-page-functionality)
    - [1. **Login Page**](#1-login-page)
    - [2. **Admin Dashboard**](#2-admin-dashboard)
    - [3. **Driver Dashboard**](#3-driver-dashboard)
    - [4. **Customer Dashboard**](#4-customer-dashboard)
    - [5. **Billing Page (Admin)**](#5-billing-page-admin)
    - [6. **Notifications Page (All Users)**](#6-notifications-page-all-users)
    - [7. **Profile Page (All Users)**](#7-profile-page-all-users)
    - [8. **OCR Import Page (Admin/Drivers)**](#8-ocr-import-page-admindrivers)
    - [9. **Admin Excel-like View**](#9-admin-excel-like-view)
    - [10. **Real-Time Chat (Drivers/Customers)**](#10-real-time-chat-driverscustomers)
    - [11. **Geolocation \& Maps (Drivers/Customers)**](#11-geolocation--maps-driverscustomers)
    - [12. **Calendar Integration (Drivers)**](#12-calendar-integration-drivers)
    - [Notes:](#notes)
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

### 1. Business Manager (Schedule Management)
**Name**: Marc Lefèvre  
**Age**: 55  
**Role**: Manager of a small taxi fleet in Île-de-France  
**Main Goals**:
- Organize drivers' and vehicles' schedules **without errors**.
- Find available drivers to cover requests, especially during peak hours.
- Reduce time spent manually managing schedules.

**Needs**:
- A **simple and visual** tool to:
  - See drivers' and vehicles' availability at a glance.
  - Assign rides quickly, even at the last minute.
  - Receive alerts in case of cancellations or delays.
- A feature to **motivate drivers** (e.g., bonuses for accepting urgent rides).

**Frustrations**:
- Spending **3-4 hours a day** managing schedules on paper and calling drivers one by one.
- Drivers who don’t respond or forget to confirm their availability.

---

### 2. General and Administrative Secretary
**Name**: Nathalie Dubois  
**Age**: 47  
**Role**: Administrative secretary in an SME/PME  
**Main Goals**:
- Manage supplier and customer invoices **without delay**.
- Create and send invoices quickly and without errors.
- Track payments and remind late-paying customers.

**Needs**:
- An **automated system** to:
  - Generate and send invoices in one click (integration with ride data).
  - Track payments and send automatic reminders.
  - Centralize documents (invoices, contracts, purchase orders) to avoid losing them.
- A **clear and intuitive** interface to avoid data entry errors.

**Frustrations**:
- Invoices piling up and late payments affecting cash flow.
- Time wasted searching for misplaced documents or recopying data.
- Drivers forgetting to provide ride receipts.

---

### 3. Driver (Unmotivated but Opportunistic)
**Name**: Djamel Kebabti  
**Age**: 39  
**Role**: Independent taxi driver  
**Main Goals**:
- **Maximize income** with minimal effort.
- Choose the **most profitable rides** (long distances, high fares).
- Avoid problematic customers or complicated routes.

**Needs**:
- An app that allows him to:
  - See available rides **with price and distance** before accepting.
  - Discreetly decline uninteresting rides.
  - Receive notifications for well-paid rides.
- A **customer rating system** (to avoid bad payers or unnecessarily long trips).

**Frustrations**:
- Having to call dispatch to get ride details.
- Poorly paid rides or customers who change destinations en route.
- Lack of transparency on fares and bonuses.

---

### 4. Classic Customer (Taxi Île-de-France)
**Name**: Jean-Michel Durand  
**Age**: 62  
**Role**: Retired, regular taxi user  
**Main Goals**:
- Find a taxi **quickly and without complications**.
- Have a **punctual and professional** driver.
- Pay by cash or card without issues.

**Needs**:
- A **simple and reliable** solution to:
  - Order a taxi by phone or via a basic app.
  - Know the price in advance (no surprises).
  - Have a driver who knows the area well.

**Frustrations**:
- Long wait times during peak hours.
- Drivers who don’t know shortcuts or traffic jams.
- Apps that are too complex or crash.

---

### 5. Corporate Customer (Trip Planning)
**Name**: Claire Laurent  
**Age**: 41  
**Role**: Executive assistant in a large company  
**Main Goals**:
- Plan trips for **10 employees** every week.
- Track trip progress in real time.
- Have **direct contact with drivers** in case of issues.

**Needs**:
- A platform to:
  - Book recurring trips (e.g., every Monday at 8 AM for the CEO).
  - Receive **real-time notifications** (delays, cancellations).
  - Contact the driver directly if needed (e.g., address change).
- **Clear reporting** to justify expenses to accounting.

**Frustrations**:
- Drivers who don’t arrive on time and make employees wait.
- Lack of visibility on trip status (e.g., "Where is Mr. Dupont’s taxi?").
- Invoices arriving late or with errors.

--- 

## D. Page Functionality

### 1. **Login Page**
- **Purpose**: Authenticate users and redirect them to their respective dashboards.
- **Features**:
  - Login form with email and password fields.
  - "Forgot Password" link to reset password.
  - Role-based redirection (Admin, Driver, Customer).
- **Actors**: All users.

---

### 2. **Admin Dashboard**
- **Purpose**: Central hub for managing rides, drivers, customers, and invoices.
- **Features**:
  - **Ride Management**:
    - View, add, edit, and delete rides.
    - Assign rides to drivers manually or automatically.
    - Import rides via OCR (photos, text).
  - **Driver Management**:
    - View, add, edit, and deactivate driver accounts.
    - Validate driver documents (ID, license).
  - **Customer Management**:
    - View and manage customer accounts.
  - **Billing**:
    - Generate, view, and send invoices.
    - Apply discounts and manage payment reminders.
  - **Reports & Statistics**:
    - Generate reports on rides, revenue, and driver performance.
    - Export data to CSV/PDF.
  - **Notifications**:
    - Send manual notifications to drivers or customers.
- **Actors**: Admins.

---

### 3. **Driver Dashboard**
- **Purpose**: Allow drivers to view and manage their assigned rides, availability, and earnings.
- **Features**:
  - **Ride Management**:
    - View suggested rides based on location and availability.
    - Request assignment to a ride.
    - View ride history and details (departure, destination, price).
  - **Availability**:
    - Toggle availability status (available/unavailable).
  - **Notifications**:
    - Receive real-time alerts for new rides, assignments, and messages.
  - **Earnings & Ratings**:
    - View earnings, completed rides, and customer ratings.
    - Rate customers after completing a ride.
  - **Geolocation**:
    - View ride locations on an interactive map (Mapbox/Google Maps).
    - Enable live GPS tracking for customers (optional).
  - **Chat**:
    - Communicate with customers via in-app chat.
- **Actors**: Drivers.

---

### 4. **Customer Dashboard**
- **Purpose**: Allow customers to book rides, track trips, and manage payments.
- **Features**:
  - **Ride Booking**:
    - Book a ride manually (form with date, time, location, price).
    - View estimated fare before booking.
  - **Ride Tracking**:
    - Track assigned driver’s location in real-time (GPS).
    - View ride history and receipts.
  - **Payments**:
    - Pay via app (Stripe/PayPal) or mark as paid in cash.
    - View and download invoices.
  - **Notifications**:
    - Receive real-time alerts for ride status (assigned, in progress, completed).
  - **Driver Rating**:
    - Rate drivers after completing a ride (1-5 stars + comments).
  - **Support**:
    - Contact driver or admin via in-app chat.
- **Actors**: Customers.

---

### 5. **Billing Page (Admin)**
- **Purpose**: Manage invoicing, payments, and financial reporting.
- **Features**:
  - **Invoice Generation**:
    - Create individual or grouped invoices from rides.
    - Automatic invoice numbering.
  - **Payment Tracking**:
    - Track payment status (unpaid, paid, cancelled).
    - Send automatic reminders for overdue payments.
  - **Discounts**:
    - Apply exceptional discounts to invoices (with justification).
  - **Export**:
    - Export invoices and financial reports to CSV/PDF.
- **Actors**: Admins.

---

### 6. **Notifications Page (All Users)**
- **Purpose**: Centralize and manage notifications for rides, invoices, and system alerts.
- **Features**:
  - View all notifications (unread/read).
  - Filter notifications by type (ride assignments, invoices, urgent alerts).
  - Customize notification preferences (email, in-app, push).
- **Actors**: All users.

---

### 7. **Profile Page (All Users)**
- **Purpose**: Allow users to view and edit their personal information.
- **Features**:
  - **Personal Information**:
    - Edit email, phone number, and password.
  - **Account Settings**:
    - Toggle notification preferences.
    - Deactivate account (admins only for drivers/customers).
  - **Activity Log** (Admins only):
    - View user activity (logins, actions).
- **Actors**: All users.

---

### 8. **OCR Import Page (Admin/Drivers)**
- **Purpose**: Import ride data from photos or text using OCR.
- **Features**:
  - Upload photos of tickets or invoices.
  - Automatically extract ride details (date, time, location, price).
  - Manually validate or correct extracted data before saving.
- **Actors**: Admins, Drivers.

---

### 9. **Admin Excel-like View**
- **Purpose**: Provide a dynamic, spreadsheet-like interface for bulk ride and driver management.
- **Features**:
  - **Dynamic Table**:
    - Sort, filter, and search rides/drivers by any field.
    - Bulk actions (assign, delete, export).
  - **Export**:
    - Export filtered data to CSV/PDF (limit: 10,000 rows).
- **Actors**: Admins.

---

### 10. **Real-Time Chat (Drivers/Customers)**
- **Purpose**: Facilitate communication between drivers and customers.
- **Features**:
  - Send and receive text messages.
  - View conversation history (30-day retention).
  - Receive notifications for new messages.
- **Actors**: Drivers, Customers.

---

### 11. **Geolocation & Maps (Drivers/Customers)**
- **Purpose**: Provide real-time location tracking and route visualization.
- **Features**:
  - **Drivers**:
    - View ride pickup/drop-off locations on a map.
    - Enable/disable live GPS sharing with customers.
  - **Customers**:
    - Track driver’s real-time location during a ride.
    - View estimated arrival time.
- **Actors**: Drivers, Customers.

---

### 12. **Calendar Integration (Drivers)**
- **Purpose**: Sync ride schedules with personal calendars (Google/Outlook).
- **Features**:
  - Bidirectional sync: rides appear as calendar events.
  - Receive alerts for upcoming rides.
- **Actors**: Drivers.

---

### Notes:
- **Security**: All pages enforce role-based access control (e.g., drivers cannot access admin features).
- **Responsiveness**: All pages are optimized for web and mobile use.
- **Performance**: Critical actions (e.g., ride assignment, payment) load in < 2 seconds.

---

### Glossary

- **Admin Dashboard**: Central interface for administrators to manage rides, drivers, customers, and invoices. It provides tools for ride assignment, billing, reporting, and notifications.
- **Assignment Request**: A request made by a driver to be assigned to a specific ride. The status can be pending, approved, or rejected.
- **Better-Auth**: Authentication system used for secure user login and role management in the application.
- **Billing**: Process of generating, sending, and tracking invoices for rides. Includes features for discounts, reminders, and payment status updates.
- **Calendar Integration**: Feature that allows drivers to sync their ride schedules with personal calendars (e.g., Google Calendar, Outlook).
- **Customer Dashboard**: Interface for customers to book rides, track trips, manage payments, and communicate with drivers.
- **Driver Dashboard**: Interface for drivers to view and manage their assigned rides, availability, earnings, and ratings.
- **Dynamic Table**: Interactive table in the Admin Dashboard that allows filtering, sorting, and exporting data for rides and drivers.
- **Excel-like View**: Spreadsheet-like interface for bulk management of rides and drivers, supporting actions like sorting, filtering, and exporting.
- **Geolocation**: Integration with mapping services (e.g., Mapbox, Google Maps) to provide real-time location tracking and route visualization.
- **GDPR**: General Data Protection Regulation, a legal framework for personal data protection in Europe. Ensures data privacy and security.
- **Invoice**: Document generated for billing purposes, detailing ride costs, taxes, and payment status.
- **Live GPS Tracking**: Feature that allows customers to track the real-time location of their assigned driver during a ride.
- **Neon**: Serverless PostgreSQL service optimized for scalable and modern applications.
- **NextJS**: React framework used for building the web application, providing server-side rendering and static site generation.
- **Notifications**: Real-time alerts sent to users for events like new rides, assignments, invoices, and urgent updates.
- **OCR (Optical Character Recognition)**: Technology used to extract text from images (e.g., tickets, invoices) for ride data import.
- **Partial Payment**: Feature allowing customers to pay a portion of the total invoice amount (minimum 30%).
- **Real-Time Chat**: In-app messaging system for communication between drivers and customers.
- **Ride**: A taxi trip with details like departure, destination, time, price, and status (pending, assigned, completed, cancelled).
- **Ride History**: Record of past rides for drivers and customers, including details like date, status, and price.
- **Ride Import**: Process of adding ride data via form, text, or photo (using OCR).
- **Ride Management**: Features for adding, editing, assigning, and tracking rides.
- **Ride Options**: Additional services (e.g., VIP, baby seat) that can be selected for a ride, with associated prices.
- **Ride Suggestions**: Algorithm-based recommendations for rides based on driver availability and location.
- **Role-Based Access Control**: System that restricts access to features based on user roles (Admin, Driver, Customer).
- **Shift Planning**: Management of driver shift schedules, including start/end times and status (planned, active, completed, cancelled).
- **Stripe/PayPal**: Secure online payment solutions integrated for processing ride payments.
- **Two-Factor Authentication (2FA)**: Security method requiring two proofs of identity for user login.
- **User Management**: Features for registering, validating, modifying, and deactivating user accounts.
- **User Role**: Classification of users in the system (Admin, Driver, Customer) that determines access and permissions.
- **Vitest**: Testing framework used for unit and integration testing in the application.