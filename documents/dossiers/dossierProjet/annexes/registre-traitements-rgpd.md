# Annexe #11 — Registre des traitements RGPD (brouillon à valider)

> **Statut** : 🟡 structure conforme, décisions de fond signalées ❓ — c'est **Alexis** (responsable de traitement, en tant qu'indépendant pour le compte d'AMT CGS GROUPE) qui tranche les ❓ avant impression.

## Identification

| Rubrique | Contenu |
| --- | --- |
| Responsable de traitement | Alexis SANTOS (éditeur de la plateforme AMT Express, développée pour AMT CGS GROUPE) |
| Personne concernée | Utilisateurs de la plateforme : administrateurs, chauffeurs, clients/assistants référencés |
| DPO | ❓ à confirmer — pas de DPO désigné à ce stade (obligation non systématique pour un MVP de cette taille ; à vérifier selon les conseils de l'école) |
| Hébergement des données | PostgreSQL géré par **Neon** (société Databricks) · application hébergée par **Vercel ❓** — localisation des datacenters à confirmer et à documenter (dossier § 9.3, question 4) |

## Traitements

| # | Finalité | Données traitées | Base légale | Durée de conservation | Destinataires |
| --- | --- | --- | --- | --- | --- |
| T1 | Gestion des comptes et des rôles (admin / chauffeur / client) | nom, email, mot de passe haché (Better Auth), rôle, statut de bannissement | exécution du contrat (relation utilisateur-plateforme) | durée de vie du compte + ❓ (délai d'archivage des comptes désactivés à trancher) | aucun tiers |
| T2 | Gestion des courses et de l'activité | trajets (départ, destination, horaires), prix, statuts, notes internes, notation client 1–5 + commentaire | exécution du contrat | durée d'activité + ❓ (archivage) | aucun tiers |
| T3 | Gestion des chauffeurs | immatriculation/véhicule, code comptable, disponibilité, position lat/long + horodatage (dernière mise à jour) | exécution du contrat ❓ (la position : intérêt légitime ou consentement à trancher) | durée de vie du profil + ❓ | aucun tiers |
| T4 | Facturation (tables présentes, module non livré — cf. dossier § 3.4) | montants, taxes, échéances, statut de paiement | exécution du contrat / obligation légale (comptabilité : 10 ans, art. L123-12 CGI ❓ à confirmer avec l'école) | 10 ans ❓ | comptable d'AMT ❓ |
| T5 | Notifications applicatives | messages, statut de lecture, préférences email/push | exécution du contrat | durée de vie du compte | aucun tiers |
| T6 | Journal d'audit technique (`activity_logs`) | identifiant utilisateur, action, détails, horodatage | intérêt légitime (sécurité de la plateforme) | 6 mois ❓ (délai repris des spécifications techniques — à confirmer) | aucun tiers |
| T7 | Sessions et sécurité de l'authentification | token de session, expiration, IP, user-agent, impersonation | intérêt légitime (sécurité) | durée de vie de la session | aucun tiers |

## Droits des personnes et mesures

- **Droits** (accès, rectification, effacement, opposition, portabilité) : traités via l'interface d'administration (consultation/modification des comptes, bannissement) — procédure écrite à joindre ❓.
- **Mesures de sécurité** (dossier § 5.2) : cookies HTTP-only, mots de passe hachés (Better Auth), HTTPS en production, rôles vérifiés serveur sur chaque action (`verifyRole`), validation Zod, journal d'audit.
- **Minimisation** : pas de données de santé, pas de paiement par carte dans la plateforme ; emails temporaires générés pour les comptes d'import CSV (`@customers-temp.com`, `@drivers-temp.com`) — à mentionner dans la procédure d'import.
- **Procédure d'archivage des comptes désactivés** : définie dans les spécifications (dossier § 5.2) — modalités précises ❓ à trancher (export puis suppression ? anonymisation ?).
