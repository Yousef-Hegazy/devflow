import { createAuthClient } from "better-auth/client"
import { usernameClient } from "better-auth/client/plugins";
const authClient = createAuthClient({
    plugins: [
        usernameClient()
    ]
});

export default authClient;