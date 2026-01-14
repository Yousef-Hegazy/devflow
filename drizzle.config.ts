import { defineConfig } from "drizzle-kit";
import { env } from "./env";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./db/db-schema.ts", "./db/auth-schema.ts"],
  dbCredentials: {
    url: env.DATABASE_URL,
  }
});
