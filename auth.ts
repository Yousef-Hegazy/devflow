import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { username } from "better-auth/plugins" // Import the plugin
// import { user, session, account, verification } from "./db/auth-schema";

export const auth = betterAuth({
    database: drizzleAdapter(
        db,
        {
            provider: "pg",
            // schema: { user, session, account, verification },
        }
    ),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username()
    ],
    advanced: {
        cookiePrefix: "devflow",
    }
});