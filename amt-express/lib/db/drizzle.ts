import {drizzle} from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless"; 
import * as dotenv from "dotenv"; 
import * as schema from "@/lib/db/schema";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

console.log('✅ Database connection initialized');

export default db;