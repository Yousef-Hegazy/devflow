import { signIn, signUp } from "@/actions/auth";
import { toastManager } from "@/components/ui/toast";
import useAuthStore from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SignInSchemaType, SignUpSchemaType } from "../validators/authSchemas";
import { logger } from "@/pino";

export function useSignUp() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: (data: SignUpSchemaType) => signUp(data),
        onSuccess: (user) => {
            setUser(user);
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
        mutationFn: (data: SignInSchemaType) => signIn(data),
        onSuccess: (user) => {
            console.log({ user })
            setUser(user);
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