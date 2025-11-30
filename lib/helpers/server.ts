import "server-only";
import { cookies } from "next/headers";
import { appwriteConfig, createSessionClient } from "../appwrite/config";

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(appwriteConfig.sessionName);
    return session?.value || null;
}

export async function getCurrentUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return user;
    } catch (error) {
        console.log(error)
        return null;
    }
}

export async function isAuthenticated() {
    const session = await getSession();
    return !!session;
}

export async function getAppwriteInitialsAvatarUrl(name: string, width?: number, height?: number) {
    const url = `${appwriteConfig.url}/avatars/initials`;

    const sp = new URLSearchParams();

    sp.append("name", name);

    if (width) sp.append("width", width.toString());
    if (height) sp.append("height", height.toString());

    sp.append("project", appwriteConfig.projectId);

    return `${url}?${sp.toString()}`;
}