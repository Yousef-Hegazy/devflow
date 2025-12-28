import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { EMPTY_COLLECTIONS } from "@/lib/constants/states";

import { searchUserCollections } from "@/actions/questions";
import { CollectionFilterType } from "@/lib/models";
import { getCurrentUser } from "@/lib/server";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{
    q?: string;
    filter?: CollectionFilterType;
    page?: string;
    pageSize?: string;
  }>;
}

const CollectionsPage = async ({ searchParams }: Props) => {
  const [{ q, filter, page, pageSize }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  if (!user || !user.$id) {
    redirect("/login");
  }

  const questions = await searchUserCollections({
    userId: user.$id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: q?.toLowerCase() || "",
    filter,
  });

  const isError = "error" in questions;

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

        {/* <Button
          render={<Link href="/ask-question" />}
          className="primary-gradient! text-light-900! min-h-11.5! border-0! px-4! py-3!"
        >
          Ask a Question
        </Button> */}
      </section>
      <section className="mt-11">
        <LocalSearch placeholder="Search Questions..." />
      </section>
      <HomeFilter />
      <div className="mt-5 flex w-full flex-col gap-6">
        <DataRenderer
          success={!isError}
          error={isError ? { message: questions.error } : undefined}
          data={isError ? [] : questions.rows}
          empty={EMPTY_COLLECTIONS}
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
};

export default CollectionsPage;
