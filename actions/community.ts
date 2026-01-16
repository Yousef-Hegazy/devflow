"use server";

import { user } from "@/db/auth-schema";
import { db } from "@/db/client";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import handleError from "@/lib/errors";
import { UsersFilterType } from "@/lib/types/filters";
import { asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export type SearchUsersParams = {
    page: number;
    pageSize: number;
    query?: string;
    filter?: UsersFilterType;
};

export async function searchUsers({
    page = 1,
    pageSize = 10,
    query = "",
    filter = "newest"
}: SearchUsersParams) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.USERS_LIST);

    try {
        const skip = (page - 1) * pageSize;

        const whereClause = query
            ? or(
                ilike(user.name, `%${query}%`),
                ilike(user.username, `%${query}%`),
                ilike(user.email, `%${query}%`)
            )
            : undefined;

        let orderBy;
        switch (filter) {
            case "popular":
                orderBy = desc(user.reputation);
                break;
            case "oldest":
                orderBy = asc(user.createdAt);
                break;
            case "newest":
            default:
                orderBy = desc(user.createdAt);
                break;
        }

        const [totalRes, rows] = await Promise.all([
            db.select({ value: count() }).from(user).where(whereClause),
            db.select().from(user)
                .where(whereClause)
                .limit(pageSize)
                .offset(skip)
                .orderBy(orderBy)
        ]);

        return {
            total: totalRes[0].value,
            rows,
        };
    } catch (e) {
        const error = handleError(e);
        return {
            total: 0,
            rows: [],
            error: error.message,
        };
    }
}

export async function getUserDetails(userId: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.USER_DETAILS + userId);

    try {
        const userDetails = await db.query.user.findFirst({
            where: eq(user.id, userId),
        });

        if (!userDetails) {
            throw new Error("User not found");
        }

        return userDetails;
    } catch (err) {
        const error = handleError(err);
        return error;
    }
}
