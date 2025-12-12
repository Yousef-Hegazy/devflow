"use server";

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";


export async function setCookie(...args: [key: string, value: string, cookie?: Partial<ResponseCookie>] | [options: ResponseCookie]) {
    const cs = await cookies();

    cs.set(...args);
}

export async function deleteCookie(name: string) {
    const cs = await cookies();
    cs.delete(name);
}

export async function getCookie(name: string): Promise<string | undefined> {
    const cs = await cookies();
    return cs.get(name)?.value;
}
