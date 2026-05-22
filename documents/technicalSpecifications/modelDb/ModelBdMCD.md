# AMT-Express? documentation
## Summary

- [AMT-Express? documentation](#amt-express-documentation)
  - [Summary](#summary)
  - [Introduction](#introduction)
  - [Database type](#database-type)
  - [Table structure](#table-structure)
    - [users](#users)
      - [Enums](#enums)
        - [role](#role)
    - [productions](#productions)
    - [drivers](#drivers)
    - [projects](#projects)
    - [rides](#rides)
      - [Enums](#enums-1)
        - [status](#status)
    - [shift\_planning](#shift_planning)
      - [Enums](#enums-2)
        - [status](#status-1)
    - [ride\_options](#ride_options)
    - [ride\_selected\_options](#ride_selected_options)
    - [ride\_customers](#ride_customers)
    - [assignment\_requests](#assignment_requests)
      - [Enums](#enums-3)
        - [status](#status-2)
    - [invoices](#invoices)
      - [Enums](#enums-4)
        - [status](#status-3)
    - [invoice\_items](#invoice_items)
    - [notifications](#notifications)
    - [notification\_preferences](#notification_preferences)
    - [activity\_logs](#activity_logs)
    - [session](#session)
    - [account](#account)
    - [verification](#verification)
  - [Relationships](#relationships)
  - [Database Diagram](#database-diagram)

## Introduction

## Database type

- **Database system:** MySQL
## Table structure

### users

| Name                     | Type         | Settings                             | References | Note |
| ------------------------ | ------------ | ------------------------------------ | ---------- | ---- |
| **id**                   | VARCHAR(191) | 🔑 PK, not null                      |            |      |
| **name**                 | VARCHAR(255) | not null                             |            |      |
| **email**                | VARCHAR(255) | not null                             |            |      |
| **email_verified**       | TINYINT      | not null, default: 0                 |            |      |
| **image**                | TEXT         | not null                             |            |      |
| **created_at**           | DATETIME     | not null, default: CURRENT_TIMESTAMP |            |      |
| **updated_at**           | DATETIME     | not null, default: CURRENT_TIMESTAMP |            |      |
| **role**                 | ENUM         | not null, default: customer          |            |      |
| **banned**               | TINYINT      | not null, default: 0                 |            |      |
| **ban_reason**           | TEXT         | not null                             |            |      |
| **ban_expires**          | DATETIME     | not null                             |            |      |
| **latitude**             | DECIMAL(9,6) | not null                             |            |      |
| **longitude**            | DECIMAL(9,6) | not null                             |            |      |
| **last_location_update** | DATETIME     | not null                             |            |      | 

#### Enums
##### role

- admin
- driver
- customer


### productions

| Name              | Type         | Settings                             | References | Note |
| ----------------- | ------------ | ------------------------------------ | ---------- | ---- |
| **id**            | VARCHAR(191) | 🔑 PK, not null                      |            |      |
| **name**          | VARCHAR(255) | not null                             |            |      |
| **address**       | TEXT         | not null                             |            |      |
| **contact_name**  | VARCHAR(255) | not null                             |            |      |
| **contact_email** | VARCHAR(255) | not null                             |            |      |
| **contact_phone** | VARCHAR(50)  | not null                             |            |      |
| **created_at**    | DATETIME     | not null, default: CURRENT_TIMESTAMP |            |      |
| **updated_at**    | DATETIME     | not null, default: CURRENT_TIMESTAMP |            |      | 


### drivers

| Name                | Type         | Settings                             | References               | Note |
| ------------------- | ------------ | ------------------------------------ | ------------------------ | ---- |
| **id**              | BIGINT       | 🔑 PK, not null, autoincrement       |                          |      |
| **user_id**         | VARCHAR(191) | not null                             | fk_drivers_user_id_users |      |
| **accounting_code** | VARCHAR(100) | not null                             |                          |      |
| **vehicle_type**    | VARCHAR(100) | not null                             |                          |      |
| **vehicle_plate**   | VARCHAR(50)  | not null                             |                          |      |
| **vehicle_model**   | VARCHAR(100) | not null                             |                          |      |
| **vehicle_color**   | VARCHAR(50)  | not null                             |                          |      |
| **available**       | TINYINT      | not null, default: 1                 |                          |      |
| **created_at**      | DATETIME     | not null, default: CURRENT_TIMESTAMP |                          |      |
| **updated_at**      | DATETIME     | not null, default: CURRENT_TIMESTAMP |                          |      | 


### projects

| Name              | Type         | Settings                             | References                            | Note |
| ----------------- | ------------ | ------------------------------------ | ------------------------------------- | ---- |
| **id**            | VARCHAR(191) | 🔑 PK, not null                      |                                       |      |
| **name**          | VARCHAR(255) | not null                             |                                       |      |
| **production_id** | VARCHAR(191) | not null                             | fk_projects_production_id_productions |      |
| **is_generic**    | TINYINT      | not null, default: 0                 |                                       |      |
| **start_date**    | DATETIME     | not null                             |                                       |      |
| **end_date**      | DATETIME     | not null                             |                                       |      |
| **created_at**    | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                       |      |
| **updated_at**    | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                       |      | 


### rides

| Name               | Type          | Settings                             | References                   | Note |
| ------------------ | ------------- | ------------------------------------ | ---------------------------- | ---- |
| **id**             | BIGINT        | 🔑 PK, not null, autoincrement       |                              |      |
| **departure**      | VARCHAR(255)  | not null                             |                              |      |
| **destination**    | VARCHAR(255)  | not null                             |                              |      |
| **departure_time** | DATETIME      | not null                             |                              |      |
| **arrival_time**   | DATETIME      | not null                             |                              |      |
| **distance_km**    | DECIMAL(6,2)  | not null                             |                              |      |
| **price**          | DECIMAL(10,2) | not null                             |                              |      |
| **status**         | ENUM          | not null, default: pending           |                              |      |
| **photo_url**      | TEXT          | not null                             |                              |      |
| **created_at**     | DATETIME      | not null, default: CURRENT_TIMESTAMP |                              |      |
| **updated_at**     | DATETIME      | not null, default: CURRENT_TIMESTAMP |                              |      |
| **driver_id**      | BIGINT        | not null                             | fk_rides_driver_id_drivers   |      |
| **customer_notes** | TEXT          | not null                             |                              |      |
| **project_id**     | VARCHAR(191)  | not null                             | fk_rides_project_id_projects |      |
| **waiting_time**   | INTEGER       | not null, default: 0                 |                              |      | 

#### Enums
##### status

- pending
- assigned
- completed
- cancelled


### shift_planning

| Name           | Type         | Settings                             | References                            | Note |
| -------------- | ------------ | ------------------------------------ | ------------------------------------- | ---- |
| **id**         | BIGINT       | 🔑 PK, not null, autoincrement       |                                       |      |
| **driver_id**  | BIGINT       | not null                             | fk_shift_planning_driver_id_drivers   |      |
| **start_time** | DATETIME     | not null                             |                                       |      |
| **end_time**   | DATETIME     | not null                             |                                       |      |
| **status**     | ENUM         | not null, default: planned           |                                       |      |
| **project_id** | VARCHAR(191) | not null                             | fk_shift_planning_project_id_projects |      |
| **created_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                       |      |
| **updated_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                       |      | 

#### Enums
##### status

- planned
- active
- completed
- cancelled


### ride_options

| Name                 | Type          | Settings                             | References | Note |
| -------------------- | ------------- | ------------------------------------ | ---------- | ---- |
| **id**               | BIGINT        | 🔑 PK, not null, autoincrement       |            |      |
| **name**             | VARCHAR(255)  | not null                             |            |      |
| **description**      | TEXT          | not null                             |            |      |
| **additional_price** | DECIMAL(10,2) | not null, default: 0.00              |            |      |
| **created_at**       | DATETIME      | not null, default: CURRENT_TIMESTAMP |            |      |
| **updated_at**       | DATETIME      | not null, default: CURRENT_TIMESTAMP |            |      | 


### ride_selected_options

| Name           | Type          | Settings                             | References                                      | Note |
| -------------- | ------------- | ------------------------------------ | ----------------------------------------------- | ---- |
| **id**         | BIGINT        | 🔑 PK, not null, autoincrement       |                                                 |      |
| **ride_id**    | BIGINT        | not null                             | fk_ride_selected_options_ride_id_rides          |      |
| **option_id**  | BIGINT        | not null                             | fk_ride_selected_options_option_id_ride_options |      |
| **price**      | DECIMAL(10,2) | not null                             |                                                 |      |
| **created_at** | DATETIME      | not null, default: CURRENT_TIMESTAMP |                                                 |      | 


### ride_customers

| Name            | Type         | Settings                             | References                          | Note |
| --------------- | ------------ | ------------------------------------ | ----------------------------------- | ---- |
| **id**          | BIGINT       | 🔑 PK, not null, autoincrement       |                                     |      |
| **ride_id**     | BIGINT       | not null                             | fk_ride_customers_ride_id_rides     |      |
| **customer_id** | VARCHAR(191) | not null                             | fk_ride_customers_customer_id_users |      |
| **rating**      | INTEGER      | not null                             |                                     |      |
| **comment**     | TEXT         | not null                             |                                     |      |
| **created_at**  | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                     |      |
| **updated_at**  | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                     |      | 


### assignment_requests

| Name             | Type     | Settings                             | References                               | Note |
| ---------------- | -------- | ------------------------------------ | ---------------------------------------- | ---- |
| **id**           | BIGINT   | 🔑 PK, not null, autoincrement       |                                          |      |
| **ride_id**      | BIGINT   | not null                             | fk_assignment_requests_ride_id_rides     |      |
| **driver_id**    | BIGINT   | not null                             | fk_assignment_requests_driver_id_drivers |      |
| **status**       | ENUM     | not null, default: pending           |                                          |      |
| **requested_at** | DATETIME | not null, default: CURRENT_TIMESTAMP |                                          |      |
| **updated_at**   | DATETIME | not null, default: CURRENT_TIMESTAMP |                                          |      | 

#### Enums
##### status

- pending
- approved
- rejected


### invoices

| Name                      | Type          | Settings                             | References | Note |
| ------------------------- | ------------- | ------------------------------------ | ---------- | ---- |
| **id**                    | BIGINT        | 🔑 PK, not null, autoincrement       |            |      |
| **waiting_fee**           | DECIMAL(10,2) | not null, default: 0.00              |            |      |
| **sub_total**             | DECIMAL(10,2) | not null                             |            |      |
| **tax**                   | DECIMAL(10,2) | not null, default: 0.00              |            |      |
| **total**                 | DECIMAL(10,2) | not null                             |            |      |
| **status**                | ENUM          | not null, default: unpaid            |            |      |
| **invoice_date**          | DATETIME      | not null, default: CURRENT_TIMESTAMP |            |      |
| **due_date**              | DATETIME      | not null                             |            |      |
| **pdf_url**               | TEXT          | not null                             |            |      |
| **sent_via_app**          | TINYINT       | not null, default: 0                 |            |      |
| **app_sent_at**           | DATETIME      | not null                             |            |      |
| **reminders_sent**        | INTEGER       | not null, default: 0                 |            |      |
| **last_reminder_message** | TEXT          | not null                             |            |      |
| **created_at**            | DATETIME      | not null, default: CURRENT_TIMESTAMP |            |      |
| **updated_at**            | DATETIME      | not null, default: CURRENT_TIMESTAMP |            |      | 

#### Enums
##### status

- unpaid
- paid
- cancelled


### invoice_items

| Name            | Type          | Settings                             | References                               | Note |
| --------------- | ------------- | ------------------------------------ | ---------------------------------------- | ---- |
| **id**          | BIGINT        | 🔑 PK, not null, autoincrement       |                                          |      |
| **invoice_id**  | BIGINT        | not null                             | fk_invoice_items_invoice_id_invoices     |      |
| **ride_id**     | BIGINT        | not null                             | fk_invoice_items_ride_id_rides           |      |
| **shift_id**    | BIGINT        | not null                             | fk_invoice_items_shift_id_shift_planning |      |
| **description** | TEXT          | not null                             |                                          |      |
| **quantity**    | INTEGER       | not null, default: 1                 |                                          |      |
| **unit_price**  | DECIMAL(10,2) | not null                             |                                          |      |
| **tax_rate**    | DECIMAL(5,2)  | not null, default: 0.00              |                                          |      |
| **tax_amount**  | DECIMAL(10,2) | not null, default: 0.00              |                                          |      |
| **total_price** | DECIMAL(10,2) | not null                             |                                          |      |
| **created_at**  | DATETIME      | not null, default: CURRENT_TIMESTAMP |                                          |      |
| **updated_at**  | DATETIME      | not null, default: CURRENT_TIMESTAMP |                                          |      | 


### notifications

| Name           | Type         | Settings                             | References                     | Note |
| -------------- | ------------ | ------------------------------------ | ------------------------------ | ---- |
| **id**         | BIGINT       | 🔑 PK, not null, autoincrement       |                                |      |
| **user_id**    | VARCHAR(191) | not null                             | fk_notifications_user_id_users |      |
| **message**    | TEXT         | not null                             |                                |      |
| **is_read**    | TINYINT      | not null, default: 0                 |                                |      |
| **created_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                |      |
| **updated_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                |      | 


### notification_preferences

| Name           | Type         | Settings                             | References                                | Note |
| -------------- | ------------ | ------------------------------------ | ----------------------------------------- | ---- |
| **id**         | BIGINT       | 🔑 PK, not null, autoincrement       |                                           |      |
| **user_id**    | VARCHAR(191) | not null                             | fk_notification_preferences_user_id_users |      |
| **email**      | TINYINT      | not null, default: 1                 |                                           |      |
| **push**       | TINYINT      | not null, default: 1                 |                                           |      |
| **created_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                           |      |
| **updated_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                           |      | 


### activity_logs

| Name           | Type         | Settings                             | References                     | Note |
| -------------- | ------------ | ------------------------------------ | ------------------------------ | ---- |
| **id**         | BIGINT       | 🔑 PK, not null, autoincrement       |                                |      |
| **user_id**    | VARCHAR(191) | not null                             | fk_activity_logs_user_id_users |      |
| **action**     | VARCHAR(255) | not null                             |                                |      |
| **details**    | TEXT         | not null                             |                                |      |
| **created_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |                                |      | 


### session

| Name                | Type         | Settings                             | References               | Note |
| ------------------- | ------------ | ------------------------------------ | ------------------------ | ---- |
| **id**              | VARCHAR(191) | 🔑 PK, not null                      |                          |      |
| **expires_at**      | DATETIME     | not null                             |                          |      |
| **token**           | VARCHAR(255) | not null                             |                          |      |
| **created_at**      | DATETIME     | not null, default: CURRENT_TIMESTAMP |                          |      |
| **updated_at**      | DATETIME     | not null, default: CURRENT_TIMESTAMP |                          |      |
| **ip_address**      | VARCHAR(45)  | not null                             |                          |      |
| **user_agent**      | TEXT         | not null                             |                          |      |
| **user_id**         | VARCHAR(191) | not null                             | fk_session_user_id_users |      |
| **impersonated_by** | VARCHAR(191) | not null                             |                          |      | 


### account

| Name                         | Type         | Settings                             | References               | Note |
| ---------------------------- | ------------ | ------------------------------------ | ------------------------ | ---- |
| **id**                       | VARCHAR(191) | 🔑 PK, not null                      |                          |      |
| **account_id**               | VARCHAR(191) | not null                             |                          |      |
| **provider_id**              | VARCHAR(191) | not null                             |                          |      |
| **user_id**                  | VARCHAR(191) | not null                             | fk_account_user_id_users |      |
| **access_token**             | TEXT         | not null                             |                          |      |
| **refresh_token**            | TEXT         | not null                             |                          |      |
| **id_token**                 | TEXT         | not null                             |                          |      |
| **access_token_expires_at**  | DATETIME     | not null                             |                          |      |
| **refresh_token_expires_at** | DATETIME     | not null                             |                          |      |
| **scope**                    | TEXT         | not null                             |                          |      |
| **password**                 | TEXT         | not null                             |                          |      |
| **created_at**               | DATETIME     | not null, default: CURRENT_TIMESTAMP |                          |      |
| **updated_at**               | DATETIME     | not null, default: CURRENT_TIMESTAMP |                          |      | 


### verification

| Name           | Type         | Settings                             | References | Note |
| -------------- | ------------ | ------------------------------------ | ---------- | ---- |
| **id**         | VARCHAR(191) | 🔑 PK, not null                      |            |      |
| **identifier** | VARCHAR(255) | not null                             |            |      |
| **value**      | VARCHAR(255) | not null                             |            |      |
| **expires_at** | DATETIME     | not null                             |            |      |
| **created_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |            |      |
| **updated_at** | DATETIME     | not null, default: CURRENT_TIMESTAMP |            |      | 


## Relationships

- **drivers to users**: many_to_one
- **projects to productions**: many_to_one
- **rides to drivers**: many_to_one
- **rides to projects**: many_to_one
- **shift_planning to drivers**: many_to_one
- **shift_planning to projects**: many_to_one
- **ride_selected_options to rides**: many_to_one
- **ride_selected_options to ride_options**: many_to_one
- **ride_customers to rides**: many_to_one
- **ride_customers to users**: many_to_one
- **assignment_requests to rides**: many_to_one
- **assignment_requests to drivers**: many_to_one
- **invoice_items to invoices**: many_to_one
- **invoice_items to rides**: many_to_one
- **invoice_items to shift_planning**: many_to_one
- **notifications to users**: many_to_one
- **notification_preferences to users**: many_to_one
- **activity_logs to users**: many_to_one
- **session to users**: many_to_one
- **account to users**: many_to_one

## Database Diagram

```mermaid
erDiagram
	drivers }o--|| users : references
	projects }o--|| productions : references
	rides }o--|| drivers : references
	rides }o--|| projects : references
	shift_planning }o--|| drivers : references
	shift_planning }o--|| projects : references
	ride_selected_options }o--|| rides : references
	ride_selected_options }o--|| ride_options : references
	ride_customers }o--|| rides : references
	ride_customers }o--|| users : references
	assignment_requests }o--|| rides : references
	assignment_requests }o--|| drivers : references
	invoice_items }o--|| invoices : references
	invoice_items }o--|| rides : references
	invoice_items }o--|| shift_planning : references
	notifications }o--|| users : references
	notification_preferences }o--|| users : references
	activity_logs }o--|| users : references
	session }o--|| users : references
	account }o--|| users : references

	users {
		VARCHAR(191) id
		VARCHAR(255) name
		VARCHAR(255) email
		TINYINT email_verified
		TEXT image
		DATETIME created_at
		DATETIME updated_at
		ENUM role
		TINYINT banned
		TEXT ban_reason
		DATETIME ban_expires
		DECIMAL(9,6) latitude
		DECIMAL(9,6) longitude
		DATETIME last_location_update
	}

	productions {
		VARCHAR(191) id
		VARCHAR(255) name
		TEXT address
		VARCHAR(255) contact_name
		VARCHAR(255) contact_email
		VARCHAR(50) contact_phone
		DATETIME created_at
		DATETIME updated_at
	}

	drivers {
		BIGINT id
		VARCHAR(191) user_id
		VARCHAR(100) accounting_code
		VARCHAR(100) vehicle_type
		VARCHAR(50) vehicle_plate
		VARCHAR(100) vehicle_model
		VARCHAR(50) vehicle_color
		TINYINT available
		DATETIME created_at
		DATETIME updated_at
	}

	projects {
		VARCHAR(191) id
		VARCHAR(255) name
		VARCHAR(191) production_id
		TINYINT is_generic
		DATETIME start_date
		DATETIME end_date
		DATETIME created_at
		DATETIME updated_at
	}

	rides {
		BIGINT id
		VARCHAR(255) departure
		VARCHAR(255) destination
		DATETIME departure_time
		DATETIME arrival_time
		DECIMAL(6,2) distance_km
		DECIMAL(10,2) price
		ENUM status
		TEXT photo_url
		DATETIME created_at
		DATETIME updated_at
		BIGINT driver_id
		TEXT customer_notes
		VARCHAR(191) project_id
		INTEGER waiting_time
	}

	shift_planning {
		BIGINT id
		BIGINT driver_id
		DATETIME start_time
		DATETIME end_time
		ENUM status
		VARCHAR(191) project_id
		DATETIME created_at
		DATETIME updated_at
	}

	ride_options {
		BIGINT id
		VARCHAR(255) name
		TEXT description
		DECIMAL(10,2) additional_price
		DATETIME created_at
		DATETIME updated_at
	}

	ride_selected_options {
		BIGINT id
		BIGINT ride_id
		BIGINT option_id
		DECIMAL(10,2) price
		DATETIME created_at
	}

	ride_customers {
		BIGINT id
		BIGINT ride_id
		VARCHAR(191) customer_id
		INTEGER rating
		TEXT comment
		DATETIME created_at
		DATETIME updated_at
	}

	assignment_requests {
		BIGINT id
		BIGINT ride_id
		BIGINT driver_id
		ENUM status
		DATETIME requested_at
		DATETIME updated_at
	}

	invoices {
		BIGINT id
		DECIMAL(10,2) waiting_fee
		DECIMAL(10,2) sub_total
		DECIMAL(10,2) tax
		DECIMAL(10,2) total
		ENUM status
		DATETIME invoice_date
		DATETIME due_date
		TEXT pdf_url
		TINYINT sent_via_app
		DATETIME app_sent_at
		INTEGER reminders_sent
		TEXT last_reminder_message
		DATETIME created_at
		DATETIME updated_at
	}

	invoice_items {
		BIGINT id
		BIGINT invoice_id
		BIGINT ride_id
		BIGINT shift_id
		TEXT description
		INTEGER quantity
		DECIMAL(10,2) unit_price
		DECIMAL(5,2) tax_rate
		DECIMAL(10,2) tax_amount
		DECIMAL(10,2) total_price
		DATETIME created_at
		DATETIME updated_at
	}

	notifications {
		BIGINT id
		VARCHAR(191) user_id
		TEXT message
		TINYINT is_read
		DATETIME created_at
		DATETIME updated_at
	}

	notification_preferences {
		BIGINT id
		VARCHAR(191) user_id
		TINYINT email
		TINYINT push
		DATETIME created_at
		DATETIME updated_at
	}

	activity_logs {
		BIGINT id
		VARCHAR(191) user_id
		VARCHAR(255) action
		TEXT details
		DATETIME created_at
	}

	session {
		VARCHAR(191) id
		DATETIME expires_at
		VARCHAR(255) token
		DATETIME created_at
		DATETIME updated_at
		VARCHAR(45) ip_address
		TEXT user_agent
		VARCHAR(191) user_id
		VARCHAR(191) impersonated_by
	}

	account {
		VARCHAR(191) id
		VARCHAR(191) account_id
		VARCHAR(191) provider_id
		VARCHAR(191) user_id
		TEXT access_token
		TEXT refresh_token
		TEXT id_token
		DATETIME access_token_expires_at
		DATETIME refresh_token_expires_at
		TEXT scope
		TEXT password
		DATETIME created_at
		DATETIME updated_at
	}

	verification {
		VARCHAR(191) id
		VARCHAR(255) identifier
		VARCHAR(255) value
		DATETIME expires_at
		DATETIME created_at
		DATETIME updated_at
	}
```