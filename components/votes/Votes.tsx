"use client";

import { Vote, VoteType } from "@/lib/appwrite/types";
import {
  useDownvoteAnswer,
  useDownvoteQuestion,
  useUpvoteAnswer,
  useUpvoteQuestion,
} from "@/lib/queries/votes";
import { cn, formatNumber } from "@/lib/utils";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { use } from "react";
import LoadingButton from "../ui/LoadingButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  upvotes: number;
  downvotes: number;
  userId?: string;
  questionId: string;
  answerId?: string;
  vote?: Promise<Vote | null>;
};

const Votes = ({
  upvotes,
  downvotes,
  userId,
  questionId,
  answerId,
  vote: votePromise,
}: Props) => {
  let vote = null;
  let hasUpvoted = false;
  let hasDownvoted = false;

  if (votePromise) {
    vote = use<Vote | null>(votePromise);
    hasUpvoted = vote?.type === VoteType.UPVOTE;
    hasDownvoted = vote?.type === VoteType.DOWNVOTE;
  }

  const formattedUpvotes = formatNumber(upvotes);
  const formattedDownvotes = formatNumber(downvotes);

  const isQuestion = !!(questionId && !answerId);
  const targetId = isQuestion ? questionId : answerId || "";

  const { mutate: upvoteQuestion, isPending: isUpvotingQuestion } =
    useUpvoteQuestion();
  const { mutate: downvoteQuestion, isPending: isDownvotingQuestion } =
    useDownvoteQuestion();
  const { mutate: upvoteAnswer, isPending: isUpvotingAnswer } =
    useUpvoteAnswer();
  const { mutate: downvoteAnswer, isPending: isDownvotingAnswer } =
    useDownvoteAnswer();

  const isUpvoting = isQuestion ? isUpvotingQuestion : isUpvotingAnswer;
  const isDownvoting = isQuestion ? isDownvotingQuestion : isDownvotingAnswer;

  const upvote = isQuestion
    ? () => upvoteQuestion(targetId)
    : () => upvoteAnswer({ answerId: targetId, questionId });
  const downvote = isQuestion
    ? () => downvoteQuestion(targetId)
    : () => downvoteAnswer({ answerId: targetId, questionId });

  return (
    <Tooltip disabled={!!userId}>
      <TooltipTrigger
        render={
          <div className="flex-center gap-2.5">
            <div className="flex-center gap-1.5">
              <LoadingButton
                isLoading={isUpvoting}
                wholeLoading
                size="icon-sm"
                variant="ghost"
                disabled={!userId || isDownvoting}
                onClick={upvote}
              >
                <ArrowBigUp
                  className={cn("text-green-500", {
                    "fill-green-500": hasUpvoted,
                  })}
                />
              </LoadingButton>

              <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
                <p className="subtle-medium text-dark400_light900">
                  {formattedUpvotes}
                </p>
              </div>
            </div>

            <div className="flex-center gap-1.5">
              <LoadingButton
                isLoading={isDownvoting}
                wholeLoading
                disabled={!userId || isUpvoting}
                size="icon-sm"
                variant="ghost"
                onClick={downvote}
              >
                <ArrowBigDown
                  className={cn("text-rose-500", {
                    "fill-rose-500": hasDownvoted,
                  })}
                />
              </LoadingButton>

              <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
                <p className="subtle-medium text-dark400_light900">
                  {formattedDownvotes}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <TooltipContent>You must be logged in to vote.</TooltipContent>
    </Tooltip>
  );
};

export default Votes;
