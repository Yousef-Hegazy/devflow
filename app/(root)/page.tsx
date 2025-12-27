import { searchQuestions } from "@/actions/questions";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { HomeFilterType } from "@/lib/constants";
import { EMPTY_QUESTION } from "@/lib/constants/states";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    q?: string;
    filter?: HomeFilterType;
    page?: string;
    pageSize?: string;
  }>;
}

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
