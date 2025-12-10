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

    cacheLife({ revalidate: 300 /* 5 minutes */ });
    cacheTag(CACHE_KEYS.CURRENT_USER);

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

export function getAppwriteInitialsAvatarUrl(name: string, width?: number, height?: number) {
    const url = `${appwriteConfig.url}/avatars/initials`;

    const sp = new URLSearchParams();

    sp.append("name", name);

    if (width) sp.append("width", width.toString());
    if (height) sp.append("height", height.toString());

    sp.append("project", appwriteConfig.projectId);

    return `${url}?${sp.toString()}`;
}