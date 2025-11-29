import { createAdminClient } from "@/lib/appwrite/config";
import { Hono } from "hono";
import { ID } from "node-appwrite";

const app = new Hono()
    .get("/register", async (c) => {
        // const {account} = await createAdminClient();

        // await account.create({
        //     userId: ID.unique(),
        //     email: "",
        //     password: "",
        // });

        return c.json({ message: "Register route" });
    });

export default app;