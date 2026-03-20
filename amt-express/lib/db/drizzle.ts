/**
 * Double Database Connection Setup for Drizzle ORM
 * This file sets up the database connection for both local development (using postgres-js) and Neon serverless (using neon-http).
 * The local development setup is commented out, and the Neon serverless setup is active. 
 * You can switch between them by commenting/uncommenting the relevant sections.
 * Make sure to set the DATABASE_URL environment variable in your .env file for the active setup.
 */


/*
    ! Neon Serverless Setup:
*/

// // import for all setup and configuration related to Drizzle ORM and database connection
// import * as dotenv from "dotenv";
// import * as schema from "@/lib/db/schema";
// import { drizzle } from "drizzle-orm/neon-http";
// import {neon} from "@neondatabase/serverless";

// dotenv.config();

// const sql = neon(process.env.DATABASE_URL!);

// const db = drizzle(sql, { schema });

/*
    ! Local Development Setup
*/ 


import * as dotenv from "dotenv";
import * as schema from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

// Lazy connection - only connect when actually querying
const sql = postgres(connectionString, {
    max: 1, // Limit connections during build
    idle_timeout: 20,
    connect_timeout: 10,
});

const db = drizzle(sql, {schema});


console.log('✅ Database connection initialized');

export default db;