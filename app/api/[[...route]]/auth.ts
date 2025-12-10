import { appwriteConfig, createAdminClient, createClient } from "@/lib/appwrite/config";
import { AppUser } from "@/lib/appwrite/types/appwrite";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { getAppwriteInitialsAvatarUrl } from "@/lib/helpers/server";
import { SignInSchema, SignUpSchema } from "@/lib/validators/authSchemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { revalidateTag } from "next/cache";
import { ID, OAuthProvider, Permission, Query, Role } from "node-appwrite";
import { appwriteSessionMiddleware, sessionMiddleware } from "./middlewares";

const app = new Hono()
    .post("/register", zValidator("json", SignUpSchema), async (c) => {

        const { email, password, name, username } = c.req.valid("json");

        const { account, database } = await createAdminClient();

        let existingUser: AppUser | null = null;

        const res = await database.listRows<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.or(
                    [
                        Query.equal("email", email),
                        Query.equal("username", username.toLowerCase().replace(/\s+/g, ""))
                    ]
                ),

            ]
        });

        if (res.total > 0) {
            existingUser = res.rows[0];
        }

        if (existingUser) {
            throw new HTTPException(400, { message: "This user already exists" });
        }

        const ac = await account.create({
            userId: ID.unique(),
            email,
            password,
            name,
        });

        if (!ac.$id) {
            throw new HTTPException(500, { message: "Failed to create account" });
        }

        const user = await database.createRow<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            rowId: ac.$id,
            data: {
                name,
                email,
                username: username.toLowerCase().replace(/\s+/g, "") || "",
                image: getAppwriteInitialsAvatarUrl(name, 100, 100),
                provider: "credentials",
                bio: "",
                location: "",
                portfolio: "",
                reputation: 0,
                answers: [],
                questions: [],
                collection: [],
                interaction: [],
                votes: [],
            },
            permissions: [
                Permission.read(Role.user(ac.$id)),
                Permission.update(Role.user(ac.$id)),
            ]
        });

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

        revalidateTag(CACHE_KEYS.CURRENT_USER, { expire: 0 });

        return c.json({ user }, 201);
    })
    .post("/login", zValidator("json", SignInSchema), async (c) => {
        const { email, password } = c.req.valid("json");

        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession({
            email,
            password
        });

        const { database } = await createClient(session.secret!);

        const user = await database.getRow<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            rowId: session.userId,
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
        revalidateTag(CACHE_KEYS.CURRENT_USER, { expire: 0 });


        return c.json({ user }, 200);
    })
    .get("/login/github", async (c) => {
        const { account } = await createAdminClient();

        const redirectUrl = await account.createOAuth2Token({
            provider: OAuthProvider.Github,
            success: "http://localhost:3000/api/auth/oauth-success?provider=github",
            failure: "http://localhost:3000/sign-in",
            scopes: ["read:user", "user:email"]
        });

        return c.redirect(redirectUrl);
    })
    .get("/login/google", async (c) => {
        const { account } = await createAdminClient();

        const redirectUrl = await account.createOAuth2Token({
            provider: OAuthProvider.Google,
            success: "http://localhost:3000/api/auth/oauth-success?provider=google",
            failure: "http://localhost:3000/sign-in",
            scopes: ["openid", "email", "profile"]
        });

        return c.redirect(redirectUrl);
    })
    .get("/oauth-success", async (c) => {
        try {
            const { account, database } = await createAdminClient();

            const { userId, secret, provider } = c.req.query();

            if (!userId || !secret || !provider) {
                throw new HTTPException(400, { message: "Missing userId, secret, or provider" });
            }

            const session = await account.createSession({
                userId,
                secret
            });

            if (!session.secret) {
                throw new HTTPException(500, { message: "Failed to create session" });
            }

            const { account: sessionAccount } = await createClient(session.secret);

            const ac = await sessionAccount.get();

            await sessionAccount.updatePrefs({
                prefs: { "provider": provider },
            });

            try {
                const existing = await database.getRow<AppUser>({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.usersTableId,
                    rowId: ac.$id,
                });

                if (existing.provider !== provider) {
                    await database.updateRow<AppUser>({
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.usersTableId,
                        rowId: ac.$id,
                        data: {
                            provider: provider,
                        },

                    });
                }
            } catch (error) {
                console.log("error fetching user row, creating new one...", error);
                await database.createRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.usersTableId,
                    rowId: ac.$id,
                    data: {
                        name: ac.name,
                        email: ac.email,
                        username: ac.name?.toLowerCase().replace(/\s+/g, "") || "",
                        image: getAppwriteInitialsAvatarUrl(ac.name || "User", 100, 100),
                        provider: provider,
                    },
                    permissions: [
                        Permission.read(Role.user(ac.$id)),
                        Permission.update(Role.user(ac.$id)),
                    ]
                });
            }

            setCookie(c, appwriteConfig.sessionName, session.secret, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                expires: new Date(session.expire),
            });

            revalidateTag(CACHE_KEYS.CURRENT_USER, { expire: 0 });


            return c.redirect("/");
        } catch (error) {
            console.log(error);
            return c.redirect("/sign-in");
        }
    })
    .get("/session", sessionMiddleware, async (c) => {
        const session = c.get("session");
        return c.json({ session });
    })
    .get("/me", appwriteSessionMiddleware, async (c) => {
        const account = c.get("account");
        const database = c.get("database");
        const ac = await account.get();

        const user = await database.getRow<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            rowId: ac.$id,
        });

        return c.json({ user });
    })
    .get("/logout", appwriteSessionMiddleware, async (c) => {
        try {
            const account = c.get("account");

            deleteCookie(c, appwriteConfig.sessionName);

            await account.deleteSession({
                sessionId: "current",
            });
            revalidateTag(CACHE_KEYS.CURRENT_USER, { expire: 0 });


            return c.redirect("/sign-in");
        } catch (error) {
            console.log({ error })
            deleteCookie(c, appwriteConfig.sessionName);
            revalidateTag(CACHE_KEYS.CURRENT_USER, { expire: 0 });


            return c.redirect("/sign-in");
        }
    });

export default app;