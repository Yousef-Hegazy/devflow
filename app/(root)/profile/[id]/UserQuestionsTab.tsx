"use cache";

import { searchQuestions } from "@/actions/questions";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import AppPagination from "@/components/navigation/AppPagination";
import { EMPTY_QUESTION } from "@/lib/constants/states";
import { HomeFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";

type Props = {
  userId: string;
  searchParams: PaginationSearchParams<HomeFilterType>;
};

const UserQuestionsTab = async ({ userId, searchParams }: Props) => {
  const { p, ps, q, filter } = searchParams;

  const questions = await searchQuestions({
    page: Number(p) || 1,
    pageSize: Number(ps) || 10,
    query: q || "",
    userId: userId,
    filter: filter || "all",
  });

  return (
    <>
      <div className="mt-5 flex w-full flex-col gap-6">
        <DataRenderer
          success={!("error" in questions)}
          error={
            !!questions.error ? { message: questions.error } : undefined
          }
          data={"error" in questions ? [] : questions.rows}
          empty={EMPTY_QUESTION}
          render={(data) => (
            <>
              {data.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </>
          )}
        />
      </div>

      {/* Pagination */}
      <div className="mt-10 flex w-full justify-center">
        <AppPagination
          page={Number(p) || 1}
          totalItems={"error" in questions ? 1 : questions.total}
          pageSize={Number(ps) || 10}
        />
      </div>
    </>
  );
};

export default UserQuestionsTab;
