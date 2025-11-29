import { publicApiRoutes } from "@/lib/constants/server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { handle } from "hono/vercel";
import { AppwriteException } from "node-appwrite";
import auth from "./auth";



const app = new Hono().basePath("/api");

app.onError((err, c) => {
    if (err instanceof AppwriteException) {
        if (err.code === 401 && !publicApiRoutes.some(route => c.req.url.includes(route))) {
            return c.redirect("/sign-in");
        }

        return c.json({ message: `${err.type} - ${err.message}`, cause: err.cause }, err.code as ContentfulStatusCode);
    }

    if (err instanceof HTTPException) {
        console.log(err.cause)
        return err.getResponse()
    }

    return c.json({ message: err.message, cause: err.cause }, 500);

})

const routes = app.route("/auth", auth);



export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const DELETE = handle(routes);