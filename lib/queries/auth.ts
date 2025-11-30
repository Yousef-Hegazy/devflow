import { useMutation } from "@tanstack/react-query";
import { client } from "../rpc";

export function useGithubLogin() {
    return useMutation({
        mutationFn: () => client.api.auth.login.github.$get(),
        onSuccess: (data) => {

        },
        onError: (error) => {
            console.log(error.message);
        }
    })
}