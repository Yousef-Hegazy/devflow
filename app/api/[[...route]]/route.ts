import { publicApiRoutes } from "@/lib/constants/server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { handle } from "hono/vercel";
import { AppwriteException } from "node-appwrite";

const app = new Hono().basePath("/api");

app.onError((err, c) => {
    if (err instanceof AppwriteException) {
        if (err.code === 401 && !publicApiRoutes.some(route => c.req.url.includes(route))) {
            return c.redirect("/sign-in");
        }
        console.log(err)

        return c.json({ message: err.message, cause: err.cause }, err.code as ContentfulStatusCode);
    }

    if (err instanceof HTTPException) {
        console.log(err.message)
        return c.json({ message: err.message }, err.status);
    }

    console.log(err)


    return c.json({ message: err.message, cause: err.cause }, 500);

})




export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);