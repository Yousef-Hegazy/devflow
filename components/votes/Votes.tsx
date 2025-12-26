"use client";

import { VoteType } from "@/lib/appwrite/types";
import {
  useDownvoteQuestion,
  useGetUserQuestionVote,
  useUpvoteQuestion,
} from "@/lib/queries/votes";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import LoadingButton from "../ui/LoadingButton";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  upvotes: number;
  // hasUpvoted?: boolean;
  downvotes: number;
  // hasDownvoted?: boolean;
  userId?: string;
  questionId: string;
};

const Votes = ({
  upvotes,
  downvotes,
  // hasDownvoted,
  // hasUpvoted,
  userId,
  questionId,
}: Props) => {
  const formattedUpvotes = formatNumber(upvotes);
  const formattedDownvotes = formatNumber(downvotes);

  const { mutate: upvote, isPending: isUpvoting } = useUpvoteQuestion();
  const { mutate: downvote, isPending: isDownvoting } = useDownvoteQuestion();

  const { data: vote, isPending: isVoteLoading } = useGetUserQuestionVote(
    questionId,
    userId,
  );
  const hasUpvoted = vote?.type === VoteType.UPVOTE;
  const hasDownvoted = vote?.type === VoteType.DOWNVOTE;

  return isVoteLoading ? (
    <Skeleton className="h-6 w-27.5" />
  ) : (
    <Tooltip disabled={!!userId}>
      <TooltipTrigger
        render={
          <div className="flex-center gap-2.5">
            <div className="flex-center gap-1.5">
              <LoadingButton
                isLoading={isUpvoting}
                wholeLoading
                size="icon-xs"
                variant="ghost"
                disabled={!userId || isDownvoting}
                onClick={() => upvote(questionId)}
              >
                <Image
                  src={hasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
                  width={18}
                  height={18}
                  alt="Upvote"
                  aria-label="upvote"
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
                size="icon-xs"
                variant="ghost"
                onClick={() => downvote(questionId)}
              >
                <Image
                  src={
                    hasDownvoted
                      ? "/icons/downvoted.svg"
                      : "/icons/downvote.svg"
                  }
                  width={18}
                  height={18}
                  alt="Downvote"
                  aria-label="downvote"
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
