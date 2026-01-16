import { Skeleton } from "@/components/ui/skeleton";
import Votes from "@/components/votes/Votes";
import { db } from "@/db/client";
import { vote } from "@/db/db-schema";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { logger } from "@/pino";
import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

type Props = {
  upvotes: number;
  downvotes: number;
  userId: string;
  answerId: string;
  questionId: string;
};

//#region getUserAnswerVote
export async function getUserAnswerVote({
  userId,
  answerId,
  questionId,
}: {
  userId: string;
  answerId: string;
  questionId: string;
}) {
  "use cache";

  cacheLife({ revalidate: DEFAULT_CACHE_DURATION });

  cacheTag(
    CACHE_KEYS.QUESTION_ANSWERS + questionId,
    CACHE_KEYS.ANSWER_VOTES + userId + answerId,
  );

  try {
    const userVote = await db.query.vote.findFirst({
      where: and(
        eq(vote.answerId, answerId),
        eq(vote.authorId, userId)
      ),
    });

    return userVote || null;
  } catch (error) {
    logger.error(error, "Error fetching answer votes:");
    return null;
  }
}
//#endregion

const UserAnswerVotes = async ({
  upvotes,
  downvotes,
  userId,
  answerId,
  questionId,
}: Props) => {
  const vote = getUserAnswerVote({ userId, answerId, questionId });

  return (
    <Suspense fallback={<Skeleton className="h-6 w-27.5" />}>
      <Votes
        upvotes={upvotes}
        downvotes={downvotes}
        userId={userId}
        answerId={answerId}
        vote={vote}
        questionId={questionId}
      />
    </Suspense>
  );
};

export default UserAnswerVotes;
