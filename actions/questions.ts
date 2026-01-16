"use server";

import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import handleError from "@/lib/errors";
import { HomeFilterType } from "@/lib/types/filters";
import { PaginationParams } from "@/lib/types/pagination";
import { AskQuestionSchema, AskQuestionSchemaType } from "@/lib/validators/questionSchemas";
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";

// Drizzle DB + helpers
import { user } from "@/db/auth-schema";
import { db } from "@/db/client";
import { answer, question, questionTag, tag, vote } from "@/db/db-schema";
import { Tag } from "@/db/schema-types";
import { and, AnyColumn, desc, eq, sql, SQL, SQLWrapper } from "drizzle-orm";

export type QuestionsRes = {
    total: number;
    rows: {
        id: string;
        title: string;
        content: string;
        views: number;
        upvotes: number;
        downvotes: number;
        answersCount: number;
        createdAt: Date;
        author: {
            id: string;
            name: string;
            image: string | null;
        } | null;
        tags: {
            id: string;
            createdAt: Date;
            title: string;
        }[];
    }[];
    error?: undefined;
} | {
    total: number;
    rows: never[];
    error: string;
};

export type QuestionWithMetadata = QuestionsRes["rows"][number];

//#region searchQuestions
export async function searchQuestions({
    page = 1,
    pageSize = 10,
    query = "",
    filter = "all",
    userId
}: PaginationParams<HomeFilterType> & { userId?: string }) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(
        CACHE_KEYS.QUESTIONS_LIST);

    try {

        // Build where clauses based on incoming params
        const whereClauses: AnyColumn | SQLWrapper[] = [];

        if (userId) {
            whereClauses.push(eq(question.authorId, userId));
        }

        if (query) {
            // Use ILIKE for case-insensitive contains on Postgres
            const qLike = `%${query}%`;
            whereClauses.push(sql`(${question.title} ILIKE ${qLike} OR ${question.content} ILIKE ${qLike})`);
        }

        // Build ordering using aggregates where appropriate
        // Use SQL expressions for aggregated upvotes/downvotes
        const upvotesExprForOrder = sql<number>`SUM(CASE WHEN ${vote.type} = 'upvote' THEN 1 ELSE 0 END)`;
        let orderByCols: SQL[] = [];
        switch (filter) {
            case "recommended":
                // Recommended: exclude the current user's own content (if any) and prefer popular content
                if (userId) {
                    whereClauses.push(sql`${question.authorId} != ${userId}`);
                }
                orderByCols = [desc(upvotesExprForOrder), desc(question.views)];
                break;
            case "popular":
                orderByCols = [desc(upvotesExprForOrder)];
                break;
            case "unanswered":
                // Exclude any question that has answers
                whereClauses.push(sql`NOT EXISTS (SELECT 1 FROM ${answer} WHERE ${answer.questionId} = ${question.id})`);
                orderByCols = [desc(question.createdAt)];
                break;
            default:
                orderByCols = [desc(question.createdAt)];
                break;
        }

        // Count total matching rows (after applying filter-specific clauses)
        const totalRes = await db.select({ count: sql`count(*)` })
            .from(question)
            .where(whereClauses.length ? and(...whereClauses) : undefined);

        const total = Number(totalRes?.[0]?.count ?? 0);

        // Fetch page of questions with author data and aggregates (upvotes, answersCount)
        // Aggregate upvotes from `vote` table and answersCount from `answer` table
        const upvotesExpr = sql<number>`COUNT(DISTINCT CASE WHEN ${vote.type} = 'upvote' THEN ${vote.id} END)`;
        const downvotesExpr = sql<number>`COUNT(DISTINCT CASE WHEN ${vote.type} = 'downvote' THEN ${vote.id} END)`;
        const answersCountExpr = sql<number>`COUNT(DISTINCT ${answer.id})`;

        const rows = await db.select({
            id: question.id,
            title: question.title,
            content: question.content,
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
            .leftJoin(user, eq(question.authorId, user.id))
            .leftJoin(vote, eq(question.id, vote.questionId))
            .leftJoin(answer, eq(question.id, answer.questionId))
            .leftJoin(questionTag, eq(question.id, questionTag.questionId))
            .leftJoin(tag, eq(questionTag.tagId, tag.id))
            .where(whereClauses.length ? and(...whereClauses) : undefined)
            .groupBy(
                question.id,
                question.title,
                question.content,
                question.views,
                question.createdAt,
                user.id,
                user.name,
                user.image,
            )
            .orderBy(...orderByCols)
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
};
//#endregion

//#region createQuestion
export async function createQuestion(userId: string, data: AskQuestionSchemaType) {
    // Validate and normalize incoming data
    const parsed = AskQuestionSchema.parse(data);

    // Normalize tags to uppercase to preserve previous behavior
    const tagTitles = (parsed.tags || []).map((t) => t.trim().toUpperCase());

    try {
        let createdQuestionId: string | undefined;

        await db.transaction(async (tx) => {
            // Fetch existing tags by title
            const existingTags = tagTitles.length
                ? await tx
                    .select()
                    .from(tag)
                    .where(sql`${tag.title} IN (${sql.join(tagTitles.map((t) => sql`${t}`), sql`, `)})`)
                : [];

            const existingTitles = existingTags.map((t) => t.title);
            const newTitles = tagTitles.filter((t) => !existingTitles.includes(t));

            const insertedNewTags = [] as Tag[];

            // Insert any new tags and collect them
            for (const title of newTitles) {
                const inserted = await tx.insert(tag).values({ title }).returning();
                if (inserted?.length > 0) insertedNewTags.push(inserted[0] as Tag);
            }

            const allTags = [...existingTags, ...insertedNewTags];

            // Create question
            const insertedQuestion = await tx
                .insert(question)
                .values({
                    authorId: userId,
                    title: parsed.title,
                    content: parsed.content,
                })
                .returning();

            if (!insertedQuestion || !insertedQuestion[0]) {
                throw new Error("Failed to create question");
            }

            const qid = insertedQuestion[0].id;
            createdQuestionId = qid;

            // Link tags
            if (allTags.length > 0) {
                const relations = allTags.map((t) => ({
                    questionId: qid,
                    tagId: t.id,
                }));

                // Insert multiple rows at once by passing the array directly
                await tx.insert(questionTag).values(relations);
            }

            // Increment user's questionsCount
            await tx
                .update(user)
                .set({ questionsCount: sql`${user.questionsCount} + 1` })
                .where(eq(user.id, userId));
        });

        // Invalidate relevant caches
        updateTag(CACHE_KEYS.QUESTIONS_LIST);
        updateTag(CACHE_KEYS.TAGS_LIST);
        updateTag(CACHE_KEYS.USER_DETAILS + userId);

        if (!createdQuestionId) throw new Error("Failed to create question");

        return createdQuestionId;
    } catch (e) {
        throw handleError(e);
    }
}
//#endregion

//#region updateQuestion
export async function updateQuestion(userId: string, questionId: string, data: AskQuestionSchemaType) {
    const parsed = AskQuestionSchema.parse(data);

    try {
        // Verify question exists and ownership
        const existing = await db.select({ id: question.id, authorId: question.authorId })
            .from(question)
            .where(eq(question.id, questionId))
            .limit(1);

        if (!existing || existing.length === 0) {
            throw new Error("Question not found");
        }

        if (existing[0].authorId !== userId) {
            throw new Error("You are not authorized to update this question.");
        }

        await db.transaction(async (tx) => {
            const tagTitles = (parsed.tags || []).map((t) => t.trim().toUpperCase());

            // Fetch existing tags by title
            const existingTags = tagTitles.length
                ? await tx
                    .select()
                    .from(tag)
                    .where(sql`${tag.title} IN (${sql.join(tagTitles.map((t) => sql`${t}`), sql`, `)})`)
                : [];

            const existingTitles = existingTags.map((t) => t.title);
            const newTitles = tagTitles.filter((t) => !existingTitles.includes(t));

            const insertedNewTags = [] as Tag[];

            // Insert any new tags
            for (const title of newTitles) {
                const inserted = await tx.insert(tag).values({ title }).returning();
                if (inserted?.length) insertedNewTags.push(inserted[0] as Tag);
            }

            const allTags = [...existingTags, ...insertedNewTags];

            // Remove existing tag relations for this question
            await tx.delete(questionTag).where(eq(questionTag.questionId, questionId));

            // Insert new relations
            if (allTags.length > 0) {
                const relations = allTags.map((t) => ({ questionId, tagId: t.id }));
                await tx.insert(questionTag).values(relations);
            }

            // Update question
            await tx
                .update(question)
                .set({ title: parsed.title, content: parsed.content })
                .where(eq(question.id, questionId));
        });

        // Update caches
        updateTag(CACHE_KEYS.QUESTIONS_LIST);
        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
        revalidateTag(CACHE_KEYS.TAGS_LIST, "max");

        return questionId;
    } catch (e) {
        throw handleError(e);
    }
}
//#endregion

// #region increaseViewCount
export async function increaseViewCount(questionId: string) {
    try {
        const res = await db
            .update(question)
            .set({ views: sql`${question.views} + 1` })
            .where(eq(question.id, questionId))
            .returning();

        const updated = res?.[0];
        const views = updated ? Number(updated.views) : 0;

        updateTag(CACHE_KEYS.QUESTION_VIEWS + questionId);
        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);

        return views;
    } catch (e) {
        throw handleError(e);
    }
}
//#endregion


//#region getQuestionDetails
export async function getQuestionDetails(id: string, userId?: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.QUESTION_DETAILS + id);

    try {
        // Aggregates with DISTINCT to avoid overcounting due to multiple joins
        const upvotesExpr = sql<number>`COUNT(DISTINCT CASE WHEN ${vote.type} = 'upvote' THEN ${vote.id} END)`;
        const downvotesExpr = sql<number>`COUNT(DISTINCT CASE WHEN ${vote.type} = 'downvote' THEN ${vote.id} END)`;
        const answersCountExpr = sql<number>`COUNT(DISTINCT ${answer.id})`;

        const rows = await db
            .select({
                id: question.id,
                title: question.title,
                content: question.content,
                views: question.views,
                upvotes: upvotesExpr,
                downvotes: downvotesExpr,
                answersCount: answersCountExpr,
                userAnswer: userId ? sql<string | null>`(SELECT ${answer.id} FROM ${answer} WHERE ${answer.questionId} = ${question.id} AND ${answer.authorId} = ${userId} LIMIT 1)` : sql<null>`NULL`,
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
            .leftJoin(user, eq(question.authorId, user.id))
            .leftJoin(vote, eq(question.id, vote.questionId))
            .leftJoin(answer, eq(question.id, answer.questionId))
            .leftJoin(questionTag, eq(question.id, questionTag.questionId))
            .leftJoin(tag, eq(questionTag.tagId, tag.id))
            .where(eq(question.id, id))
            .groupBy(
                question.id,
                question.title,
                question.content,
                question.views,
                question.createdAt,
                user.id,
                user.name,
                user.image,
            )
            .limit(1);

        if (!rows || rows.length === 0) return null;

        return rows[0];
    } catch (error) {
        const err = handleError(error);
        console.log({ err })
        return null;
    }
};
//#endregion

//#region getQuestionViews
export async function getQuestionViews(id: string) {
    "use cache";
    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });
    cacheTag(CACHE_KEYS.QUESTION_VIEWS + id, CACHE_KEYS.QUESTION_DETAILS + id);

    try {
        const rows = await db
            .select({ views: question.views })
            .from(question)
            .where(eq(question.id, id))
            .limit(1);

        const r = rows?.[0];
        return r ? Number(r.views) : 0;
    } catch (error) {
        handleError(error);
        return 0;
    }
};
//#endregion


//#region getHotQuestions
export async function getHotQuestions() {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.QUESTIONS_LIST);

    try {
        const upvotesExpr = sql`SUM(CASE WHEN ${vote.type} = 'upvote' THEN 1 ELSE 0 END)`;
        // const downvotesExpr = sql`SUM(CASE WHEN ${vote.type} = 'downvote' THEN 1 ELSE 0 END)`;
        // const answersCountExpr = sql`COUNT(${answer.id})`;

        const rows = await db
            .select({
                id: question.id,
                title: question.title,
            })
            .from(question)
            .leftJoin(vote, eq(question.id, vote.questionId))
            .groupBy(
                question.id,
                question.title,
                question.views,
            )
            .orderBy(desc(upvotesExpr), desc(question.views))
            .limit(5);

        return { total: rows.length, rows };
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

//#region deleteQuestion
export async function deleteQuestion(id: string, userId: string) {

    try {
        await db.delete(question).where(and(eq(question.id, id), eq(question.authorId, userId)));
        updateTag(CACHE_KEYS.QUESTIONS_LIST);
        updateTag(CACHE_KEYS.USER_DETAILS + userId);
        updateTag(CACHE_KEYS.TAGS_LIST);
    } catch (e) {
        const error = handleError(e);
        console.log({ error })
        return {
            error: error.message,
        };
    }
}
//#endregion
