import { cookies } from "next/headers";
import { Account, Avatars, Client, Storage, TablesDB } from "node-appwrite";

export const appwriteConfig = {
    url: process.env.APPWRITE_ENDPOINT!,
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!,
    sessionName: process.env.APP_SESSION_NAME!,
}

export async function createSessionClient() {
    const session = (await cookies()).get(appwriteConfig.sessionName);

    if (!session || !session.value) {
        throw new Error("No session");
    }


    const client = new Client()
        .setEndpoint(appwriteConfig.url)
        .setProject(appwriteConfig.projectId)
        .setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },
        get database() {
            return new TablesDB(client);
        },
        get avatars() {
            return new Avatars(client);
        },
        get storage() {
            return new Storage(client);
        }
    };
}

export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(appwriteConfig.url)
        .setProject(appwriteConfig.projectId)
        .setKey(appwriteConfig.apiKey);

    return {
        get account() {
            return new Account(client);
        },
    };
}