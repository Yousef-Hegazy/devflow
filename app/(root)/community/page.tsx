import { searchUsers } from "@/actions/community";

const CommunityPage = async () => {
  const communityList = await searchUsers({
    page: 1,
    pageSize: 10,
    query: "",
    filter: "all",
  });

  return <div>CommunityPage</div>;
};

export default CommunityPage;
