"use server";

import { createAdminClient } from "@/lib/appwrite/config";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import handleError from "@/lib/errors";
import { Tag } from "@/lib/types/appwrite";
import { TagsFilterType } from "@/lib/types/filters";
import {
    PaginationParams
} from "@/lib/types/pagination";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";

export async function searchTags({
    page = 1,
    pageSize = 10,
    query = "",
    filter = "popular",
}: PaginationParams<TagsFilterType>) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.TAGS_LIST,);

    try {
        const { database } = await createAdminClient();

        const queries = [
            Query.limit(pageSize),
            Query.offset((page - 1) * pageSize),
            Query.orderDesc("questionsCount"),
        ];

        if (query) {
            queries.push(Query.contains("title", query));
        }

        switch (filter) {
            case "name":
                queries.push(Query.orderAsc("title"));
                break;
            case "popular":
                queries.push(Query.orderDesc("questionsCount"));
                break;
            case "oldest":
                queries.push(Query.orderAsc("$createdAt"));
                break;
            case "recent":
            default:
                queries.push(Query.orderDesc("$createdAt"));
                break;
        }

        const res = await database.listRows<Tag>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tagsTableId,
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
};


export async function getPopularTags() {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.TAGS_LIST);

    try {
        const { database } = await createAdminClient();

        const queries = [
            Query.limit(5),
            Query.orderDesc("questionsCount"),
        ];

        const res = await database.listRows<Tag>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tagsTableId,
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