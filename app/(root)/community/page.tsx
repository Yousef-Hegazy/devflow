import { searchUsers, SearchUsersParams } from "@/actions/community";
import UserCard from "@/components/cards/UserCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
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
  const { q, filter, page, pageSize } = await searchParams;

  const communityList = await searchUsers({
    page: page ? parseInt(page) : 1,
    pageSize: pageSize ? parseInt(pageSize) : 10,
    query: q || "",
    filter: filter || "all",
  });

  const isError = "error" in communityList;
  const error = isError ? { message: communityList.error } : undefined;

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <section className="mt-11">
        <LocalSearch placeholder="Search Users..." />
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
