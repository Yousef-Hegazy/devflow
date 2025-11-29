import { Account, Avatars, Client, Storage, TablesDB } from "appwrite";
import { env } from "@/env";

export const appwriteConfig = {
    url: env.VITE_APPWRITE_ENDPOINT,
    projectId: env.VITE_APPWRITE_PROJECT_ID,
    databaseId: env.VITE_APPWRITE_DATABASE_ID,
    storageId: env.VITE_APPWRITE_STORAGE_ID,
    postsTableId: env.VITE_APPWRITE_POSTS_TABLE_ID,
    usersTableId: env.VITE_APPWRITE_USERS_TABLE_ID,
    savesTableId: env.VITE_APPWRITE_SAVES_TABLE_ID,
    likesTableId: env.VITE_APPWRITE_LIKES_TABLE_ID,
    followsTableId: env.VITE_APPWRITE_FOLLOWS_TABLE_ID,
}


const client = new Client()
.setEndpoint(appwriteConfig.url)
.setProject(appwriteConfig.projectId);

const account = new Account(client);
const avatars = new Avatars(client);
const storage = new Storage(client);
const database = new TablesDB(client);

export { client, account, avatars, storage, database };

export default client