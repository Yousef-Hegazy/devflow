import { QuestionWithMetadata } from "@/actions/questions";
import { getTagDetails, getTagQuestions } from "@/actions/tags";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import { EMPTY_QUESTION } from "@/lib/constants/states";

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
        success={!tagQuestions.error}
        error={
          tagQuestions.error ? { message: tagQuestions.error } : undefined
        }
        data={tagQuestions.rows as unknown as QuestionWithMetadata[]}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default TagDetailsPage;
