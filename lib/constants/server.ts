import "server-only";

export const publicApiRoutes = [
    "/login",
    "/register",
]

export const appwriteConfig = {
    url: process.env.APPWRITE_ENDPOINT!,
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!,
    sessionName: process.env.APP_SESSION_NAME!,
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    usersTableId: process.env.APPWRITE_USERS_TABLE_ID!,
    questionsTableId: process.env.APPWRITE_QUESTIONS_TABLE_ID!,
    answersTableId: process.env.APPWRITE_ANSWERS_TABLE_ID!,
    tagsTableId: process.env.APPWRITE_TAGS_TABLE_ID!,
    votesTableId: process.env.APPWRITE_VOTES_TABLE_ID!,
    questionsTagsTableId: process.env.APPWRITE_QUESTIONS_TAGS_TABLE_ID!,
    collectionsTableId: process.env.APPWRITE_COLLECTIONS_TABLE_ID!,
    interactionsTableId: process.env.APPWRITE_INTERACTIONS_TABLE_ID!,
}