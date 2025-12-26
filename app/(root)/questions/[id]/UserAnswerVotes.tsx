import { Skeleton } from "@/components/ui/skeleton";
import Votes from "@/components/votes/Votes";
import { createAdminClient } from "@/lib/appwrite/config";
import { Vote } from "@/lib/appwrite/types";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { logger } from "@/pino";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";
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
    const { database } = await createAdminClient();
    const votes = await database.listRows<Vote>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.votesTableId,
      queries: [
        Query.equal("answer", answerId),
        Query.equal("author", userId),
        Query.limit(1),
      ],
    });

    const vote = votes.rows[0];
    return vote;
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
