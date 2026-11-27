# Annexe #16 — Registre des traitements RGPD (version A4, 1 page)

> Registre de l'article 30 RGPD. Version complète (droits des personnes, points de droit, transferts) dans le dépôt.

## Identification

| Rubrique | Contenu |
| --- | --- |
| Responsable de traitement | Alexis SANTOS, éditeur de la plateforme, pour le compte d'AMT CGS GROUPE |
| Personnes concernées | Utilisateurs de la plateforme : administrateurs, chauffeurs, clients (les « responsables » importés partagent le rôle client) |
| DPO | **Pas de DPO désigné** — traitement de petite ampleur, aucune donnée sensible (art. 37 RGPD : désignation non obligatoire à cette échelle) |
| Hébergement | Base de données : **Neon, région AWS eu-west-2 (Londres, Royaume-Uni)** — hors UE, couverte par la décision d'adéquation UE/Royaume-Uni. Application : Vercel, fonctions exécutées par défaut à Washington (iad1, États-Unis) — Data Privacy Framework. Voir la ligne de synthèse ci-dessous |
| Région Neon du projet | **AWS Europe West 2 (eu-west-2), Londres** — relevé sur le dashboard Neon |

## Traitements

| # | Finalité | Données | Base légale | Durée de conservation | Destinataires |
| --- | --- | --- | --- | --- | --- |
| T1 | Gestion des comptes et rôles | nom, email, mot de passe haché (Better Auth), rôle, bannissement | exécution du contrat | durée de vie du compte + archivage 6 mois | aucun tiers |
| T2 | Gestion des courses | trajets, horaires, prix, statuts, notes internes, note 1–5 et commentaire (`ride_customers`) | exécution du contrat | durée de vie du compte + archivage 6 mois | aucun tiers |
| T3 | Gestion des chauffeurs | véhicule (plaque, modèle, couleur), code comptable, disponibilité, position lat/long et horodatage | exécution du contrat ; position : intérêt légitime (nécessaire au service) | durée de vie du profil + archivage | aucun tiers |
| T4 | Facturation (module non livré à ce jour) | montants, taxes, échéances, statut | exécution du contrat ; documents comptables : obligation légale | 10 ans — art. L123-22 du code de commerce | cabinet comptable externe d'AMT CGS GROUPE (identité non divulguée dans ce dossier) |
| T5 | Notifications applicatives | messages, statut de lecture, préférences email/push | exécution du contrat | durée de vie du compte | aucun tiers |
| T6 | Journal d'audit (`activity_logs`) | utilisateur, action, détails, horodatage | intérêt légitime (sécurité) | 6 mois | aucun tiers |
| T7 | Sessions et sécurité | token, expiration, adresse IP, user-agent | intérêt légitime (sécurité) | durée de la session | aucun tiers |

**Décisions arrêtées** : pas de DPO désigné (art. 37 RGPD, désignation non obligatoire à cette échelle) ; base de données hébergée à Londres (Royaume-Uni, décision d'adéquation UE/RU) ; fonctions applicatives exécutées aux États-Unis (Vercel iad1, Data Privacy Framework).

*Transferts hors UE : Royaume-Uni (décision d'adéquation) et États-Unis (Data Privacy Framework) → chapitre V du RGPD ; voir § 6.2 du dossier.*
