import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import { createAdminClient } from "@/lib/appwrite/config";
import { Question, Tag } from "@/lib/types/appwrite";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { EMPTY_QUESTION } from "@/lib/constants/states";
import handleError from "@/lib/errors";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";

const getTagDetails = async (tagId: string) => {
  "use cache";
  cacheLife({
    revalidate: DEFAULT_CACHE_DURATION,
  });
  cacheTag(CACHE_KEYS.TAGS_LIST, tagId);

  try {
    const { database } = await createAdminClient();

    const tag = database.getRow<Tag>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tagsTableId,
      rowId: tagId,
    });

    return tag;
  } catch (err) {
    handleError(err);

    return null;
  }
};

const getTagQuestions = async ({
  tagId,
  page = 1,
  pageSize = 10,
  query = "",
}: {
  tagId: string;
  page: number;
  pageSize: number;
  query?: string;
}) => {
  "use cache";

  cacheLife({
    revalidate: DEFAULT_CACHE_DURATION,
  });

  cacheTag(
    CACHE_KEYS.QUESTIONS_LIST,
    CACHE_KEYS.QUESTIONS_LIST + String(page) + String(pageSize) + query + tagId,
  );

  try {
    const { database } = await createAdminClient();

    const queries = [
      Query.limit(pageSize),
      Query.offset((page - 1) * pageSize),
      Query.select([
        "$id",
        "title",
        "views",
        "answersCount",
        "upvotes",
        "downvotes",
        "author.name",
        "author.image",
        "tags.*",
        "tags.tag.title",
      ]),
      Query.equal("tags.tag.$id", tagId),
    ];

    queries.push(Query.orderDesc("$createdAt"));

    // switch (filter) {
    //   case "recommended":
    //     return { total: 0, rows: [] };
    //   case "popular":
    //     queries.push(Query.orderDesc("upvotes"));
    //     break;
    //   case "unanswered":
    //     queries.push(Query.equal("answersCount", 0));
    //     break;
    //   default:
    //     queries.push(Query.orderDesc("$createdAt"));
    //     break;
    // }

    if (query) {
      queries.push(Query.contains("title", query));
    }

    const question = await database.listRows<Question>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.questionsTableId,
      queries,
    });

    return question;
  } catch (err) {
    const error = handleError(err);

    return {
      total: 0,
      rows: [],
      error: error.message,
    };
  }
};

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
};

const TagDetailsPage = async ({ params, searchParams }: Props) => {
  const [{ id }, { q, page, pageSize }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [tag, tagQuestions] = await Promise.all([
    getTagDetails(id),
    getTagQuestions({
      tagId: id,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      query: q?.toLowerCase() || "",
    }),
  ]);

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">
          <span>{tag?.title}</span>{" "}
          {tagQuestions.total ? (
            <>
              •{" "}
              <span className="primary-text-gradient">
                {tagQuestions.total > 99 ? "99+" : tagQuestions.total}
              </span>
            </>
          ) : (
            ""
          )}
        </h1>
      </section>

      <section className="mt-11">
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
        />
      </section>

      <DataRenderer
        success={!("error" in tagQuestions)}
        error={
          "error" in tagQuestions ? { message: tagQuestions.error } : undefined
        }
        data={"error" in tagQuestions ? [] : tagQuestions.rows}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question.$id} question={question} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default TagDetailsPage;
