import { searchUsers, SearchUsersParams } from "@/actions/community";
import UserCard from "@/components/cards/UserCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { userFilters } from "@/lib/constants/filters";
import { EMPTY_USERS } from "@/lib/constants/states";

type Props = {
  searchParams: Promise<{
    q?: string;
    filter?: SearchUsersParams["filter"];
    page?: string;
    pageSize?: string;
  }>;
};

const CommunityPage = async ({ searchParams }: Props) => {
  const sp = await searchParams;
  const { q, filter, page, pageSize } = sp;

  const communityList = await searchUsers({
    page: page ? parseInt(page) : 1,
    pageSize: pageSize ? parseInt(pageSize) : 10,
    query: q || "",
    filter: filter,
  });

  const isError = "error" in communityList;
  const error = isError ? { message: communityList.error } : undefined;

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <section className="mt-11 flex flex-row justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          placeholder="Search Users..."
          classNames={{
            container: "flex-1",
          }}
        />

        <CommonFilter
          filters={userFilters}
          searchParams={sp}
          classNames={{
            trigger: "min-h-[56px] sm:min-w-[170px]",
          }}
        />
      </section>

      <DataRenderer
        data={!isError ? [communityList] : []}
        success={!isError}
        error={error}
        empty={EMPTY_USERS}
        render={([res]) => (
          <div className="mt-11 flex flex-wrap gap-5">
            {res.rows.map((user) => (
              <UserCard key={user.$id} user={user} />
            ))}
          </div>
        )}
      />
    </div>
  );
};

export default CommunityPage;
