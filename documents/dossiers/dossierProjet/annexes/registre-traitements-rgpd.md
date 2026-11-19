# Annexe #16 — Registre des traitements RGPD (version A4, 1 page)

> Registre de l'article 30 RGPD. Version complète (droits des personnes, points de droit, transferts) dans le dépôt.

## Identification

| Rubrique | Contenu |
| --- | --- |
| Responsable de traitement | Alexis SANTOS, éditeur de la plateforme, pour le compte d'AMT CGS GROUPE |
| Personnes concernées | Utilisateurs de la plateforme : administrateurs, chauffeurs, clients (les « responsables » importés partagent le rôle client) |
| DPO | À confirmer selon les consignes de l'école ; la désignation n'est pas systématique à cette échelle |
| Hébergement | Base de données : Neon (PostgreSQL sur infrastructure AWS), région fixée à la création du projet. Application : Vercel, fonctions exécutées par défaut à Washington (iad1). Neon et Vercel ne proposent pas de résidence UE persistante : les données sont hébergées hors UE (voir § 6.2) |
| Région Neon du projet | À relever dans la chaîne de connexion (`xxx.aws.neon.tech`) — à confirmer |

## Traitements

| # | Finalité | Données | Base légale | Durée de conservation | Destinataires |
| --- | --- | --- | --- | --- | --- |
| T1 | Gestion des comptes et rôles | nom, email, mot de passe haché (Better Auth), rôle, bannissement | exécution du contrat | durée de vie du compte + archivage 6 mois | aucun tiers |
| T2 | Gestion des courses | trajets, horaires, prix, statuts, notes internes, note 1–5 et commentaire (`ride_customers`) | exécution du contrat | durée de vie du compte + archivage 6 mois | aucun tiers |
| T3 | Gestion des chauffeurs | véhicule (plaque, modèle, couleur), code comptable, disponibilité, position lat/long et horodatage | exécution du contrat ; position : intérêt légitime (nécessaire au service) | durée de vie du profil + archivage | aucun tiers |
| T4 | Facturation (module non livré à ce jour) | montants, taxes, échéances, statut | exécution du contrat ; documents comptables : obligation légale | 10 ans — art. L123-22 du code de commerce | comptable d'AMT CGS GROUPE (à confirmer) |
| T5 | Notifications applicatives | messages, statut de lecture, préférences email/push | exécution du contrat | durée de vie du compte | aucun tiers |
| T6 | Journal d'audit (`activity_logs`) | utilisateur, action, détails, horodatage | intérêt légitime (sécurité) | 6 mois | aucun tiers |
| T7 | Sessions et sécurité | token, expiration, adresse IP, user-agent | intérêt légitime (sécurité) | durée de la session | aucun tiers |

**À confirmer avant dépôt** : désignation (ou non) d'un DPO selon les consignes de l'école ; région exacte du projet Neon (chaîne `xxx.aws.neon.tech`).

*Transferts hors UE : Vercel (iad1) et Neon (AWS) → chapitre V du RGPD, garanties Data Privacy Framework ; voir § 6.2 du dossier.*
