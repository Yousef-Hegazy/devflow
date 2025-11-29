import { appwriteConfig, createAdminClient } from "@/lib/appwrite/config";
import { SignInSchema } from "@/lib/validators/authSchemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { ID } from "node-appwrite";
import { appwriteSessionMiddleware } from "./middlewares";

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
    .post("/logout", appwriteSessionMiddleware, async (c) => {
        const account = c.get("account");

        deleteCookie(c, appwriteConfig.sessionName);

        await account.deleteSession({
            sessionId: "current",
        });
    });

export default app;