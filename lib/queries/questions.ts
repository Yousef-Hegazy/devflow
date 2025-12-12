import { createQuestion } from "@/actions/questions";
import { toastManager } from "@/components/ui/toast";
import { useMutation } from "@tanstack/react-query";
import { AskQuestionSchemaType } from "../validators/questionSchemas";
import { useRouter } from "next/navigation";

export function useCreateQuestion() {
    const router = useRouter();

    return useMutation({
        mutationFn: async ({ userId, question }: { userId: string, question: AskQuestionSchemaType }) => createQuestion(userId, question),
        onSuccess: (questionId) => {
            toastManager.add({
                title: "Question Created",
                description: "Your question has been created successfully.",
                type: "success",
            });

            router.push(`/questions/${questionId}`);
        },
        onError: (error) => {
            console.log({ error })
            toastManager.add({
                title: "Failed to Create Question",
                description: error.message || "An error occurred while creating the question.",
                type: "error",
            })
        }
    })
}