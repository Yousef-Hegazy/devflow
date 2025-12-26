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
    const { database } = await createAdminClient();
    const votes = await database.listRows<Vote>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.votesTableId,
      queries: [
        Query.equal("question", questionId),
        Query.equal("author", userId),
        Query.limit(1),
      ],
    });

    const vote = votes.rows[0];
    return vote;
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
