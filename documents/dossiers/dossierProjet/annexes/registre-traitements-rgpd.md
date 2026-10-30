# Annexe #11 — Registre des traitements RGPD

> **Version 2 (30/10/2026)** — relu par le juriste de la maison (sources vérifiées à la date du jour, incertitudes déclarées). Les ✅ sont des valeurs validées par le code ou la source ; les 🔶 restent des **propositions** qui attendent le mot du maître ; les ❓ exigent sa décision avant impression.

## Version courte (à coller dans § 5.2 — le guide veut le registre DANS la section)

> AMT Express traite les données de ses trois rôles (administrateurs, chauffeurs, clients) pour : la gestion des comptes et des rôles (T1), la gestion des courses (T2), la gestion des chauffeurs et de leur position (T3), la facturation (T4 — module non livré), les notifications (T5), le journal d'audit technique (T6) et les sessions (T7). Le tout est hébergé chez **Neon (PostgreSQL, AWS)** pour la base et **Vercel** pour l'application — voir « localisation » ci-dessous. Le registre complet est en annexe #11.

## Identification

| Rubrique | Contenu |
| --- | --- |
| Responsable de traitement | Alexis SANTOS (éditeur de la plateforme, pour le compte d'AMT CGS GROUPE) |
| Personnes concernées | Utilisateurs de la plateforme : administrateurs, chauffeurs, clients (assistants) |
| DPO | ❓ Aucun désigné à ce stade — non systématique à cette échelle ; à confirmer avec les consignes de l'école |
| Hébergement | Base : **Neon (groupe Databricks) — infrastructure AWS**, région fixée à la création du projet ✅ · Application : **Vercel** — fonctions par défaut à Washington (iad1) ✅ · **Neon ni Vercel n'offrent de résidence UE persistante** ✅ (voir note du juriste) |
| ❓ Région Neon du projet | À relever par le maître dans la chaîne de connexion (`xxx.aws.neon.tech` — le segment avant `.aws.neon.tech` est la région) : 1 minute dans la console |

## Traitements

| # | Finalité | Données | Base légale | Durée | Destinataires |
| --- | --- | --- | --- | --- | --- |
| T1 | Gestion des comptes et rôles | nom, email, mot de passe haché (Better Auth), rôle, bannissement | exécution du contrat ✅ | vie du compte + 🔶 6 mois d'archivage | aucun tiers |
| T2 | Gestion des courses | trajets, horaires, prix, statuts, notes internes, **note 1–5 + commentaire** (`ride_customers`) | exécution du contrat ✅ | vie du compte + 🔶 archivage 6 mois | aucun tiers |
| T3 | Gestion des chauffeurs | véhicule (plaque, modèle, couleur), code comptable, disponibilité, **position lat/long + horodatage** | exécution du contrat ; position : 🔶 intérêt légitime (nécessaire au service) | vie du profil + 🔶 archivage | aucun tiers |
| T4 | Facturation (module non livré) | montants, taxes, échéances, statut | exécution du contrat / obligation légale ✅ | ✅ **10 ans — art. L123-22 du code de commerce** (documents comptables) | comptable d'AMT ❓ |
| T5 | Notifications applicatives | messages, statut de lecture, préférences email/push | exécution du contrat ✅ | vie du compte | aucun tiers |
| T6 | Journal d'audit (`activity_logs`) | utilisateur, action, détails, horodatage | intérêt légitime (sécurité) ✅ | 🔶 6 mois (valeur des spécifications techniques, cohérente avec les usages « logs ») | aucun tiers |
| T7 | Sessions et sécurité | token, expiration, IP, user-agent | intérêt légitime (sécurité) ✅ | durée de la session ✅ | aucun tiers |

## Droits des personnes et mesures

- **Droits** (accès, rectification, effacement, opposition, portabilité) : traités via l'interface d'administration (consultation, modification, bannissement) — 🔶 procédure écrite d'une demi-page à joindre.
- **Sécurité** (§ 5.2 du dossier) : cookies HTTP-only, mots de passe hachés, HTTPS en production, `verifyRole` sur chaque action, validation Zod, journal d'audit.
- **Minimisation** : aucune donnée de santé, aucun paiement par carte dans la plateforme ; emails temporaires pour l'import CSV (`@customers-temp.com`, `@drivers-temp.com`).
- **Comptes désactivés** : procédure d'archivage définie dans les spécifications — modalités précises ❓ (export puis suppression ? anonymisation ?).

## Note du juriste de la maison (Justin-Solon Santos, 30/10/2026 — sources vérifiées ce jour)

*Voici le texte, sa source, sa date, et l'incertitude qui reste.*

1. **Conservation comptable — correction rendue.** La v1 du registre citait « art. L123-12 CGI » ; c'est inexact. Le fond reste : **les documents comptables et pièces justificatives se conservent dix ans** — **article L123-22 du code de commerce** (Légifrance, version en vigueur, vérifiée le 30/10/2026). Le registre est corrigé en conséquence.
2. **Localisation des données — à dire honnêtement, pas à maquiller.** Neon déploie sur des **régions AWS**, fixées à la création du projet (documentation Neon, « Regions », consultée le 30/10/2026). Vercel exécute par défaut à **Washington, D.C. (iad1)**, ses 20 régions de calcul sont toutes AWS, et il **n'existe pas de résidence UE persistante** sur son architecture (documentation Vercel « Regions » ; analyse ComparEdge 2026). Conséquence de droit : les données personnelles du MVP sont **hors UE** — un transfert au sens du chapitre V du RGPD, à encadrer. Pour un dossier de titre, la bonne posture est la mention explicite de l'hébergement et du mécanisme de safeguard ; le silence est la seule vraie faute.
3. **Ce que je ne sais pas à la date du jour** — l'incertitude déclarée : la participation effective de Neon (Databricks) et de Vercel au **Data Privacy Framework** UE–États-Unis, qui serait le mécanisme d'encadrement naturel du transfert. À vérifier sur la liste officielle du *Data Protection Portal* européen **avant impression du dossier** — la liste bouge, aucune vérification de mémoire ne vaut.
4. **Ce qui reste au maître** : la région Neon réelle (1 minute, voir plus haut), le DPO (consignes de l'école), la modalité d'archivage des comptes, le destinataire comptable. Ce sont des décisions de responsable de traitement — je prépare, je ne décide pas.
