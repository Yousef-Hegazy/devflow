"use server";

import { user } from "@/db/auth-schema";
import { db } from "@/db/client";
import { answer, collection, question, questionTag, tag, vote } from "@/db/db-schema";
import { Tag } from "@/db/schema-types";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import handleError from "@/lib/errors";
import { CollectionFilterType } from "@/lib/types/filters";
import { PaginationParams } from "@/lib/types/pagination";
import { and, asc, desc, eq, sql, SQL } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";

//#region toggleSaveQuestion
export async function toggleSaveQuestion(userId: string, questionId: string) {
    try {
        const id = await db.transaction(async (tx) => {
            const existing = await tx
                .select({ id: collection.id })
                .from(collection)
                .where(and(eq(collection.authorId, userId), eq(collection.questionId, questionId)))
                .limit(1);

            if (existing.length > 0) {
                await tx.delete(collection).where(eq(collection.id, existing[0].id));
                return null;
            }

            const [inserted] = await tx
                .insert(collection)
                .values({ authorId: userId, questionId })
                .returning({ id: collection.id });

            return inserted.id;
        });

        updateTag(CACHE_KEYS.USER_COLLECTIONS + userId);

        return id;
    } catch (e) {
        const error = handleError(e);
        throw error;
    }
}
//#endregion

//#region isQuestionSavedByUser
export async function isQuestionSavedByUser(userId: string, questionId: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.USER_COLLECTIONS + userId);

    try {
        const rows = await db
            .select({ id: collection.id })
            .from(collection)
            .where(and(eq(collection.authorId, userId), eq(collection.questionId, questionId)))
            .limit(1);

        return rows.length > 0;
    } catch (e) {
        const error = handleError(e);
        throw error;
    }
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
        // Build where clauses
        const whereClauses: SQL[] = [eq(collection.authorId, userId)];

        if (query) {
            const qLike = `%${query}%`;
            whereClauses.push(sql`(${question.title} ILIKE ${qLike} OR ${question.content} ILIKE ${qLike})`);
        }

        // Count total matching saved questions
        const totalRes = await db.select({ count: sql`count(*)` })
            .from(collection)
            .leftJoin(question, eq(collection.questionId, question.id))
            .where(and(...whereClauses));

        const total = Number(totalRes?.[0]?.count ?? 0);

        if (total === 0) {
            return { total: 0, rows: [] };
        }

        // Build ordering
        const upvotesExpr = sql`SUM(CASE WHEN ${vote.type} = 'upvote' THEN 1 ELSE 0 END)`;
        const answersCountExpr = sql`COUNT(${answer.id})`;

        let orderBy = [desc(collection.createdAt)];
        switch (filter) {
            case "mostvoted":
                orderBy = [desc(upvotesExpr)];
                break;
            case "mostviewed":
                orderBy = [desc(question.views)];
                break;
            case "mostanswered":
                orderBy = [desc(answersCountExpr)];
                break;
            case "oldest":
                orderBy = [asc(collection.createdAt)];
                break;
            case "mostrecent":
            default:
                orderBy = [desc(collection.createdAt)];
                break;
        }

        // Fetch rows: question + author + aggregates + tags (via subselect)
        const rows = await db.select({
            collectionId: collection.id,
            createdAt: question.createdAt,
            id: question.id,
            title: question.title,
            // content: question.content,
            views: question.views,
            upvotes: upvotesExpr,
            answersCount: answersCountExpr,
            questionCreatedAt: question.createdAt,
            author: {
                id: sql`(${user.id})`,
                name: sql`(${user.name})`,
                image: sql`(${user.image})`,
            },
            tags: sql<Tag[]>`
                  COALESCE(
                    json_agg(
                      DISTINCT jsonb_build_object(
                        'id', ${tag.id},
                        'title', ${tag.title},
                        'createdAt', ${tag.createdAt}
                      )
                    ) FILTER (WHERE ${tag.id} IS NOT NULL),
                    '[]'
                  )
                `,
        })
            .from(collection)
            .leftJoin(question, eq(collection.questionId, question.id))
            .leftJoin(user, eq(question.authorId, user.id))
            .leftJoin(vote, eq(question.id, vote.questionId))
            .leftJoin(answer, eq(question.id, answer.questionId))
            .leftJoin(questionTag, eq(question.id, questionTag.questionId))
            .leftJoin(tag, eq(questionTag.tagId, tag.id))
            .where(and(...whereClauses))
            .groupBy(
                collection.id,
                collection.createdAt,
                question.id,
                question.title,
                // question.content,
                question.views,
                question.createdAt,
                user.id,
                user.name,
                user.image,
            )
            .orderBy(...orderBy)
            .limit(pageSize)
            .offset((page - 1) * pageSize);


        return { total, rows };
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
