"use cache";

import { getUserTags, TagWithQuestionCount } from "@/actions/tags";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_TAGS } from "@/lib/constants/states";

type Props = {
  userId: string;
};

const UserTopTags = async ({ userId }: Props) => {
  const userTags = await getUserTags(userId);
  const isError = !!userTags.error;
  const isSuccess = !isError && userTags.rows.length > 0;

  return (
    <DataRenderer
      data={userTags.rows}
      empty={EMPTY_TAGS}
      success={isSuccess}
      error={isError ? { message: userTags.error } : undefined}
      render={(tags: TagWithQuestionCount[]) =>
        tags.map((tag) => (
          <TagCard
            key={tag.id}
            name={tag.title}
            $id={tag.id}
            questionsNo={tag.questionsCount}
          />
        ))
      }
    />
  );
};

export default UserTopTags;
