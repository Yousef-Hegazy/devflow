import { signIn, signUp } from "@/actions/auth";
import { toastManager } from "@/components/ui/toast";
import useAuthStore from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useSignUp() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: signUp,
        onSuccess: (user) => {
            setUser(user);
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
        mutationFn: signIn,
        onSuccess: (user) => {
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