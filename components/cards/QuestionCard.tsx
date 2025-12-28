import { getTimeAgo } from "@/lib/helpers/date";
import Link from "next/link";
import TagCard from "./TagCard";
import Metric from "../Metric";
import type { Question } from "@/lib/appwrite/types";

type Props = {
  question: Question;
};

const QuestionCard = ({
  question: {
    $id,
    title,
    tags,
    author,
    $createdAt,
    upvotes,
    answersCount,
    views,
  },
}: Props) => {
  const timeAgo = getTimeAgo(new Date($createdAt));

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {timeAgo}
          </span>

          <Link href={`/questions/${$id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      <div className="mt-3.5 flex w-full flex-wrap gap-2">
        {tags && tags.length > 0
          ? tags.map((tag) => (
              <TagCard
                key={tag.$id}
                $id={tag.tag.$id}
                name={tag.tag.title}
                showCount={false}
                compact
              />
            ))
          : null}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.image || "/icons/avatar.svg"}
          alt={author.name}
          value={author.name}
          title={`• asked ${timeAgo}`}
          href={`/profile/${author.$id}`}
          classNames={{
            text: "body-medium text-dark400_light700",
          }}
          isAuthor
        />

        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/icons/like.svg"
            alt="Like"
            value={upvotes}
            title=" Votes"
            classNames={{
              text: "small-medium text-dark400_light800",
              title: "max-sm:hidden",
            }}
          />

          <Metric
            imgUrl="/icons/message.svg"
            alt="answers"
            value={answersCount}
            title=" Answers"
            classNames={{
              text: "small-medium text-dark400_light800",
              title: "max-sm:hidden",
            }}
          />

          <Metric
            imgUrl="/icons/eye.svg"
            alt="views"
            value={views}
            title=" Views"
            classNames={{
              text: "small-medium text-dark400_light800",
              title: "max-sm:hidden",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
