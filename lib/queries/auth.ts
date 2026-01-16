import authClient from "@/auth-client";
import { toastManager } from "@/components/ui/toast";
import { logger } from "@/pino";
import useAuthStore from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SignInSchemaType, SignUpSchemaType } from "../validators/authSchemas";

export function useSignUp() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: (data: SignUpSchemaType) => authClient.signUp.email({
            name: data.name,
            email: data.email,
            password: data.password,
            displayUsername: data.username,
        }),
        onSuccess: (res) => {
            setUser(res.data?.user);
            router.push("/");
        },
        onError: (error) => {
            logger.info({ error });
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
        mutationFn: (data: SignInSchemaType) => authClient.signIn.email({
            email: data.email,
            password: data.password,
        }),
        onSuccess: (res) => {
            setUser(res.data?.user);
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