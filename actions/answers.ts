"use server";

import { createAdminClient } from "@/lib/appwrite/config";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import handleError from "@/lib/errors";
import { getCurrentUser } from "@/lib/server";
import { Answer } from "@/lib/types/appwrite";
import { AnswersFilterType } from "@/lib/types/filters";
import { AnswerSchemaType } from "@/lib/validators/questionSchemas";
import { logger } from "@/pino";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { ID, Permission, Query, Role } from "node-appwrite";


//#region answerQuestion
export async function answerQuestion(answer: AnswerSchemaType, questionId: string) {
    const { database } = await createAdminClient();

    const tx = await database.createTransaction();

    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User must be logged in to answer a question.");
        }

        const answerId = ID.unique();

        await database.createOperations({
            transactionId: tx.$id,
            operations: [
                {
                    action: "increment",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.usersTableId,
                    rowId: user.$id,
                    data: {
                        column: "answersCount",
                        value: 1,
                    }
                },
                {
                    action: "create",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.answersTableId,
                    rowId: answerId,
                    data: {
                        content: answer.content,
                        author: user.$id,
                        question: questionId,
                        $permissions: [
                            Permission.read(Role.any()),
                            Permission.write(Role.user(user.$id)),
                            Permission.update(Role.user(user.$id)),
                            Permission.delete(Role.user(user.$id)),
                        ]
                    }
                },
                {
                    action: "increment",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.questionsTableId,
                    rowId: questionId,
                    data: {
                        column: "answersCount",
                        value: 1,
                    }
                }
            ]
        });

        await database.updateTransaction({
            transactionId: tx.$id,
            commit: true,
        });

        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);
        // Invalidate paginated answers cache for this question
        updateTag(CACHE_KEYS.QUESTION_ANSWERS + questionId);

        return answerId;

    } catch (error) {
        await database.updateTransaction({
            transactionId: tx.$id,
            rollback: true,
        });
        throw error;
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
    userId?: string
}) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(
        CACHE_KEYS.QUESTION_ANSWERS + questionId);

    try {
        const { database } = await createAdminClient();

        const queries = [
            Query.limit(pageSize),
            Query.offset((page - 1) * pageSize),
            Query.select(["*", "author.name", "author.image"]),

        ];

        if (questionId) {
            queries.push(Query.equal("question", questionId),)
        }

        if (userId) {
            queries.push(Query.equal("author", userId),)
        }

        switch (filter) {
            case "latest":
                queries.push(Query.orderDesc("$createdAt"));
                break;
            case "oldest":
                queries.push(Query.orderAsc("$createdAt"));
                break;
            case "popular":
                queries.push(Query.orderDesc("upvotes"));
                break;
            default:
                queries.push(Query.orderDesc("$createdAt"));
        }

        const res = await database.listRows<Answer>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.answersTableId,
            queries,
        });

        return res;
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
