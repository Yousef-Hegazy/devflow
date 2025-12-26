"use server";

import { createAdminClient } from "@/lib/appwrite/config";
import { Vote, VoteType } from "@/lib/appwrite/types";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { getCurrentUser } from "@/lib/server";
import { logger } from "@/pino";
import { updateTag } from "next/cache";
import { ID, Permission, Query, Role } from "node-appwrite";


//#region upvoteQuestion
export async function upvoteQuestion(questionId: string) {
    const { database } = await createAdminClient();

    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to upvote a question.");
        }

        // Check if user has already voted on this question
        const existingVote = await database.listRows<Vote>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.votesTableId,
            queries: [
                Query.equal("author", user.$id),
                Query.equal("question", questionId),
                Query.limit(1),
            ],
        });

        const tx = await database.createTransaction();

        try {
            const operations = [];

            if (existingVote.total > 0) {
                const vote = existingVote.rows[0];

                if (vote.type === VoteType.UPVOTE) {
                    // User is removing their upvote
                    operations.push(
                        {
                            action: "delete",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.votesTableId,
                            rowId: vote.$id,
                        },
                        {
                            action: "decrement",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.questionsTableId,
                            rowId: questionId,
                            data: {
                                column: "upvotes",
                                value: 1,
                            },
                        }
                    );
                } else {
                    // User is changing from downvote to upvote
                    operations.push(
                        {
                            action: "update",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.votesTableId,
                            rowId: vote.$id,
                            data: {
                                type: VoteType.UPVOTE,
                            },
                        },
                        {
                            action: "decrement",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.questionsTableId,
                            rowId: questionId,
                            data: {
                                column: "downvotes",
                                value: 1,
                            },
                        },
                        {
                            action: "increment",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.questionsTableId,
                            rowId: questionId,
                            data: {
                                column: "upvotes",
                                value: 1,
                            },
                        }
                    );
                }
            } else {
                // User is creating a new upvote
                operations.push(
                    {
                        action: "create",
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.votesTableId,
                        rowId: ID.unique(),
                        data: {
                            type: VoteType.UPVOTE,
                            author: user.$id,
                            question: questionId,
                            $permissions: [
                                Permission.read(Role.any()),
                                Permission.write(Role.user(user.$id)),
                                Permission.update(Role.user(user.$id)),
                                Permission.delete(Role.user(user.$id)),
                            ],
                        },
                    },
                    {
                        action: "increment",
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.questionsTableId,
                        rowId: questionId,
                        data: {
                            column: "upvotes",
                            value: 1,
                        },
                    }
                );
            }

            await database.createOperations({
                transactionId: tx.$id,
                operations,
            });

            await database.updateTransaction({
                transactionId: tx.$id,
                commit: true,
            });

            updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
            updateTag(CACHE_KEYS.QUESTIONS_LIST);
            // updateTag(CACHE_KEYS.USER_QUESTION_VOTE + user.$id + questionId);

            return { success: true };
        } catch (error) {
            await database.updateTransaction({
                transactionId: tx.$id,
                rollback: true,
            });
            throw error;
        }
    } catch (error) {
        throw error;
    }
}
//#endregion

//#region downvoteQuestion
export async function downvoteQuestion(questionId: string) {
    const { database } = await createAdminClient();

    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to downvote a question.");
        }

        // Check if user has already voted on this question
        const existingVote = await database.listRows<Vote>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.votesTableId,
            queries: [
                Query.equal("author", user.$id),
                Query.equal("question", questionId),
                Query.limit(1),
            ],
        });

        const tx = await database.createTransaction();

        try {
            const operations = [];

            if (existingVote.total > 0) {
                const vote = existingVote.rows[0];

                if (vote.type === VoteType.DOWNVOTE) {
                    // User is removing their downvote
                    operations.push(
                        {
                            action: "delete",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.votesTableId,
                            rowId: vote.$id,
                        },
                        {
                            action: "decrement",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.questionsTableId,
                            rowId: questionId,
                            data: {
                                column: "downvotes",
                                value: 1,
                            },
                        }
                    );
                } else {
                    // User is changing from upvote to downvote
                    operations.push(
                        {
                            action: "update",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.votesTableId,
                            rowId: vote.$id,
                            data: {
                                type: VoteType.DOWNVOTE,
                            },
                        },
                        {
                            action: "decrement",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.questionsTableId,
                            rowId: questionId,
                            data: {
                                column: "upvotes",
                                value: 1,
                            },
                        },
                        {
                            action: "increment",
                            databaseId: appwriteConfig.databaseId,
                            tableId: appwriteConfig.questionsTableId,
                            rowId: questionId,
                            data: {
                                column: "downvotes",
                                value: 1,
                            },
                        }
                    );
                }
            } else {
                // User is creating a new downvote
                operations.push(
                    {
                        action: "create",
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.votesTableId,
                        rowId: ID.unique(),
                        data: {
                            type: VoteType.DOWNVOTE,
                            author: user.$id,
                            question: questionId,
                            $permissions: [
                                Permission.read(Role.any()),
                                Permission.write(Role.user(user.$id)),
                                Permission.update(Role.user(user.$id)),
                                Permission.delete(Role.user(user.$id)),
                            ],
                        },
                    },
                    {
                        action: "increment",
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.questionsTableId,
                        rowId: questionId,
                        data: {
                            column: "downvotes",
                            value: 1,
                        },
                    }
                );
            }

            await database.createOperations({
                transactionId: tx.$id,
                operations,
            });

            await database.updateTransaction({
                transactionId: tx.$id,
                commit: true,
            });

            updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
            updateTag(CACHE_KEYS.QUESTIONS_LIST);
            // updateTag(CACHE_KEYS.USER_QUESTION_VOTE + user.$id + questionId);

            return { success: true };
        } catch (error) {
            await database.updateTransaction({
                transactionId: tx.$id,
                rollback: true,
            });
            throw error;
        }
    } catch (error) {
        throw error;
    }
}
//#endregion


//#region getUserQuestionVote
export async function getUserQuestionVote({
    userId,
    questionId,
}: {
    userId: string;
    questionId: string;
}) {
    // "use cache";

    // cacheLife({ revalidate: DEFAULT_CACHE_DURATION });

    // cacheTag(CACHE_KEYS.USER_QUESTION_VOTE + userId + questionId);

    try {
        const { database } = await createAdminClient();
        const votes = await database.listRows<Vote>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.votesTableId,
            queries: [
                Query.equal("question", questionId),
                Query.equal("author", userId),
            ],
        });

        const vote = votes.rows[0];
        return vote;
    } catch (error) {
        logger.error(error, "Error fetching votes:");
        return null;
    }
};
//#endregion