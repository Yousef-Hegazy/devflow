import z from "zod";

export const SignInSchema = z.object({
    email: z.email({ error: "Please enter a valid email address" }).min(1, { error: "Email is required" }).trim(),
    password: z.string({ error: "Password is required" }).trim().min(8, { error: "Password must be at least 8 characters long" }),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;


export const SignUpSchema = z.object({
    username: z.string({error: "Username is required"}).min(3, { error: "Username must be at least 3 characters long" }).max(30, { error: "Username must be at most 30 characters long" }).trim(),
    name: z.string().min(1, { error: "Name is required" }).trim(),
    email: z.email({ error: "Please enter a valid email address" }).min(1, { error: "Email is required" }).trim(),
    password: z.string().min(8, { error: "Password must be at least 8 characters long" }).trim(),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;