# **Docker PostgreSQL: The Complete Interaction Guide**
*For Developers Who Love Clarity and Precision*

---

## **1. Prerequisites**
- Docker installed and running.
- At least one PostgreSQL container (or know how to start one).

---

## **2. Listing Your PostgreSQL Containers**

### **List All Running Containers**
```bash
docker ps
```
- **Tip**: To see **all containers** (including stopped ones), add `-a`:
  ```bash
  docker ps -a
  ```
- **Filter for PostgreSQL only**:
  ```bash
  docker ps -a --filter "name=postgres"
  ```

---

## **3. Accessing the SQL Terminal**

### **Open the SQL Terminal**
```bash
docker exec -it <container_name_or_id> psql -U <username>
```
- Replace `<container_name_or_id>` with your container’s name or ID.
- Replace `<username>` with your PostgreSQL username (default: `postgres`).

**Example:**
```bash
docker exec -it amt-express-db-1 psql -U MYdevUser -d amt_express
```
- **Tip**: If you get `could not connect to server`, ensure your container is running (`docker start <container_name_or_id>`).

---

## **4. Basic Docker Commands for PostgreSQL**

| Task                | Command                                 | Notes                                 |
| ------------------- | --------------------------------------- | ------------------------------------- |
| Start a container   | `docker start <container_name_or_id>`   | Useful if your container is stopped.  |
| Stop a container    | `docker stop <container_name_or_id>`    | Graceful shutdown.                    |
| Restart a container | `docker restart <container_name_or_id>` | Quick reset.                          |
| Remove a container  | `docker rm <container_name_or_id>`      | Add `-f` to force remove if running.  |
| View logs           | `docker logs <container_name_or_id>`    | Add `-f` to follow logs in real-time. |

---

## **5. Inside the SQL Terminal: Essential Commands**

Once you’re in the `psql` terminal, **always end your SQL commands with a semicolon (`;`)**.

### **Navigation and Info**
| Command              | Description                              | Example          |
| -------------------- | ---------------------------------------- | ---------------- |
| `\l`                 | List all databases.                      | `\l`             |
| `\c <database_name>` | Connect to a database.                   | `\c my_database` |
| `\dt`                | List all tables in the current database. | `\dt`            |
| `\du`                | List all users and their roles.          | `\du`            |
| `\q`                 | Quit the SQL terminal.                   | `\q`             |

### **Running Queries**
- **Always end with `;`**:
  ```sql
  SELECT * FROM users;
  ```
- **Check PostgreSQL version**:
  ```sql
  SELECT version();
  ```

### **Common SQL Commands**
| Command           | Example                                                          |
| ----------------- | ---------------------------------------------------------------- |
| Create a database | `CREATE DATABASE my_new_db;`                                     |
| Create a table    | `CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));` |
| Insert data       | `INSERT INTO users (name) VALUES ('Alexis');`                    |
| Select data       | `SELECT * FROM users;`                                           |
| Update data       | `UPDATE users SET name = 'Alex' WHERE id = 1;`                   |
| Delete data       | `DELETE FROM users WHERE id = 1;`                                |

---

## **6. Example Workflow**

1. **List your PostgreSQL containers**:
   ```bash
   docker ps -a --filter "name=postgres"
   ```
   Example output:
   ```
   CONTAINER ID   IMAGE         COMMAND                  CREATED      STATUS      PORTS                    NAMES
   abc12345678    postgres:14   "docker-entrypoint.s…"   2 days ago   Up 2 days   0.0.0.0:5432->5432/tcp   my_postgres_container
   ```

2. **Access the SQL terminal**:
   ```bash
   docker exec -it my_postgres_container psql -U postgres
   ```

3. **Run a query** (note the `;`):
   ```sql
   SELECT * FROM users;
   ```

4. **Exit the terminal**:
   ```sql
   \q
   ```

---

## **7. Pro Tips**

- **Forgot the semicolon?** `psql` will wait for it. Just type `;` and press Enter.
- **Stuck in a query?** Press `Ctrl+C` to cancel.
- **Want to run a query without entering the terminal?**
  ```bash
  docker exec my_postgres_container psql -U postgres -c "SELECT * FROM users;"
  ```

---

## **8. Bonus: Create a PostgreSQL Container**
```bash
docker run --name my_postgres_container -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres:14
```
- Replace `mysecretpassword` and `14` with your password and PostgreSQL version.

---

## **9. Troubleshooting**

| Issue                         | Solution                                         |
| ----------------------------- | ------------------------------------------------ |
| `could not connect to server` | Check if the container is running (`docker ps`). |
| `permission denied for table` | Ensure you’re using the correct user (`\du`).    |
| `syntax error`                | Did you forget the `;` at the end?               |

---

## **10. Cheat Sheet**

| Task                       | Command                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| List PostgreSQL containers | `docker ps -a --filter "name=postgres"`                            |
| Access SQL terminal        | `docker exec -it <container> psql -U <user>`                       |
| Run a query                | `SELECT * FROM users;` (inside `psql`)                             |
| Run a query from outside   | `docker exec <container> psql -U <user> -c "SELECT * FROM users;"` |