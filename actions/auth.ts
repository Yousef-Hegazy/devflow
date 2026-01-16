"use server";

import { auth } from "@/auth";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { updateTag } from "next/cache";
import { headers } from "next/headers";

export async function signOut() {
    await auth.api.signOut({
        headers: await headers(),
    });

    updateTag(CACHE_KEYS.CURRENT_USER);
}