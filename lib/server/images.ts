import "server-only";
import { appwriteConfig } from "../appwrite/config";



export function getAppwriteInitialsAvatarUrl(name: string, width?: number, height?: number) {
    const url = `${appwriteConfig.url}/avatars/initials`;

    const sp = new URLSearchParams();

    sp.append("name", name);

    if (width) sp.append("width", width.toString());
    if (height) sp.append("height", height.toString());

    sp.append("project", appwriteConfig.projectId);

    return `${url}?${sp.toString()}`;
}