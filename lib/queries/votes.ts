import { downvoteQuestion, getUserQuestionVote, upvoteQuestion } from "@/actions/votes";
import { toastManager } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_CACHE_DURATION } from "../constants";
import { CACHE_KEYS } from "../constants/cacheKeys";


export function useUpvoteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: string) => upvoteQuestion(questionId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_QUESTION_VOTE] });
            toastManager.add({
                title: "Vote Recorded",
                description: "Your vote has been recorded successfully.",
                type: "success",
            });
        },
        onError: (error) => {
            toastManager.add({
                title: "Failed to Vote",
                description: error.message || "An error occurred while recording your vote.",
                type: "error",
            })
        }
    })
}

export function useDownvoteQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionId: string) => downvoteQuestion(questionId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER_QUESTION_VOTE] });
            toastManager.add({
                title: "Vote Recorded",
                description: "Your vote has been recorded successfully.",
                type: "success",
            });
        },
        onError: (error) => {
            toastManager.add({
                title: "Failed to Vote",
                description: error.message || "An error occurred while recording your vote.",
                type: "error",
            })
        }
    })
}


export function useGetUserQuestionVote(questionId: string, userId?: string) {
    return useQuery({
        queryKey: [CACHE_KEYS.USER_QUESTION_VOTE, userId, questionId],
        queryFn: () => getUserQuestionVote({ userId: userId || "", questionId }),
        staleTime: DEFAULT_CACHE_DURATION,
        enabled: !!(userId && questionId),
    });
}