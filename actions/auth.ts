"use server";

import { createAdminClient, createClient } from "@/lib/appwrite/config";
import { AppUser } from "@/lib/appwrite/types";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { getAppwriteInitialsAvatarUrl } from "@/lib/server";
import { SignInSchemaType, SignUpSchemaType } from "@/lib/validators/authSchemas";
import { logger } from "@/pino";
import { updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { Account, AppwriteException, ID, OAuthProvider, Permission, Query, Role, TablesDB } from "node-appwrite";
import { deleteCookie, getCookie, setCookie } from "./cookies";

export async function loginWithGoogle() {
    const { account } = await createAdminClient();

    const redirectUrl = await account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success: "http://localhost:3000/oauth-success?provider=google",
        failure: "http://localhost:3000/sign-in",
        scopes: ["openid", "email", "profile"]
    });

    redirect(redirectUrl);
}

export async function loginWithGithub() {
    let redirectUrl = "";
    try {
        const { account } = await createAdminClient();

        redirectUrl = await account.createOAuth2Token({
            provider: OAuthProvider.Github,
            success: "http://localhost:3000/oauth-success?provider=github",
            failure: "http://localhost:3000/sign-in",
            scopes: ["read:user", "user:email"]
        });

        logger.info({ redirectUrl })
    } catch (error) {
        redirectUrl = "http://localhost:3000/sign-in";
        logger.error({ error });
    }

    redirect(redirectUrl);
}

export async function handleOAuthSuccess(userId: string, secret: string, provider: string) {
    let success = false;

    logger.info({ userId, secret, provider });
    if (!userId || !secret || !provider) {
        redirect("/sign-in", RedirectType.replace);
    }

    try {
        const { account, database } = await createAdminClient();

        const session = await account.createSession({
            userId,
            secret
        });

        if (!session.secret) {
            throw new Error("Failed to create session");
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
            logger.error({ error, message: "error fetching user row, creating new one..." });
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

        await setCookie({
            name: appwriteConfig.sessionName,
            value: session.secret,
            httpOnly: true,
            sameSite: "strict",
            // secure: process.env.NODE_ENV === "production",
            secure: true,
            path: "/",
            expires: new Date(session.expire),
        });
        updateTag(CACHE_KEYS.CURRENT_USER);
        success = true;

    } catch (error) {
        logger.error({ error, message: (error as Error).cause });
        success = false;
    }

    if (success) {
        redirect("/", RedirectType.replace);

    } else {
        redirect("/sign-in", RedirectType.replace);
    }

}

export async function throwIfUserExists(database: TablesDB, email: string, username: string) {
    const res = await database.listRows<AppUser>({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.usersTableId,
        queries: [
            Query.or([
                Query.equal("email", email),
                Query.equal("username", username.toLowerCase().replace(/\s+/g, ""))
            ])
        ]
    });

    if (res.total > 0) {
        throw new Error("This user already exists");
    }

}

export async function createUser(database: TablesDB, data: SignUpSchemaType, id: string) {
    const { email, username, name } = data;



    const user = await database.createRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.usersTableId,
        rowId: id,
        data: {
            name,
            email,
            username: username.toLowerCase().replace(/\s+/g, "") || "",
            image: getAppwriteInitialsAvatarUrl(name, 100, 100),
            provider: "credentials",
        },
        permissions: [
            Permission.read(Role.user(id)),
            Permission.update(Role.user(id)),
        ]
    });

    return user as unknown as AppUser;
}

export async function createSessionAndUpdateUser(account: Account, email: string, password: string) {

    const session = await account.createEmailPasswordSession({
        email,
        password
    });

    if (!session.secret) {
        throw new Error("Failed to create session");
    }

    await setCookie({
        name: appwriteConfig.sessionName,
        value: session.secret,
        httpOnly: true,
        sameSite: "strict",
        // secure: process.env.NODE_ENV === "production",
        secure: true,
        path: "/",
        expires: new Date(session.expire),
    });

    updateTag(CACHE_KEYS.CURRENT_USER);
}

export async function signUp(data: SignUpSchemaType) {
    const { account, database } = await createAdminClient();

    await throwIfUserExists(database, data.email, data.username);

    const { email, password, name, username } = data;

    const res = await database.listRows<AppUser>({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.usersTableId,
        queries: [
            Query.or([
                Query.equal("email", email),
                Query.equal("username", username.toLowerCase().replace(/\s+/g, ""))
            ])
        ]
    });

    if (res.total > 0) {
        throw new Error("This user already exists");
    }

    let userId = ID.unique();

    try {
        const ac = await account.create({
            userId,
            email,
            password,
            name,
        });

        userId = ac.$id;

        const user = await createUser(database, data, userId);

        await createSessionAndUpdateUser(account, email, password);

        return user;
    } catch (error) {
        if (error instanceof AppwriteException && error.code === 409) {
            const session = await account.createEmailPasswordSession({
                email,
                password
            });
            const { account: tempAcc } = await createClient(session.secret);
            const acc = await tempAcc.get();
            const user = await createUser(database, {
                email: acc.email,
                name: acc.name,
                username: username,
                password: password
            }, acc.$id);
            await setCookie({
                name: appwriteConfig.sessionName,
                value: session.secret,
                httpOnly: true,
                sameSite: "strict",
                // secure: process.env.NODE_ENV === "production",
                secure: true,
                path: "/",
                expires: new Date(session.expire),
            });

            updateTag(CACHE_KEYS.CURRENT_USER);
            return user;
        } else {
            throw error;
        }
    }
}


export async function signIn(data: SignInSchemaType) {
    const { email, password } = data;

    const { account, database } = await createAdminClient();


    const users = await database.listRows<AppUser>({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.usersTableId,
        queries: [
            Query.equal("email", email),
        ]
    });

    if (users.rows.length === 0) {
        throw new Error("Invalid Credentials");
    }

    const user = users.rows[0];

    if (user.provider !== "credentials") {
        await database.updateRow<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            rowId: user.$id,
            data: {
                provider: "credentials",
            },
        });
    }


    const session = await account.createEmailPasswordSession({
        email,
        password,
    });

    if (!session.secret) {
        throw new Error("Failed to create session");
    }

    await setCookie({
        name: appwriteConfig.sessionName,
        value: session.secret,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(session.expire),
    });

    updateTag(CACHE_KEYS.CURRENT_USER);

    return user;
}

export async function logout() {
    const sessionSecret = await getCookie(appwriteConfig.sessionName);

    if (!sessionSecret) {
        redirect("/sign-in", RedirectType.replace);
    }

    try {
        const { account } = await createClient(sessionSecret);
        await account.deleteSession({
            sessionId: "current",
        });
        await deleteCookie(appwriteConfig.sessionName);
        updateTag(CACHE_KEYS.CURRENT_USER);

    } catch (error) {
        await deleteCookie(appwriteConfig.sessionName);
        logger.error({ error, message: "Error during logout" });
    }

    redirect("/sign-in", RedirectType.replace);
}