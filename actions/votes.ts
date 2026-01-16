"use server";

import { db } from "@/db/client";
import { vote } from "@/db/db-schema";
import { VoteType } from "@/db/schema-types";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { getCurrentUser } from "@/lib/server";
import { and, eq } from "drizzle-orm";
import { revalidateTag, updateTag } from "next/cache";


//#region upvoteQuestion
export async function upvoteQuestion(questionId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to upvote a question.");
        }

        await db.transaction(async (tx) => {
            const existingVote = await tx.query.vote.findFirst({
                where: and(
                    eq(vote.authorId, user.id.toString()),
                    eq(vote.questionId, questionId)
                ),
            });

            if (existingVote) {
                if (existingVote.type === VoteType.UPVOTE) {
                    // User is removing their upvote
                    await tx.delete(vote).where(eq(vote.id, existingVote.id));
                } else {
                    // User is changing from downvote to upvote
                    await tx.update(vote).set({ type: VoteType.UPVOTE }).where(eq(vote.id, existingVote.id));
                }
            } else {
                // User is creating a new upvote
                await tx.insert(vote).values({
                    authorId: user.id.toString(),
                    questionId: questionId,
                    type: VoteType.UPVOTE,
                });
            }
        });

        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
        updateTag(CACHE_KEYS.QUESTIONS_LIST);

        return { success: true };
    } catch (error) {
        throw error;
    }
}
//#endregion

//#region downvoteQuestion
export async function downvoteQuestion(questionId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to downvote a question.");
        }

        await db.transaction(async (tx) => {
            const existingVote = await tx.query.vote.findFirst({
                where: and(
                    eq(vote.authorId, user.id.toString()),
                    eq(vote.questionId, questionId)
                ),
            });

            if (existingVote) {
                if (existingVote.type === VoteType.DOWNVOTE) {
                    // User is removing their downvote
                    await tx.delete(vote).where(eq(vote.id, existingVote.id));
                } else {
                    // User is changing from upvote to downvote
                    await tx.update(vote).set({ type: VoteType.DOWNVOTE }).where(eq(vote.id, existingVote.id));
                }
            } else {
                // User is creating a new downvote
                await tx.insert(vote).values({
                    authorId: user.id.toString(),
                    questionId: questionId,
                    type: VoteType.DOWNVOTE,
                });
            }
        });

        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
        updateTag(CACHE_KEYS.QUESTIONS_LIST);

        return { success: true };
    } catch (error) {
        throw error;
    }
}
//#endregion


//#region upvoteAnswer
export async function upvoteAnswer(answerId: string, questionId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to upvote an answer.");
        }

        await db.transaction(async (tx) => {
            const existingVote = await tx.query.vote.findFirst({
                where: and(
                    eq(vote.authorId, user.id.toString()),
                    eq(vote.answerId, answerId)
                ),
            });

            if (existingVote) {
                if (existingVote.type === VoteType.UPVOTE) {
                    // User is removing their upvote
                    await tx.delete(vote).where(eq(vote.id, existingVote.id));
                } else {
                    // User is changing from downvote to upvote
                    await tx.update(vote).set({ type: VoteType.UPVOTE }).where(eq(vote.id, existingVote.id));
                }
            } else {
                // User is creating a new upvote
                await tx.insert(vote).values({
                    authorId: user.id.toString(),
                    answerId: answerId,
                    type: VoteType.UPVOTE,
                });
            }
        });

        updateTag(CACHE_KEYS.QUESTION_ANSWERS + questionId);

        return { success: true };
    } catch (error) {
        throw error;
    }
}
//#endregion

//#region downvoteAnswer
export async function downvoteAnswer(answerId: string, questionId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to downvote an answer.");
        }

        await db.transaction(async (tx) => {
            const existingVote = await tx.query.vote.findFirst({
                where: and(
                    eq(vote.authorId, user.id.toString()),
                    eq(vote.answerId, answerId)
                ),
            });

            if (existingVote) {
                if (existingVote.type === VoteType.DOWNVOTE) {
                    // User is removing their downvote
                    await tx.delete(vote).where(eq(vote.id, existingVote.id));
                } else {
                    // User is changing from upvote to downvote
                    await tx.update(vote).set({ type: VoteType.DOWNVOTE }).where(eq(vote.id, existingVote.id));
                }
            } else {
                // User is creating a new downvote
                await tx.insert(vote).values({
                    authorId: user.id.toString(),
                    answerId: answerId,
                    type: VoteType.DOWNVOTE,
                });
            }
        });

        updateTag(CACHE_KEYS.QUESTION_ANSWERS + questionId);

        return { success: true };
    } catch (error) {
        throw error;
    }
}
//#endregion