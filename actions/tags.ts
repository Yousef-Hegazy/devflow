"use server";

import { user } from "@/db/auth-schema";
import { db } from "@/db/client";
import { answer, question, questionTag, tag, vote } from "@/db/db-schema";
import { Tag } from "@/db/schema-types";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import handleError from "@/lib/errors";
import { TagsFilterType } from "@/lib/types/filters";
import {
    PaginationParams
} from "@/lib/types/pagination";
import { and, asc, count, desc, eq, sql, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";

export type TagWithQuestionCount = {
    id: string;
    title: string;
    questionsCount: number;
    createdAt: Date;
};

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
        // Build where clause
        const where: SQL[] = [];
        if (query) {
            const qLike = `%${query}%`;
            where.push(sql`(${tag.title} ILIKE ${qLike})`);
        }

        // Total count
        const totalRes = await db.select({ count: sql`count(*)` })
            .from(tag)
            .where(where.length ? and(...where) : undefined);

        const total = Number(totalRes?.[0]?.count ?? 0);

        if (total === 0) {
            return { total: 0, rows: [] };
        }

        // Subselect for questions count per tag
        const questionsCountExpr = count(questionTag.questionId);

        // Ordering
        let orderBy: SQL[] = [desc(questionsCountExpr)];
        switch (filter) {
            case "name":
                orderBy = [asc(tag.title)];
                break;
            case "popular":
                orderBy = [desc(questionsCountExpr)];
                break;
            case "oldest":
                orderBy = [asc(tag.createdAt)];
                break;
            case "recent":
            default:
                orderBy = [desc(tag.createdAt)];
                break;
        }

        // Rows with subselect questionsCount
        const rows = await db.select({
            id: tag.id,
            title: tag.title,
            questionsCount: questionsCountExpr,
            createdAt: tag.createdAt,
        })
            .from(tag)
            .leftJoin(questionTag, eq(tag.id, questionTag.tagId))
            .where(where.length ? and(...where) : undefined)
            .groupBy(tag.id, tag.title, tag.createdAt)
            .orderBy(...orderBy)
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        // const formatted = rows.map((r) => ({
        //     $id: r.id,
        //     title: r.title,
        //     questionsCount: Number(r.questionsCount ?? 0),
        //     createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
        // }));

        return { total, rows };
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
        // Subselect for questions count per tag
        const questionsCountExpr = sql<number>`(SELECT COUNT(*) FROM ${questionTag} WHERE ${questionTag.tagId} = ${tag.id})`;

        const rows = await db.select({
            id: tag.id,
            title: tag.title,
            questionsCount: count(questionTag.questionId),
            createdAt: tag.createdAt,
        })
            .from(tag)
            .leftJoin(questionTag, eq(tag.id, questionTag.tagId))
            .groupBy(tag.id, tag.title, tag.createdAt)
            .orderBy(count(questionTag.questionId))
            .limit(5);

        const total = rows.length;

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

export async function getTagDetails(tagId: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.TAGS_LIST, tagId);

    try {
        const questionsCountExpr = count(questionTag.questionId);

        const rows = await db
            .select({
                id: tag.id,
                title: tag.title,
                questionsCount: questionsCountExpr,
                createdAt: tag.createdAt,
            })
            .from(tag)
            .where(eq(tag.id, tagId))
            .leftJoin(questionTag, eq(tag.id, questionTag.tagId))
            .groupBy(tag.id, tag.title, tag.createdAt)
            .limit(1);

        if (!rows || rows.length === 0) return null;

        return rows[0];
    } catch (error) {
        handleError(error);
        return null;
    }
}

export async function getTagQuestions({
    tagId,
    page = 1,
    pageSize = 10,
    query = "",
}: {
    tagId: string;
    page: number;
    pageSize: number;
    query?: string;
}) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(
        CACHE_KEYS.QUESTIONS_LIST,
        CACHE_KEYS.QUESTIONS_LIST + String(page) + String(pageSize) + query + tagId,
    );

    try {
        // Build where clauses
        const whereClauses: SQL[] = [eq(questionTag.tagId, tagId)];

        if (query) {
            const qLike = `%${query}%`;
            whereClauses.push(sql`(${question.title} ILIKE ${qLike} OR ${question.content} ILIKE ${qLike})`);
        }

        // Count total matching rows for this tag
        const totalRes = await db.select({ count: sql`count(DISTINCT ${question.id})` })
            .from(question)
            .innerJoin(questionTag, eq(question.id, questionTag.questionId))
            .where(and(...whereClauses));

        const total = Number(totalRes?.[0]?.count ?? 0);

        if (total === 0) {
            return { total: 0, rows: [] };
        }

        // Fetch page of questions with author data and aggregates
        const upvotesExpr = sql<number>`COUNT(DISTINCT CASE WHEN ${vote.type} = 'upvote' THEN ${vote.id} END)`;
        const downvotesExpr = sql<number>`COUNT(DISTINCT CASE WHEN ${vote.type} = 'downvote' THEN ${vote.id} END)`;
        const answersCountExpr = sql<number>`COUNT(DISTINCT ${answer.id})`;

        const qt = alias(questionTag, "qt");

        const rows = await db.select({
            id: question.id,
            title: question.title,
            views: question.views,
            upvotes: upvotesExpr,
            downvotes: downvotesExpr,
            answersCount: answersCountExpr,
            createdAt: question.createdAt,
            author: {
                id: user.id,
                name: user.name,
                image: user.image,
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
            .from(question)
            .innerJoin(qt, eq(question.id, qt.questionId))
            .leftJoin(user, eq(question.authorId, user.id))
            .leftJoin(vote, eq(question.id, vote.questionId))
            .leftJoin(answer, eq(question.id, answer.questionId))
            // We need to join with tags again to get all tags for each question in the result
            .leftJoin(questionTag, eq(question.id, questionTag.questionId))
            .leftJoin(tag, eq(questionTag.tagId, tag.id))
            .where(and(eq(qt.tagId, tagId), ...whereClauses.slice(1)))
            .groupBy(
                question.id,
                question.title,
                question.views,
                question.createdAt,
                user.id,
                user.name,
                user.image,
            )
            .orderBy(desc(question.createdAt))
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

export async function getUserTags(userId: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION * 10,
    });

    cacheTag(CACHE_KEYS.TAGS_LIST);

    try {
        // Count distinct tags used by the user's questions
        const totalRes = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${tag.id})` })
            .from(question)
            .leftJoin(questionTag, eq(question.id, questionTag.questionId))
            .leftJoin(tag, eq(questionTag.tagId, tag.id))
            .where(eq(question.authorId, userId));

        const total = Number(totalRes?.[0]?.count ?? 0);

        if (total === 0) {
            return { total: 0, rows: [] };
        }

        // Fetch top tags for user's questions (by usage count)
        const usageExpr = sql<number>`COUNT(${questionTag.questionId})`;

        const rows = await db.select({
            id: tag.id,
            title: tag.title,
            questionsCount: usageExpr,
            createdAt: tag.createdAt,
        })
            .from(tag)
            .leftJoin(questionTag, eq(tag.id, questionTag.tagId))
            .leftJoin(question, eq(questionTag.questionId, question.id))
            .where(eq(question.authorId, userId))
            .groupBy(tag.id, tag.title, tag.createdAt)
            .orderBy(desc(usageExpr))
            .limit(10);

        return { total, rows };
    } catch (error) {
        const err = handleError(error);

        return {
            total: 0,
            rows: [],
            error: err.message,
        };
    }
}