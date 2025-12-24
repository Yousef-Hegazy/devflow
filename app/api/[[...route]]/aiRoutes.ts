import { AIAnswerSchema } from "@/lib/validators/questionSchemas";
import { logger } from "@/pino";
import { google } from '@ai-sdk/google';
import { zValidator } from "@hono/zod-validator";
import { generateText } from "ai";
import { Hono } from "hono";
import z from "zod";



const aiRoutes = new Hono()
    .post("/answer", zValidator("json", AIAnswerSchema, (res, c) => {

        if (!res.success) {
            const errors = z.treeifyError(res.error).properties;
            const errorMessages = errors ? Object.values(errors).flatMap((err) => err.errors || []) : [];
            return c.json(
                { message: errorMessages.join(", ") || "Invalid request data" },
                400
            )
        }
    }), async (c) => {
        try {
            const body = c.req.valid("json");

            const { question, content, answer } = body;

            const { text } = await generateText({
                model: google("gemini-2.5-flash"),
                prompt: `Generate a markdown-formatted answer for the following question:\n\nQuestion: ${question}\n\nBased on this content: ${content}. Take into account the following draft answer: ${answer}. Prioritize the draft answer if it was correct and relevant.`,
                system:
                    "You are a helpful assistant that provides informative responses in markdown format. Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary. For code blocks, use short-form smaller case language identifiers (e.g., ```js for JavaScript). Ensure the response is clear, concise, and well-structured.",
                maxRetries: 0,
            });

            return c.json({ success: true, text }, 200);
        } catch (err: unknown) {
            const e = err as Record<string, unknown>;
            const message = typeof e?.message === "string" ? e.message : "Internal Server Error";
            const status = typeof e?.status === "number" ? e.status : 500;
            logger.error({ err, message, status }, "ai/answers route error");

            throw new Error(message);
        }
    });

export default aiRoutes;