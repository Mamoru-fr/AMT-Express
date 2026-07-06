import * as dotenv from "dotenv";
import * as schema from "@/lib/db/schema";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

const dbDriver = process.env.DB_DRIVER ?? (connectionString.includes("neon.tech") ? "neon-http" : "postgres-js");

const db = dbDriver === "neon-http"
    ? drizzleNeon(neon(connectionString), { schema })
    : drizzlePostgres(postgres(connectionString, {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
    }), { schema });

export default db;