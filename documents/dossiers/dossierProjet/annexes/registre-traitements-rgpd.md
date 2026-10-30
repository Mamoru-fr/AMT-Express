# Annexe #11 — Registre des traitements RGPD

> Registre établi conformément à l'article 30 du RGPD. Les rubriques marquées « à confirmer » dépendent de décisions du responsable de traitement et seront complétées avant le dépôt du dossier.

## Version courte (à reprendre dans le § 5.2 du dossier)

> AMT Express traite les données de ses utilisateurs (administrateurs, chauffeurs, clients) pour la gestion des comptes et des rôles (T1), la gestion des courses (T2), la gestion des chauffeurs et de leur position (T3), la facturation (T4 — module non livré à ce jour), les notifications applicatives (T5), le journal d'audit technique (T6) et les sessions (T7). L'application est hébergée par Vercel et la base de données par Neon (PostgreSQL sur infrastructure AWS) ; l'hébergement se situe hors Union européenne et le transfert correspondant relève du chapitre V du RGPD (voir § 5). Le registre complet figure en annexe #11.

## 1. Identification

| Rubrique | Contenu |
| --- | --- |
| Responsable de traitement | Alexis SANTOS, éditeur de la plateforme, pour le compte d'AMT CGS GROUPE |
| Personnes concernées | Utilisateurs de la plateforme : administrateurs, chauffeurs, clients (les « responsables » importés partagent le rôle client) |
| DPO | À confirmer selon les consignes de l'école ; la désignation n'est pas systématique à cette échelle |
| Hébergement | Base de données : Neon (PostgreSQL sur infrastructure AWS), région fixée à la création du projet. Application : Vercel, fonctions exécutées par défaut à Washington (iad1). Neon et Vercel ne proposent pas de résidence UE persistante : les données sont hébergées hors UE (voir § 5) |
| Région Neon du projet | À relever dans la chaîne de connexion (`xxx.aws.neon.tech`) — à confirmer |

## 2. Traitements

| # | Finalité | Données | Base légale | Durée de conservation | Destinataires |
| --- | --- | --- | --- | --- | --- |
| T1 | Gestion des comptes et rôles | nom, email, mot de passe haché (Better Auth), rôle, bannissement | exécution du contrat | durée de vie du compte + archivage 6 mois | aucun tiers |
| T2 | Gestion des courses | trajets, horaires, prix, statuts, notes internes, note 1–5 et commentaire (`ride_customers`) | exécution du contrat | durée de vie du compte + archivage 6 mois | aucun tiers |
| T3 | Gestion des chauffeurs | véhicule (plaque, modèle, couleur), code comptable, disponibilité, position lat/long et horodatage | exécution du contrat ; position : intérêt légitime (nécessaire au service) | durée de vie du profil + archivage | aucun tiers |
| T4 | Facturation (module non livré à ce jour) | montants, taxes, échéances, statut | exécution du contrat ; documents comptables : obligation légale | 10 ans — art. L123-22 du code de commerce | comptable d'AMT CGS GROUPE (à confirmer) |
| T5 | Notifications applicatives | messages, statut de lecture, préférences email/push | exécution du contrat | durée de vie du compte | aucun tiers |
| T6 | Journal d'audit (`activity_logs`) | utilisateur, action, détails, horodatage | intérêt légitime (sécurité) | 6 mois | aucun tiers |
| T7 | Sessions et sécurité | token, expiration, adresse IP, user-agent | intérêt légitime (sécurité) | durée de la session | aucun tiers |

## 3. Droits des personnes et mesures

- **Droits** (accès, rectification, effacement, opposition, portabilité) : traités via l'interface d'administration (consultation, modification, bannissement) ; une procédure écrite d'une demi-page sera jointe au dossier.
- **Sécurité** (§ 5.2 du dossier) : cookies HTTP-only, mots de passe hachés, HTTPS en production, contrôle de rôle (`verifyRole`) sur chaque action serveur, validation Zod des entrées, journal d'audit.
- **Minimisation** : aucune donnée de santé, aucun paiement par carte dans la plateforme ; l'import CSV crée les comptes avec des emails temporaires (`@customers-temp.com`, `@drivers-temp.com`, `@managers-temp.com`), sans collecter d'adresse réelle à l'import.
- **Comptes désactivés** : procédure d'archivage définie dans les spécifications ; modalités précises à confirmer (export puis suppression, ou anonymisation).

## 4. Points de droit applicables

1. **Conservation comptable** : les documents comptables et leurs pièces justificatives se conservent dix ans — article L123-22 du code de commerce.
2. **Hébergement hors UE** : Neon déploie sur des régions AWS fixées à la création du projet ; Vercel exécute par défaut à Washington (iad1) et ne propose pas de résidence UE persistante. Les données personnelles du MVP sont donc hébergées hors UE : un transfert au sens du chapitre V du RGPD, à encadrer.

## 5. Localisation et transferts hors UE

Les données personnelles sont hébergées hors de l'Union européenne (Neon / infrastructure AWS pour la base de données ; Vercel / États-Unis pour l'application). Ce transfert relève du chapitre V du RGPD et doit être encadré par un mécanisme reconnu — clauses contractuelles types ou Data Privacy Framework UE–États-Unis. La participation effective de Neon et de Vercel au Data Privacy Framework sera vérifiée sur la liste officielle du Data Protection Portal européen avant le dépôt du dossier.

## 6. Points restant à confirmer avant dépôt

- Région Neon du projet (chaîne de connexion) ;
- Désignation ou non d'un DPO (consignes de l'école) ;
- Modalités d'archivage des comptes désactivés ;
- Destinataire comptable du traitement T4 ;
- Participation de Neon et de Vercel au Data Privacy Framework (§ 5).
