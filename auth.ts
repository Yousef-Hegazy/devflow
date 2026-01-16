import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins"; // Import the plugin
import { db } from "./db/client";
import { env } from "./env";
// import { user, session, account, verification } from "./db/auth-schema";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(
        db,
        {
            provider: "pg",
            // schema: { user, session, account, verification },
        }
    ),
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
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