import DataRenderer from "@/components/DataRenderer";
import TagCard from "@/components/cards/TagCard";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { createAdminClient } from "@/lib/appwrite/config";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { tagFilters } from "@/lib/constants/filters";
import { appwriteConfig } from "@/lib/constants/server";
import { EMPTY_TAGS } from "@/lib/constants/states";
import handleError from "@/lib/errors";
import { Tag } from "@/lib/types/appwrite";
import { TagsFilterType } from "@/lib/types/filters";
import {
  PaginationParams,
  PaginationSearchParams,
} from "@/lib/types/pagination";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";

const searchTags = async ({
  page = 1,
  pageSize = 10,
  query = "",
  filter = "popular",
}: PaginationParams<TagsFilterType>) => {
  "use cache";

  cacheLife({
    revalidate: DEFAULT_CACHE_DURATION,
  });

  cacheTag(
    CACHE_KEYS.TAGS_LIST,
    CACHE_KEYS.TAGS_LIST + String(page) + String(pageSize) + query + filter,
  );

  try {
    const { database } = await createAdminClient();

    const queries = [
      Query.limit(pageSize),
      Query.offset((page - 1) * pageSize),
      Query.orderDesc("questionsCount"),
    ];

    if (query) {
      queries.push(Query.contains("title", query));
    }

    switch (filter) {
      case "name":
        queries.push(Query.orderAsc("title"));
        break;
      case "popular":
        queries.push(Query.orderDesc("questionsCount"));
        break;
      case "oldest":
        queries.push(Query.orderAsc("$createdAt"));
        break;
      case "recent":
      default:
        queries.push(Query.orderDesc("$createdAt"));
        break;
    }

    const res = await database.listRows<Tag>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.tagsTableId,
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
        <LocalSearch placeholder="Search Tags..." />

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
        error={"error" in tags ? { message: tags.error } : undefined}
        data={"error" in tags ? [] : tags.rows}
        empty={EMPTY_TAGS}
        render={(data: Tag[]) => (
          <div className="mt-5 flex flex-wrap gap-3">
            {data.map((tag) => (
              <TagCard
                key={tag.$id}
                $id={tag.$id}
                name={tag.title.toLocaleLowerCase()}
                questionsNo={tag.questionsCount}
                showCount={false}
                compact={false}
              />
            ))}
          </div>
        )}
      />
    </>
  );
}
