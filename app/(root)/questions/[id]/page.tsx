import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import { createAdminClient } from "@/lib/appwrite/config";
import { Question } from "@/lib/appwrite/types/appwrite";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { EMPTY_QUESTION } from "@/lib/constants/states";
import handleError from "@/lib/errors";
import { getTimeAgo } from "@/lib/helpers/date";
import { formatNumber } from "@/lib/utils";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Query } from "node-appwrite";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getQuestionDetails = async (id: string) => {
  "use cache";

  cacheLife({
    revalidate: DEFAULT_CACHE_DURATION,
  });

  cacheTag(CACHE_KEYS.QUESTIONS_LIST, id);

  try {
    const { database } = await createAdminClient();

    const question = await database.getRow<Question>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.questionsTableId,
      rowId: id,
      queries: [
        Query.select([
          "*",
          "author.name",
          "author.image",
          "tags.*",
          "tags.tag.title",
        ]),
      ],
    });

    return question;
  } catch (error) {
    handleError(error);
    return null;
  }
};

const QuestionDetailsPage = async ({ params }: Props) => {
  const { id } = await params;
  const question = await getQuestionDetails(id);

  return (
    <DataRenderer
      error={!question ? { message: "Question not found." } : undefined}
      empty={EMPTY_QUESTION}
      data={question ? [question] : undefined}
      success={!!question}
      render={([question]) => (
        <>
          <div className="flex-start w-full flex-col">
            <div className="flex w-full flex-col-reverse justify-between">
              <div className="flex items-center justify-start gap-1">
                <UserAvatar
                  user={question.author}
                  classNames={{
                    avatar: "size-[22px]",
                    fallback: "text-[10px]",
                  }}
                />

                <Link href={`/profile/${question.author.$id}`}>
                  <p className="paragraph-semibold text-dark300_light700">
                    {question.author.name.split(" ")[0]}
                  </p>
                </Link>
              </div>

              <div className="flex justify-end">
                <p>Votes</p>
              </div>
            </div>

            <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
              {question.title}
            </h2>
          </div>

          <div className="mt-5 mb-8 flex flex-wrap gap-4">
            <Metric
              imgUrl="/icons/clock.svg"
              alt="clock icon"
              value={` asked ${getTimeAgo(new Date(question.$createdAt))}`}
              title=""
              classNames={{
                text: "small-regular text-dark400_light700",
              }}
            />

            <Metric
              imgUrl="/icons/message.svg"
              alt="message icon"
              value={question.answersCount}
              title=""
              classNames={{
                text: "small-regular text-dark400_light700",
              }}
            />

            <Metric
              imgUrl="/icons/eye.svg"
              alt="eye icon"
              value={formatNumber(question.views)}
              title=""
              classNames={{
                text: "small-regular text-dark400_light700",
              }}
            />
          </div>

          <p>Preview Content</p>

          <div className="mt-8 flex-wrap gap-2">
            {question.tags.map(({ tag }) => (
              <TagCard key={tag.$id} $id={tag.$id} name={tag.title} compact />
            ))}
          </div>
        </>
      )}
    />
  );
};

export default QuestionDetailsPage;
