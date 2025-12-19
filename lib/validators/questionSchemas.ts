import z from "zod";

export const AskQuestionSchema = z.object({
    title: z
        .string({ error: "Title is required" })
        .trim()
        .min(5, { error: "Title should be at least 5 characters" })
        .max(100, { error: "Title must be less than 100 characters" }),
    content: z
        .string({ error: "Content is required" })
        .trim()
        .min(1, { error: "Content is required" }),
    tags: z
        .array(
            z
                .string({ error: "Tag title is required" })
                .trim()
                .min(1, { error: "Tag title cannot be empty" })
                .max(30, { error: "Tag title must be less than 30 characters" })
        )
        .min(1, { error: "At least one tag is required" })
        .max(3, { error: "Maximum 3 tags allowed" }),
});

export type AskQuestionSchemaType = z.infer<typeof AskQuestionSchema>;

export const AnswerSchema = z.object({
    content: z.string().min(30, "Answer must be at least 30 characters long."),
});

export type AnswerSchemaType = z.infer<typeof AnswerSchema>;