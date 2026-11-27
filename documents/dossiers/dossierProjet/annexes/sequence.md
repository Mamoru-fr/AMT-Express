# Annexe #5 — Diagramme de séquence : « demande d'assignation » (version A4, 1 page)

> Parcours réel implémenté, du clic du chauffeur à la validation par l'admin. Transcriptions Mermaid ; le déroulé technique correspondant est en § 7.3 du dossier, et la transaction d'approbation est étudiée en § 11.3.

```mermaid
sequenceDiagram
    participant C as Chauffeur
    participant SA as Server Action
    participant Svc as Service
    participant DB as PostgreSQL
    participant A as Admin

    C->>SA: requestRideAssignment(rideId)
    SA->>SA: verifyRole('driver') · Zod(rideId)
    SA->>Svc: requestRideAssignment(driverId, rideId)
    Svc->>DB: demandes en cours du chauffeur ? course libre ? doublon ?
    alt Refusée (plafond 5 atteint, course assignée ou doublon)
        Svc-->>C: erreur explicite (ActionResponse.error)
    else Autorisée
        Svc->>DB: INSERT assignment_requests (status='pending')
        Svc->>DB: INSERT notifications (admin)
        Svc-->>C: « Demande soumise »
    end
    A->>SA: approveAssignmentRequest(requestId)
    SA->>SA: verifyRole('admin') · Zod(requestId)
    SA->>Svc: approveAssignmentRequest(requestId)
    Svc->>DB: BEGIN TRANSACTION
    Svc->>DB: UPDATE rides (driverId, status='assigned')
    Svc->>DB: UPDATE assignment_requests (approuvée ; concurrentes rejetées)
    Svc->>DB: INSERT activity_logs (ASSIGN_RIDE)
    Svc->>DB: COMMIT
    Svc-->>A: « Course assignée »
    Svc->>DB: INSERT notifications (chauffeur + admin)
```

**Points clés** : rôle vérifié à chaque couche (admin ≥ driver ≥ client) ; validation Zod à l'entrée ; règles métier (plafond de 5 demandes, pas de doublon, course libre) ; transaction atomique d'approbation avec rejet des demandes concurrentes ; traçabilité (`activity_logs`) ; notifications des deux parties.
