import z from "zod";

export const SignInSchema = z.object({
    email: z.email(),
    password: z.string({ error: "Password is required" }).trim().min(6, { error: "Password must be at least 6 characters long" }),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;