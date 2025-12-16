import DataRenderer from "@/components/DataRenderer";
import TagCard from "@/components/cards/TagCard";
import LocalSearch from "@/components/search/LocalSearch";
import { createAdminClient } from "@/lib/appwrite/config";
import { Tag } from "@/lib/appwrite/types/appwrite";
import { DEFAULT_CACHE_DURATION } from "@/lib/constants";
import { CACHE_KEYS } from "@/lib/constants/cacheKeys";
import { appwriteConfig } from "@/lib/constants/server";
import { EMPTY_TAGS } from "@/lib/constants/states";
import handleError from "@/lib/errors";
import { cacheLife, cacheTag } from "next/cache";
import { Query } from "node-appwrite";

const getTags = async ({
  page = 1,
  pageSize = 10,
  query = "",
}: {
  page: number;
  pageSize: number;
  query?: string;
}) => {
  "use cache";

  cacheLife({
    revalidate: DEFAULT_CACHE_DURATION,
  });

  cacheTag(CACHE_KEYS.TAGS_LIST, String(page), String(pageSize), query);

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
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function TagsPage({ searchParams }: Props) {
  const { q, page, pageSize } = await searchParams;
  const tags = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 50,
    query: q?.toLowerCase() || "",
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

      <section className="mt-11">
        <LocalSearch placeholder="Search Tags..." />
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
