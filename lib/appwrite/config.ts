"use server";

import { Account, Avatars, Client, Storage, TablesDB } from "node-appwrite";
import { getSession } from "../server";
import { appwriteConfig } from "../constants/server";



export async function createSessionClient() {
    const session = await getSession();

    if (!session) {
        throw new Error("No session");
    }

    const client = new Client()
        .setEndpoint(appwriteConfig.url)
        .setProject(appwriteConfig.projectId)
        .setSession(session);

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
        get database() {
            return new TablesDB(client);
        }
    };
}

export async function createClient(session?: string) {
    const client = new Client()
        .setEndpoint(appwriteConfig.url)
        .setProject(appwriteConfig.projectId)
        .setSession(session || "");

    return {
        get account() {
            return new Account(client);
        },
        get database() {
            return new TablesDB(client);
        },
    };
}