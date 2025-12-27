"use server";

import { createAdminClient } from "@/lib/appwrite/config";
import { Answer, Question, Tag } from "@/lib/appwrite/types";
import { DEFAULT_CACHE_DURATION, HomeFilterType } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import handleError from "@/lib/errors";
import { getCurrentUser } from "@/lib/server";
import { AnswerSchemaType, AskQuestionSchema, AskQuestionSchemaType } from "@/lib/validators/questionSchemas";
import { logger } from "@/pino";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { ID, Permission, Query, Role } from "node-appwrite";


//#region searchQuestions
export async function searchQuestions({
    page = 1,
    pageSize = 10,
    query = "",
    filter = "all",
}: {
    page: number;
    pageSize: number;
    query?: string;
    filter?: HomeFilterType;
}) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(
        CACHE_KEYS.QUESTIONS_LIST,
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
            Query.select([
                "*",
                "author.name",
                "author.image",
                "tags.*",
                "tags.tag.title",
            ]),
        ];

        switch (filter) {
            case "recommended":
                return { total: 0, rows: [] };
            case "popular":
                queries.push(Query.orderDesc("upvotes"));
                break;
            case "unanswered":
                queries.push(Query.equal("answersCount", 0));
                break;
            default:
                queries.push(Query.orderDesc("$createdAt"));
                break;
        }

        if (query) {
            queries.push(Query.contains("title", query));
        }

        const res = await database.listRows<Question>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.questionsTableId,
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
//#endregion

//#region createQuestion
export async function createQuestion(userId: string, data: AskQuestionSchemaType) {
    const question = AskQuestionSchema.parse(data);

    const { database } = await createAdminClient();

    const tx = await database.createTransaction();

    try {

        question.tags = question.tags.map(tag => tag.trim().toUpperCase());

        const existingTags = await database.listRows<Tag>({
            databaseId: appwriteConfig.databaseId,
            transactionId: tx.$id,
            tableId: appwriteConfig.tagsTableId,
            queries: [
                question.tags.length > 1 ? Query.or(
                    question.tags.map(tag => Query.equal("title", tag)),
                ) : Query.equal("title", question.tags[0])
            ]
        });

        const existingTagNames = existingTags.rows.map(tag => tag.title);

        const newTags = question.tags.filter(tag => !existingTagNames.includes(tag)).map(tag => ({ id: ID.unique(), title: tag }));

        const allTags: { id: string; title: string }[] = existingTags.rows.map(tag => ({
            id: tag.$id,
            title: tag.title,
        })).concat(newTags);

        const questionId = ID.unique();

        await database.createOperations({
            transactionId: tx.$id,
            operations: [
                {
                    action: "create",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.questionsTableId,
                    rowId: questionId,
                    data: {
                        title: question.title,
                        content: question.content,
                        author: userId,
                        tags: [],
                        $permissions: [
                            Permission.read(Role.any()),
                            Permission.write(Role.user(userId)),
                            Permission.update(Role.user(userId)),
                            Permission.delete(Role.user(userId)),
                        ],
                    },

                },
                ...existingTags.rows.map(tag => ({
                    action: "increment",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.tagsTableId,
                    rowId: tag.$id,
                    data: {
                        column: "questionsCount",
                        value: 1,
                    }
                })),
                ...newTags.map(tag => ({
                    action: "create",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.tagsTableId,
                    rowId: tag.id,
                    data: {
                        title: tag.title,
                        questionsCount: 1,
                        questions: [],
                    }
                })),
                ...allTags.map(tag => ({
                    action: "create",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.questionsTagsTableId,
                    rowId: ID.unique(),
                    data: {
                        question: questionId,
                        tag: tag.id,
                    }
                }))
            ]
        });

        await database.updateTransaction({
            transactionId: tx.$id,
            commit: true,
        });

        updateTag(CACHE_KEYS.QUESTIONS_LIST);

        return questionId;

    } catch (error) {
        await database.updateTransaction({
            transactionId: tx.$id,
            rollback: true,
        });

        throw error;
    }
}
//#endregion

//#region updateQuestion
export async function updateQuestion(userId: string, questionId: string, data: AskQuestionSchemaType) {
    const question = AskQuestionSchema.parse(data);

    const { database } = await createAdminClient();


    const questionToEdit = await database.getRow<Question>({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.questionsTableId,
        rowId: questionId,
        queries: [
            Query.select(["author.$id", "tags.*"])
        ]
    });

    if (questionToEdit.author.$id !== userId) {
        throw new Error("You are not authorized to update this question.");
    }

    const tx = await database.createTransaction();

    try {

        question.tags = question.tags.map(tag => tag.trim().toUpperCase());

        const existingTags = await database.listRows<Tag>({
            databaseId: appwriteConfig.databaseId,
            transactionId: tx.$id,
            tableId: appwriteConfig.tagsTableId,
            queries: [
                question.tags.length > 1 ? Query.or(
                    question.tags.map(tag => Query.equal("title", tag)),
                ) : Query.equal("title", question.tags[0]),
                Query.select(["questions.*", "questions.question.$id"])
            ]
        });

        const existingTagNames = existingTags.rows.map(tag => tag.title);


        const newTags = question.tags.filter(tag => !existingTagNames.includes(tag)).map(tag => ({ id: ID.unique(), title: tag }));

        const allTags: { id: string; title: string }[] = existingTags.rows.map(tag => ({
            id: tag.$id,
            title: tag.title,
        })).concat(newTags);

        await database.createOperations({
            transactionId: tx.$id,
            operations: [
                ...questionToEdit.tags.map(qt => ({
                    action: "decrement",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.tagsTableId,
                    rowId: qt.tag.toString(),
                    data: {
                        column: "questionsCount",
                        value: 1,
                    }
                })),
                ...questionToEdit.tags.map(tag => ({
                    action: "delete",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.questionsTagsTableId,
                    rowId: tag.$id,
                })),
                {
                    action: "update",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.questionsTableId,
                    rowId: questionId,
                    data: {
                        title: question.title,
                        content: question.content,
                        tags: [],
                    },
                },
                ...existingTags.rows.map(tag => ({
                    action: "increment",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.tagsTableId,
                    rowId: tag.$id,
                    data: {
                        column: "questionsCount",
                        value: 1,
                    }
                })),
                ...newTags.map(tag => ({
                    action: "create",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.tagsTableId,
                    rowId: tag.id,
                    data: {
                        title: tag.title,
                        questionsCount: 1,
                        questions: [],
                    }
                })),
                ...allTags.map(tag => ({
                    action: "create",
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.questionsTagsTableId,
                    rowId: ID.unique(),
                    data: {
                        question: questionId,
                        tag: tag.id,
                    }
                }))
            ]
        });

        await database.updateTransaction({
            transactionId: tx.$id,
            commit: true,
        });

        updateTag(CACHE_KEYS.QUESTIONS_LIST);
        updateTag(CACHE_KEYS.QUESTION_DETAILS + questionId);

        return questionId;

    } catch (error) {
        await database.updateTransaction({
            transactionId: tx.$id,
            rollback: true,
        });

        throw error;
    }

}
//#endregion

// #region increaseViewCount
export async function increaseViewCount(questionId: string) {

    const { database } = await createAdminClient();

    const question = await database.incrementRowColumn({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.questionsTableId,
        rowId: questionId,
        column: "views",
    });

    updateTag(CACHE_KEYS.QUESTION_VIEWS + questionId);

    return question;
}
//#endregion

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

//#region getQuestionDetails
export async function getQuestionDetails(id: string) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(CACHE_KEYS.QUESTION_DETAILS + id);

    try {
        const { database } = await createAdminClient();

        const question = await database.getRow<Question>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.questionsTableId,
            rowId: id,
            queries: [
                Query.select([
                    "*",
                    "author.name",
                    "author.image",
                    "tags.*",
                    "tags.tag.title",
                ]),
            ],
        });

        return question;
    } catch (error) {
        handleError(error);
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
    cacheTag(CACHE_KEYS.QUESTION_VIEWS + id);

    try {
        const { database } = await createAdminClient();
        const question = await database.getRow<Question>({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.questionsTableId,
            rowId: id,
            queries: [Query.select(["views"])],
        });
        return question.views;
    } catch (error) {
        handleError(error);
        return 0;
    }
};
//#endregion

//#region getAnswers
export async function getAnswers({
    questionId,
    page = 1,
    pageSize = 10,
    filter = "default",
}: {
    questionId: string;
    page?: number;
    pageSize?: number;
    filter?: "latest" | "oldest" | "popular" | "default";
}) {
    "use cache";

    cacheLife({
        revalidate: DEFAULT_CACHE_DURATION,
    });

    cacheTag(
        CACHE_KEYS.QUESTION_ANSWERS + questionId,
        String(page),
        String(pageSize),
        filter,
    );

    try {
        const { database } = await createAdminClient();

        const queries = [
            Query.limit(pageSize),
            Query.offset((page - 1) * pageSize),
            Query.select(["*", "author.name", "author.image"]),
            Query.equal("question", questionId),
        ];

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

