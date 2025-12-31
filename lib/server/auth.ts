import { logger } from "@/pino";
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import "server-only";
import { createSessionClient } from "../appwrite/config";
import { DEFAULT_CACHE_DURATION } from "../constants";
import { CACHE_KEYS } from "../constants/cacheKeys";
import { appwriteConfig } from "../constants/server";
import { AppUser } from "../types/appwrite";

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(appwriteConfig.sessionName);
    return session?.value || null;
}

export async function getCurrentUser() {
    "use cache: private";

    cacheTag(CACHE_KEYS.CURRENT_USER);
    cacheLife({ revalidate: DEFAULT_CACHE_DURATION });

    try {
        const { account, database } = await createSessionClient();

        const ac = await account.get();

        const user = await database.getRow<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            rowId: ac.$id,
        });

        if (!user.$id) {
            cacheLife({ revalidate: 0 });
            return null;
        }

        return user;

    } catch (e) {
        logger.error({ error: e, message: "Error fetching current user" });
        cacheLife({ revalidate: 0 });

        return null;
    }
};


export async function isAuthenticated() {
    const session = await getSession();
    return !!session;
}