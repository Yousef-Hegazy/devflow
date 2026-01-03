"use server";

import { createAdminClient } from "@/lib/appwrite/config";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import handleError from "@/lib/errors";
import { Collection, Question } from "@/lib/types/appwrite";
import { CollectionFilterType } from "@/lib/types/filters";
import { PaginationParams } from "@/lib/types/pagination";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { ID, Query } from "node-appwrite";

//#region toggleSaveQuestion
export async function toggleSaveQuestion(userId: string, questionId: string) {
    const { database } = await createAdminClient();

    let res = null;

    const existingCollection = await database.listRows<Collection>({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.collectionsTableId,
        queries: [
            Query.equal("author", userId),
            Query.equal("question", questionId),
            Query.limit(1),
        ]
    });

    if (existingCollection.total > 0) {
        await database.deleteRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.collectionsTableId,
            rowId: existingCollection.rows[0].$id,
        });
    } else {
        const collection = await database.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.collectionsTableId,
            rowId: ID.unique(),
            data: {
                author: userId,
                question: questionId,
            }
        });

        res = collection.$id;
    }

    updateTag(CACHE_KEYS.USER_COLLECTIONS + userId);

    return res;
}
//#endregion

//#region isQuestionSavedByUser
export async function isQuestionSavedByUser(userId: string, questionId: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.USER_COLLECTIONS + userId);

    const { database } = await createAdminClient();

    const existingCollection = await database.listRows<Collection>({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.collectionsTableId,
        queries: [
            Query.equal("author", userId),
            Query.equal("question", questionId),
            Query.limit(1),
            Query.select(["$id"]),
        ]
    });

    return existingCollection.total > 0;
}
//#endregion

//#region searchUserCollections
export async function searchUserCollections({ userId, page = 1, pageSize = 10, query = "", filter = "mostrecent" }: { userId: string, } & PaginationParams<CollectionFilterType>) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.USER_COLLECTIONS + userId);

    try {
        const { database } = await createAdminClient();

        const collectionQueries = [
            Query.limit(pageSize),
            Query.offset((page - 1) * pageSize),
            Query.equal("author", userId),
            Query.select(["*"])
        ]

        const questionQueries: string[] = [
            Query.select([
                "*",
                "author.name",
                "author.image",
                "tags.*",
                "tags.tag.title",
                "collection.$id"
            ]),
        ];

        switch (filter) {
            case "mostvoted":
                questionQueries.push(Query.orderDesc("upvotes"));
                break;
            case "mostviewed":
                questionQueries.push(Query.orderDesc("views"));
                break;
            case "mostanswered":
                questionQueries.push(Query.orderDesc("answersCount"));
                break;
            case "oldest":
                collectionQueries.push(Query.orderAsc("$createdAt"));
                break;
            case "mostrecent":
                collectionQueries.push(Query.orderDesc("$createdAt"));
                break;
        }

        if (query) {
            collectionQueries.push(Query.or([
                Query.contains("question.title", query),
                Query.contains("question.content", query),
            ]));
        }

        const collections = await database.listRows<Collection>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.collectionsTableId,
            queries: collectionQueries,
        });

        if (collections.total === 0) {
            return {
                total: 0,
                rows: [],
            };
        }

        const collectionIds = collections.rows.map(c => c.$id);

        questionQueries.push(Query.equal("collection.$id", collectionIds));

        const res = await database.listRows<Question>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.questionsTableId,
            queries: questionQueries,
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
//#endregion
