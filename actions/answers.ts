"use server";

import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import handleError from "@/lib/errors";
import { getCurrentUser } from "@/lib/server";
import { AnswersFilterType } from "@/lib/types/filters";
import { AnswerSchema, AnswerSchemaType } from "@/lib/validators/questionSchemas";
import { logger } from "@/pino";
import { cacheLife, cacheTag, updateTag } from "next/cache";

// Drizzle
import { db } from "@/db/client";
import { user as userTable } from "@/db/auth-schema";
import { and, asc, desc, eq, sql, SQL } from "drizzle-orm";
import { answer, vote } from "@/db/db-schema";


//#region answerQuestion
export async function answerQuestion(answerBody: AnswerSchemaType, questionId: string) {
    // Validate input server-side
    const parsed = AnswerSchema.parse(answerBody);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw new Error("User must be logged in to answer a question.");
    }

    try {
        let createdAnswerId: string | undefined;

        await db.transaction(async (tx) => {
            const inserted = await tx
                .insert(answer)
                .values({
                    authorId: currentUser.id,
                    questionId,
                    content: parsed.content,
                })
                .returning();

            if (!inserted || !inserted[0]) {
                throw new Error("Failed to create answer");
            }

            createdAnswerId = inserted[0].id;

            // Increment user's answersCount
            await tx
                .update(userTable)
                .set({ answersCount: sql`${userTable.answersCount} + 1` })
                .where(eq(userTable.id, currentUser.id));

            // Note: questions table doesn't maintain answersCount column in Postgres schema;
            // we rely on COUNT(answers) in queries, so we do not update question row here.
        });

        // Invalidate caches
        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
        updateTag(CACHE_KEYS.QUESTION_ANSWERS + questionId);

        if (!createdAnswerId) throw new Error("Failed to create answer");

        return createdAnswerId;
    } catch (error) {
        throw handleError(error);
    }
}
//#endregion



//#region searchAnswers
export async function searchAnswers({
    page = 1,
    pageSize = 10,
    filter = "latest",
    questionId,
    userId,
}: {
    page?: number;
    pageSize?: number;
    filter?: AnswersFilterType;
    questionId?: string;
    userId?: string;
}) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.QUESTION_ANSWERS + questionId);

    try {
        // Build where clauses
        const whereClauses: SQL[] = [];
        if (questionId) whereClauses.push(eq(answer.questionId, questionId));
        if (userId) whereClauses.push(eq(answer.authorId, userId));

        // Aggregates for ordering and counts
        const upvotesExpr = sql`SUM(CASE WHEN ${vote.type} = 'upvote' THEN 1 ELSE 0 END)`;
        const downvotesExpr = sql`SUM(CASE WHEN ${vote.type} = 'downvote' THEN 1 ELSE 0 END)`;

        // Count total matching rows
        const totalRes = await db
            .select({ count: sql`count(*)` })
            .from(answer)
            .where(whereClauses.length ? and(...whereClauses) : undefined);

        const total = Number(totalRes?.[0]?.count ?? 0);

        // Determine ordering
        let orderByCols: SQL[] = [];
        switch (filter) {
            case "latest":
                orderByCols = [desc(answer.createdAt)];
                break;
            case "oldest":
                orderByCols = [asc(answer.createdAt)];
                break;
            case "popular":
                orderByCols = [desc(upvotesExpr)];
                break;
            default:
                orderByCols = [desc(answer.createdAt)];
        }

        const rows = await db
            .select({
                id: answer.id,
                content: answer.content,
                createdAt: answer.createdAt,
                questionId: answer.questionId,
                author: { id: userTable.id, name: userTable.name, image: userTable.image },
                upvotes: upvotesExpr,
                downvotes: downvotesExpr,
            })
            .from(answer)
            .leftJoin(userTable, eq(answer.authorId, userTable.id))
            .leftJoin(vote, eq(answer.id, vote.answerId))
            .where(whereClauses.length ? and(...whereClauses) : undefined)
            .groupBy(answer.id, answer.content, answer.createdAt, answer.questionId, userTable.id, userTable.name, userTable.image)
            .orderBy(...orderByCols)
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        const formatted = rows.map((r) => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt,
            questionId: r.questionId,
            author: r.author,
            upvotes: Number(r.upvotes ?? 0),
            downvotes: Number(r.downvotes ?? 0),
        }));

        return { total, rows: formatted };
    } catch (e) {
        const error = handleError(e);
        logger.error(JSON.stringify(error));

        return {
            total: 0,
            rows: [],
            error: error.message,
        };
    }
}
//#endregion
