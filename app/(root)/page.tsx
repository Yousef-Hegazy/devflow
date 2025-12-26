import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/appwrite/config";
import { Question } from "@/lib/appwrite/types";
import { DEFAULT_CACHE_DURATION, HomeFilterType } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { EMPTY_QUESTION } from "@/lib/constants/states";
import handleError from "@/lib/errors";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Query } from "node-appwrite";

interface Props {
  searchParams: Promise<{
    q?: string;
    filter?: HomeFilterType;
    page?: string;
    pageSize?: string;
  }>;
}

const searchQuestions = async ({
  page = 1,
  pageSize = 10,
  query = "",
  filter = "all",
}: {
  page: number;
  pageSize: number;
  query?: string;
  filter?: HomeFilterType;
}) => {
  "use cache";

  cacheLife({
    revalidate: DEFAULT_CACHE_DURATION,
  });

  cacheTag(
    CACHE_KEYS.QUESTIONS_LIST,
    String(page),
    String(pageSize),
    query,
    filter,
  );

  try {
    const { database } = await createAdminClient();

    const queries = [
      Query.limit(pageSize),
      Query.offset((page - 1) * pageSize),
      Query.select([
        "*",
        "author.name",
        "author.image",
        "tags.*",
        "tags.tag.title",
      ]),
    ];

    switch (filter) {
      case "recommended":
        return { total: 0, rows: [] };
      case "popular":
        queries.push(Query.orderDesc("upvotes"));
        break;
      case "unanswered":
        queries.push(Query.equal("answersCount", 0));
        break;
      default:
        queries.push(Query.orderDesc("$createdAt"));
        break;
    }

    if (query) {
      queries.push(Query.contains("title", query));
    }

    const res = await database.listRows<Question>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.questionsTableId,
      queries,
    });

    return res;
  } catch (e) {
    const error = handleError(e);
    return {
      total: 0,
      rows: [],
      error: error.message,
    };
  }
};

export default async function Home({ searchParams }: Props) {
  const { q, filter, page, pageSize } = await searchParams;

  const questions = await searchQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: q?.toLowerCase() || "",
    filter,
  });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          render={<Link href="/ask-question" />}
          className="primary-gradient! text-light-900! min-h-11.5! border-0! px-4! py-3!"
        >
          Ask a Question
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch placeholder="Search Questions..." />
      </section>
      <HomeFilter />
      <div className="mt-5 flex w-full flex-col gap-6">
        <DataRenderer
          success={!("error" in questions)}
          error={
            "error" in questions ? { message: questions.error } : undefined
          }
          data={"error" in questions ? [] : questions.rows}
          empty={EMPTY_QUESTION}
          render={(data) => (
            <>
              {data.map((question) => (
                <QuestionCard key={question.$id} question={question} />
              ))}
            </>
          )}
        />
      </div>
    </>
  );
}
