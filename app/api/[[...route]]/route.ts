import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import aiRoutes from "./aiRoutes";

const app = new Hono()
    .basePath('/api')
    .route("/ai", aiRoutes)
    .onError(async (error, c) => {
        if (error instanceof HTTPException) {
            const err = await error.getResponse().json();

            return c.json(
                { message: err?.message || "An error occurred" },
                error.status
            )
        }

        return c.json(
            { message: error.message || "Internal Server Error" },
            500
        )

    });

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)

export type APIType = typeof app;