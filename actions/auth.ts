"use server";

import { createAdminClient, createClient } from "@/lib/appwrite/config";
import { AppUser } from "@/lib/appwrite/types/appwrite";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { getAppwriteInitialsAvatarUrl } from "@/lib/server";
import { SignInSchemaType, SignUpSchemaType } from "@/lib/validators/authSchemas";
import { updateTag } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { ID, OAuthProvider, Permission, Query, Role } from "node-appwrite";
import { deleteCookie, getCookie, setCookie } from "./cookies";
import { appwriteConfig } from "@/lib/constants/server";

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
    const { account } = await createAdminClient();

    const redirectUrl = await account.createOAuth2Token({
        provider: OAuthProvider.Github,
        success: "http://localhost:3000/oauth-success?provider=github",
        failure: "http://localhost:3000/sign-in",
        scopes: ["read:user", "user:email"]
    });

    redirect(redirectUrl);
}

export async function handleOAuthSuccess(userId: string, secret: string, provider: string) {
    let success = false;

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

    } catch {
        success = false;
    }

    if (success) {
        redirect("/", RedirectType.replace);

    } else {
        redirect("/sign-in", RedirectType.replace);
    }

}

export async function signUp(data: SignUpSchemaType) {
    const { email, password, name, username } = data;

    const { account, database } = await createAdminClient();

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

    const ac = await account.create({
        userId: ID.unique(),
        email,
        password,
        name,
    });

    if (!ac.$id) {
        throw new Error("Failed to create account");
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

    return user;
}

export async function signIn(data: SignInSchemaType) {
    const { email, password } = data;

    const { account, database } = await createAdminClient();

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
        console.log(error);
    }

    redirect("/sign-in", RedirectType.replace);
}