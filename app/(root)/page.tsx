import { searchQuestions } from "@/actions/questions";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import HomeFilter from "@/components/filters/HomeFilter";
import AppPagination from "@/components/navigation/AppPagination";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { homeFilters } from "@/lib/constants/filters";
import { EMPTY_QUESTION } from "@/lib/constants/states";
import { HomeFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";
import Link from "next/link";

interface Props {
  searchParams: Promise<PaginationSearchParams<HomeFilterType>>;
}

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  const { q, filter, p, ps } = sp;

  const questions = await searchQuestions({
    page: Number(p) || 1,
    pageSize: Number(ps) || 10,
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
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          placeholder="Search Questions..."
          classNames={{
            container: "flex-1",
          }}
        />

        <CommonFilter
          filters={homeFilters}
          searchParams={sp}
          classNames={{
            container: "hidden max-md:flex",
            trigger: "min-h-[56px] sm:min-w-[170px]",
          }}
        />
      </section>
      <HomeFilter searchParams={sp} />
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
}
