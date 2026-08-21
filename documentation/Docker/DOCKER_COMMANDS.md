# Docker — Guide PostgreSQL AMT Express

> Commandes essentielles pour gérer la base de données PostgreSQL dans Docker.

---

## Demarrage rapide

```bash
# Depuis amt-express/
docker compose up -d --build    # Démarrer (build inclus)
docker compose logs -f app      # Suivre les logs de l'app
docker compose logs -f db       # Suivre les logs PostgreSQL
docker compose down             # Arrêter et supprimer les conteneurs
docker compose down -v          # Arrêter + supprimer les volumes (reset DB)
```

---

## Conteneurs

```bash
docker ps                                  # Conteneurs en cours d'exécution
docker ps -a                               # Tous les conteneurs (y compris arrêtés)
docker ps -a --filter "name=amt"           # Filtrer par nom

docker start <nom_ou_id>
docker stop <nom_ou_id>
docker restart <nom_ou_id>
docker logs <nom_ou_id>                    # Logs
docker logs -f <nom_ou_id>                 # Logs en temps réel
```

---

## Acceder a PostgreSQL

### Via psql dans le conteneur

```bash
docker exec -it amt-express-db-1 psql -U amt_user -d amt_express
```

> Si le nom du conteneur est différent, vérifier avec `docker ps`.

### Exécuter une requête sans entrer dans le terminal

```bash
docker exec amt-express-db-1 psql -U amt_user -d amt_express -c "SELECT COUNT(*) FROM rides;"
```

---

## Commandes psql

Une fois connecté au terminal `psql` :

| Commande | Description |
|----------|-------------|
| `\l` | Lister les bases de données |
| `\c <nom_db>` | Se connecter à une base |
| `\dt` | Lister les tables |
| `\du` | Lister les utilisateurs et leurs rôles |
| `\d <table>` | Décrire la structure d'une table |
| `\q` | Quitter |

> Toutes les requêtes SQL doivent se terminer par `;`.

### Exemples utiles

```sql
-- Compter les courses par statut
SELECT status, COUNT(*) FROM rides GROUP BY status;

-- Lister les utilisateurs
SELECT id, name, email, role FROM users;

-- Vérifier les sessions actives
SELECT id, user_id, expires_at FROM session WHERE expires_at > NOW();
```

---

## Backup et restauration

### Backup manuel

```bash
# Via le script du projet
cd amt-express && pnpm db:backup

# Via pg_dump dans le conteneur
docker exec amt-express-db-1 pg_dump -U amt_user amt_express > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
docker exec -i amt-express-db-1 psql -U amt_user -d amt_express < backup_20260101.sql
```

---

## Depannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| `could not connect to server` | Conteneur arrêté | `docker start amt-express-db-1` |
| `permission denied for table` | Mauvais utilisateur | Utiliser `-U amt_user` |
| `FATAL: database does not exist` | DB non créée | `docker compose up -d --build` |
| `env_file not found` | `.env.example` absent | Créer le fichier (voir README) |
| Port 5432 déjà utilisé | PostgreSQL local actif | `brew services stop postgresql` ou changer le port dans `docker-compose.yml` |

---

## Créer un conteneur PostgreSQL standalone

```bash
docker run \
  --name amt-postgres \
  -e POSTGRES_DB=amt_express \
  -e POSTGRES_USER=amt_user \
  -e POSTGRES_PASSWORD=amt_password \
  -p 5432:5432 \
  -d \
  postgres:16-alpine
```

Puis connecter avec :
```
DATABASE_URL="postgresql://amt_user:amt_password@localhost:5432/amt_express?sslmode=disable"
```
