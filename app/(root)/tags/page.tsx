import { searchTags, TagWithQuestionCount } from "@/actions/tags";
import DataRenderer from "@/components/DataRenderer";
import TagCard from "@/components/cards/TagCard";
import CommonFilter from "@/components/filters/CommonFilter";
import AppPagination from "@/components/navigation/AppPagination";
import LocalSearch from "@/components/search/LocalSearch";
import { tagFilters } from "@/lib/constants/filters";
import { EMPTY_TAGS } from "@/lib/constants/states";
import { TagsFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";

interface Props {
  searchParams: Promise<PaginationSearchParams<TagsFilterType>>;
}

export default async function TagsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { q, p, ps } = sp;
  const tags = await searchTags({
    page: Number(p) || 1,
    pageSize: Number(ps) || 50,
    query: q?.toLowerCase() || "",
    filter: sp.filter,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">
        Tags{" "}
        {tags.total ? (
          <>
            •{" "}
            <span className="primary-text-gradient">
              {tags.total > 99 ? "99+" : tags.total}
            </span>
          </>
        ) : (
          ""
        )}
      </h1>

      <section className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          placeholder="Search Tags..."
          classNames={{
            container: "flex-1",
          }}
        />

        <CommonFilter
          filters={tagFilters}
          searchParams={sp}
          classNames={{
            trigger: "min-h-[56px] sm:min-w-[170px]",
          }}
        />
      </section>

      <DataRenderer
        success={!("error" in tags)}
        error={tags.error ? { message: tags.error } : undefined}
        data={tags.rows}
        empty={EMPTY_TAGS}
        render={(data: TagWithQuestionCount[]) => (
          <div className="mt-5 flex flex-wrap gap-3">
            {data.map((tag) => (
              <TagCard
                key={tag.id}
                $id={tag.id}
                name={tag.title.toLocaleLowerCase()}
                questionsNo={tag.questionsCount}
                showCount={false}
                compact={false}
              />
            ))}
          </div>
        )}
      />

      {/* Pagination */}
      <div className="mt-10 flex w-full justify-center">
        <AppPagination
          page={Number(p) || 1}
          totalItems={"error" in tags ? 1 : tags.total}
          pageSize={Number(ps) || 50}
        />
      </div>
    </>
  );
}
