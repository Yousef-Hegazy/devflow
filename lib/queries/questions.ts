import { answerQuestion, createQuestion, updateQuestion } from "@/actions/questions";
import { toastManager } from "@/components/ui/toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AnswerSchemaType, AskQuestionSchemaType } from "../validators/questionSchemas";

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

export function useUpdateQuestion() {
    const router = useRouter();

    return useMutation({
        mutationFn: async ({ userId, questionId, question }: { userId: string, questionId: string, question: AskQuestionSchemaType }) => updateQuestion(userId, questionId, question),
        onSuccess: (questionId) => {
            toastManager.add({
                title: "Question Updated",
                description: "Your question has been updated successfully.",
                type: "success",
            });

            router.push(`/questions/${questionId}`);
        },
        onError: (error) => {
            console.log({ error })
            toastManager.add({
                title: "Failed to Update Question",
                description: error.message || "An error occurred while updating the question.",
                type: "error",
            })
        }
    })
}

export function useAnswerQuestion() {
    return useMutation({
        mutationFn: ({ answer, questionId }: { answer: AnswerSchemaType, questionId: string }) => answerQuestion(answer, questionId),
        onSuccess: () => {
            toastManager.add({
                title: "Answer Submitted",
                description: "Your answer has been submitted successfully.",
                type: "success",
            });
        },
        onError: (error) => {
            toastManager.add({
                title: "Failed to Submit Answer",
                description: error.message || "An error occurred while submitting your answer.",
                type: "error",
            })
        }
    })
}    