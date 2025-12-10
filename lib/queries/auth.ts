import { toastManager } from "@/components/ui/toast";
import useAuthStore from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client } from "../rpc";
import { SignInSchemaType, SignUpSchemaType } from "../validators/authSchemas";

export function useSignUp() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (json: SignUpSchemaType) => {
            const res = await client.api.auth.register.$post({
                json
            });

            if (!res.ok) {
                const err = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error((err as any)?.message || "Failed to register user", { cause: (err as any)?.cause });
            }

            return await res.json();
        },
        onSuccess: (data) => {
            setUser(data.user);
            router.push("/");
        },
        onError: (error) => {
            console.log(error);
            toastManager.add({
                title: "Registration Failed",
                description: error.message || "An error occurred during registration.",
                type: "error",
            })
        }
    })
}

export function useSignIn() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (json: SignInSchemaType) => {
            const res = await client.api.auth.login.$post({
                json
            });

            if (!res.ok) {
                const err = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error((err as any)?.message || "Please check your credentials", { cause: (err as any)?.cause });
            }

            return await res.json();
        },
        onSuccess: (data) => {
            setUser(data.user);
            router.push("/");
        },
        onError: (error) => {
            toastManager.add({
                title: "Login Failed",
                description: error.message || "An error occurred during login.",
                type: "error",
            })
        }
    })
}