import { appwriteConfig } from "@/lib/appwrite/config";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { Account, Avatars, Client, Storage, TablesDB } from "node-appwrite";

export type AppwriteSessionMiddlewareContext = {
    Variables: {
        account: Account;
        database: TablesDB;
        storage: Storage;
        avatars: Avatars;
        session: string;
    }
}


export const appwriteSessionMiddleware = createMiddleware<AppwriteSessionMiddlewareContext>(async (c, next) => {
    const session = getCookie(c, appwriteConfig.sessionName);

    if (!session) {
        throw new HTTPException(401, { message: "Unauthorized, no session" });
    }

    const client = new Client()
        .setEndpoint(appwriteConfig.url)
        .setProject(appwriteConfig.projectId)
        .setSession(session);

    c.set("session", session);
    c.set("account", new Account(client));
    c.set("database", new TablesDB(client));
    c.set("storage", new Storage(client));
    c.set("avatars", new Avatars(client));

    await next();
});


export const sessionMiddleware = createMiddleware<{ Variables: { session: string } }>(async (c, next) => {
    const session = getCookie(c, appwriteConfig.sessionName);

    if (!session) {
        throw new HTTPException(401, { message: "Unauthorized, no session" });
    }

    c.set("session", session);


    await next();
});