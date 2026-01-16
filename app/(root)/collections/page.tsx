import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import { EMPTY_COLLECTIONS } from "@/lib/constants/states";

import { searchUserCollections } from "@/actions/collections";
import CommonFilter from "@/components/filters/CommonFilter";
import AppPagination from "@/components/navigation/AppPagination";
import { collectionFilters } from "@/lib/constants/filters";
import { getCurrentUser } from "@/lib/server";
import { CollectionFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";
import { redirect } from "next/navigation";
import { QuestionWithMetadata } from "@/actions/questions";

interface Props {
  searchParams: Promise<PaginationSearchParams<CollectionFilterType>>;
}

const CollectionsPage = async ({ searchParams }: Props) => {
  const [sp, user] = await Promise.all([searchParams, getCurrentUser()]);

  const { q, filter, p, ps } = sp;

  if (!user || !user.id) {
    redirect("/login");
  }

  const questions = await searchUserCollections({
    userId: user.id,
    page: Number(p) || 1,
    pageSize: Number(ps) || 10,
    query: q?.toLowerCase() || "",
    filter,
  });

  const isError = !!questions.error;

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      </section>

      <section className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          placeholder="Search Questions..."
          classNames={{
            container: "flex-1",
          }}
        />

        <CommonFilter
          filters={collectionFilters}
          searchParams={sp}
          classNames={{
            trigger: "min-h-[56px] sm:min-w-[170px]",
          }}
        />
      </section>
      <div className="mt-5 flex w-full flex-col gap-6">
        <DataRenderer
          success={!isError}
          error={isError ? { message: questions.error } : undefined}
          data={isError ? [] : questions.rows}
          empty={EMPTY_COLLECTIONS}
          render={(data) => (
            <>
              {data.map((question) => (
                <QuestionCard key={question.id} question={question as unknown as QuestionWithMetadata} />
              ))}
            </>
          )}
        />

        {/* Pagination */}
        <div className="mt-10 flex w-full justify-center">
          <AppPagination
            page={Number(p) || 1}
            totalItems={"error" in questions ? 1 : questions.total}
            pageSize={Number(ps) || 10}
          />
        </div>
      </div>
    </>
  );
};

export default CollectionsPage;
