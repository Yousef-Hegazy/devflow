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
  questionId: string;
};

//#region getUserQuestionVote
export async function getUserQuestionVote({
  userId,
  questionId,
}: {
  userId: string;
  questionId: string;
}) {
  "use cache";

  cacheLife({ revalidate: DEFAULT_CACHE_DURATION });

  cacheTag(
    CACHE_KEYS.QUESTION_DETAILS + questionId,
    CACHE_KEYS.USER_QUESTION_VOTE + userId + questionId,
  );

  try {
    const userVote = await db.query.vote.findFirst({
      where: and(
        eq(vote.questionId, questionId),
        eq(vote.authorId, userId)
      ),
    });

    return userVote || null;
  } catch (error) {
    logger.error(error, "Error fetching votes:");
    return null;
  }
}
//#endregion

const UserQuestionVotes = async ({
  upvotes,
  downvotes,
  userId,
  questionId,
}: Props) => {
  const vote = getUserQuestionVote({ userId, questionId });

  return (
    <Suspense fallback={<Skeleton className="h-6 w-27.5" />}>
      <Votes
        upvotes={upvotes}
        downvotes={downvotes}
        userId={userId}
        questionId={questionId}
        vote={vote}
      />
    </Suspense>
  );
};

export default UserQuestionVotes;
