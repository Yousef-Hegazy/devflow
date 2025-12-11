import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import "server-only";
import { appwriteConfig, createSessionClient } from "../appwrite/config";
import { AppUser } from "../appwrite/types/appwrite";
import { CACHE_KEYS } from "../constants/cacheKeys";

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(appwriteConfig.sessionName);
    return session?.value || null;
}

export const getCurrentUser = async () => {
    "use cache: private";

    cacheTag(CACHE_KEYS.CURRENT_USER);
    cacheLife({ revalidate: 300 /* 5 minutes */ });

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

    } catch {
        cacheLife({ revalidate: 0 });

        return null;
    }
};


export async function isAuthenticated() {
    "use cache: private";

    cacheLife({
        revalidate: 300
    });

    cacheTag(CACHE_KEYS.CURRENT_USER, "auth-check");

    const session = await getSession();
    return !!session;
}