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
    }
}


export const sessionMiddleware = createMiddleware<AppwriteSessionMiddlewareContext>(async (c, next) => {
    const session = getCookie(c, appwriteConfig.sessionName);

    if (!session) {
        throw new HTTPException(401, { message: "Unauthorized, no session" });
    }
    
    const client = new Client()
        .setEndpoint(appwriteConfig.url)
        .setProject(appwriteConfig.projectId)
        .setSession(session);

    c.set("account", new Account(client));
    c.set("database", new TablesDB(client));
    c.set("storage", new Storage(client));
    c.set("avatars", new Avatars(client));

    await next();
})