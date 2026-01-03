"use cache";

import { getUserTags } from "@/actions/tags";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_TAGS } from "@/lib/constants/states";
import { Tag } from "@/lib/types/appwrite";

type Props = {
  userId: string;
};

const UserTopTags = async ({ userId }: Props) => {
  const userTags = await getUserTags(userId);
  const isSuccess = !("error" in userTags) && userTags.rows.length > 0;
  const isError = "error" in userTags;

  return (
    <DataRenderer<Tag>
      data={userTags.rows}
      empty={EMPTY_TAGS}
      success={isSuccess}
      error={isError ? { message: userTags.error } : undefined}
      render={(tags) =>
        tags.map((tag) => (
          <TagCard
            key={tag.$id}
            name={tag.title}
            $id={tag.$id}
            questionsNo={tag.questionsCount}
          />
        ))
      }
    />
  );
};

export default UserTopTags;
