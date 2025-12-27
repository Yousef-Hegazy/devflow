"use server";

import { createAdminClient } from "@/lib/appwrite/config";
import { AppUser } from "@/lib/appwrite/types";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import handleError from "@/lib/errors";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";

export type SearchUsersParams = {
    page: number;
    pageSize: number;
    query?: string;
    filter?: "all" | "popular" | "newest";
};

export async function searchUsers({
    page = 1,
    pageSize = 10,
    query = "",
    filter = "all"
}: SearchUsersParams) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(
        CACHE_KEYS.USERS_LIST,
        String(page),
        String(pageSize),
        query,
        filter,
    );

    try {
        const { database } = await createAdminClient();

        const queries = [
            Query.limit(pageSize),
            Query.offset((page - 1) * pageSize),
            Query.select(["*"]),
        ];

        switch (filter) {
            case "popular":
                queries.push(Query.orderDesc("reputation"));
                break;
            case "newest":
            case "all":
            default:
                queries.push(Query.orderDesc("$createdAt"));
                break;
        }

        if (query) {
            queries.push(
                Query.or([
                    Query.contains("name", query),
                    Query.contains("username", query),
                    Query.contains("email", query),
                ])
            );
        }

        const res = await database.listRows<AppUser>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries,
        });

        return res;
    } catch (e) {
        const error = handleError(e);
        return {
            total: 0,
            rows: [],
            error: error.message,
        };
    }
}