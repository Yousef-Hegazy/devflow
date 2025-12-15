import { redirect } from "next/navigation";
import { AppwriteException } from "node-appwrite";


/**
 * Inspect an error and return an action for the caller.
 * - If it's an AppwriteException with a 401, redirect to '/sign-in'
 * - Otherwise return Error with a friendly message
 * @param err The error to handle
 */
export function handleError(err: unknown): Error {
    if (err instanceof AppwriteException) {
        if (err.code === 401) {
            redirect('/sign-in');
        }

        return new Error(err.message || "Server error");
    }

    return err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
}

export default handleError;
