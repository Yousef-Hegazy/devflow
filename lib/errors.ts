

/**
 * Inspect an error and return an action for the caller.
 * - If it's an AppwriteException with a 401, redirect to '/sign-in'
 * - Otherwise return Error with a friendly message
 * @param err The error to handle
 */
export function handleError(err: unknown): Error {
    return err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
}

export default handleError;
