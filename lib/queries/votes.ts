import { downvoteAnswer, downvoteQuestion, upvoteAnswer, upvoteQuestion } from "@/actions/votes";
import { useMutation } from "@tanstack/react-query";


export function useUpvoteQuestion() {
    return useMutation({
        mutationFn: (questionId: string) => upvoteQuestion(questionId),
    })
}

export function useDownvoteQuestion() {
    return useMutation({
        mutationFn: (questionId: string) => downvoteQuestion(questionId),
    })
}


export function useUpvoteAnswer() {
    return useMutation({
        mutationFn: ({answerId, questionId}: {answerId: string; questionId: string;}) => upvoteAnswer(answerId, questionId),
    })
}

export function useDownvoteAnswer() {
    return useMutation({
        mutationFn: ({answerId, questionId}: {answerId: string; questionId: string;}) => downvoteAnswer(answerId, questionId),
    })
}
