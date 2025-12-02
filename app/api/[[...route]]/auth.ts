import { appwriteConfig, createAdminClient, createClient } from "@/lib/appwrite/config";
import { getAppwriteInitialsAvatarUrl } from "@/lib/helpers/server";
import { SignInSchema } from "@/lib/validators/authSchemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { ID, OAuthProvider } from "node-appwrite";
import { appwriteSessionMiddleware, sessionMiddleware } from "./middlewares";

const app = new Hono()
    .get("/register", zValidator("json", SignInSchema), async (c) => {

        const { email, password } = c.req.valid("json");

        const { account } = await createAdminClient();

        const ac = await account.create({
            userId: ID.unique(),
            email,
            password,
        });

        if (!ac.$id) {
            throw new HTTPException(500, { message: "Failed to create account" });
        }

        const session = await account.createEmailPasswordSession({
            email,
            password
        });

        if (!session.secret) {
            throw new HTTPException(500, { message: "Failed to create session" });
        }

        setCookie(c, appwriteConfig.sessionName, session.secret, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: new Date(session.expire),
        });

        return c.json({ account: { email } }, 201);
    })
    .post("/login", zValidator("json", SignInSchema), async (c) => {
        const { email, password } = c.req.valid("json");

        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession({
            email,
            password
        });

        if (!session.secret) {
            throw new HTTPException(500, { message: "Failed to create session" });
        }

        setCookie(c, appwriteConfig.sessionName, session.secret, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: new Date(session.expire),
        });

        return c.json({ account: { email } }, 201);
    })
    .get("/login/github", async (c) => {
        const { account } = await createAdminClient();

        const redirectUrl = await account.createOAuth2Token({
            provider: OAuthProvider.Github,
            success: "http://localhost:3000/api/auth/oauth-success",
            failure: "http://localhost:3000/sign-in",
            scopes: ["read:user", "user:email"]
        });

        return c.redirect(redirectUrl);
    })
    .get("/login/google", async (c) => {
        const { account } = await createAdminClient();

        const redirectUrl = await account.createOAuth2Token({
            provider: OAuthProvider.Google,
            success: "http://localhost:3000/api/auth/oauth-success",
            failure: "http://localhost:3000/sign-in",
            scopes: ["openid", "email", "profile"]
        });

        return c.redirect(redirectUrl);
    })
    .get("/oauth-success", async (c) => {
        const { account } = await createAdminClient();

        const { userId, secret } = c.req.query();

        if (!userId || !secret) {
            throw new HTTPException(400, { message: "Missing userId or secret" });
        }


        const session = await account.createSession({
            userId,
            secret
        });

        if (!session.secret) {
            throw new HTTPException(500, { message: "Failed to create session" });
        }

        const { account: sessionAccount } = await createClient(session.secret);

        const user = await sessionAccount.get();

        await sessionAccount.updatePrefs({
            prefs: { "image": await getAppwriteInitialsAvatarUrl(user.name, 100, 100) },
        });

        setCookie(c, appwriteConfig.sessionName, session.secret, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: new Date(session.expire),
        });

        return c.redirect("/");
    })
    .get("/session", sessionMiddleware, async (c) => {
        const session = c.get("session");
        return c.json({ session });
    })
    .get("/me", appwriteSessionMiddleware, async (c) => {
        const account = c.get("account");
        const user = await account.get();
        delete user.password;
        return c.json({ user });
    })
    .get("/logout", appwriteSessionMiddleware, async (c) => {
        const account = c.get("account");

        deleteCookie(c, appwriteConfig.sessionName);

        await account.deleteSession({
            sessionId: "current",
        });

        return c.redirect("/sign-in");
    });

export default app;