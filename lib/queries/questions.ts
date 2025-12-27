import { answerQuestion, createQuestion, isQuestionSavedByUser, toggleSaveQuestion, updateQuestion } from "@/actions/questions";
import { toastManager } from "@/components/ui/toast";
import { logger } from "@/pino";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CACHE_KEYS } from "../constants/cacheKeys";
import { client } from "../rpc";
import { AIAnswerSchemaType, AnswerSchemaType, AskQuestionSchemaType } from "../validators/questionSchemas";

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
            logger.info({ error })
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
            logger.info({ error })
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

export function useAIAnswer() {
    return useMutation({
        mutationFn: async ({ question, content, answer }: AIAnswerSchemaType) => {
            const res = await client.api.ai.answer.$post({
                json: { question, content, answer }
            });


            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to Generate AI Answer")
            }
            const data = await res.json();
            return data;
        },
        onError: (error) => {
            toastManager.add({
                title: "Failed to Generate AI Answer",
                description: error.message || "An error occurred while generating the AI answer.",
                type: "error",
            })
        },
        retry: 0,
    })
}


export function useToggleSaveQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, questionId }: { userId: string, questionId: string }) => toggleSaveQuestion(userId, questionId),
        onSuccess: async (res, { userId, questionId }) => {
            await queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_COLLECTIONS, userId, questionId] });

            toastManager.add({
                title: res === null ? "Question Removed" : "Question Saved",
                description: res === null ? "The question has been removed from your collection." : "The question has been saved to your collection.",
                type: "success",
            });
        },
        onError: (error) => {
            toastManager.add({
                title: "Failed to complete action",
                description: error.message || "An error occurred while performing the action.",
                type: "error",
            })
        }
    })
}

export function useIsQuestionSavedByUser({ userId, questionId }: { userId: string, questionId: string }) {
    return useQuery({
        queryKey: [CACHE_KEYS.USER_COLLECTIONS, userId, questionId],
        queryFn: () => isQuestionSavedByUser(userId, questionId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}