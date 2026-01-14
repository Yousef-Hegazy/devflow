import { auth } from "@/auth";
import { User } from "@/db/schema-types";
import { logger } from "@/pino";
import { cacheLife, cacheTag } from "next/cache";
import { cookies, headers } from "next/headers";
import "server-only";
import { DEFAULT_CACHE_DURATION } from "../constants";
import { CACHE_KEYS } from "../constants/cacheKeys";
import { appwriteConfig } from "../constants/server";

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
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            cacheLife({ revalidate: 0 });
            return null;
        }

        return session.user as unknown as User;
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