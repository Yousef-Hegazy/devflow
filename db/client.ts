import { env } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./auth-schema";
import * as dbSchema from "./db-schema";

export const postgresPool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(postgresPool, { schema: { ...authSchema, ...dbSchema } });