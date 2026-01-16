import { auth } from "@/auth";
import { logger } from "@/pino";

export async function requireAuth(c: any, next: any) {
  try {
    const session = await auth.api.getSession({ headers: c.req.headers });

    if (!session) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    c.set("session", session);
    await next();
  } catch (err: unknown) {
    logger.error({ err }, "auth middleware error");
    return c.json({ message: "Unauthorized" }, 401);
  }
}
