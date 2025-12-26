import { Answer } from "@/lib/appwrite/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { getTimeAgo } from "@/lib/helpers/date";
import PreviewMarkdown from "../MarkdownEditor/PreviewMarkdown";

type Props = {
  answer: Answer;
};

const AnswerCard = ({ answer }: Props) => {
  const timeAgo = getTimeAgo(new Date(answer.$createdAt));

  return (
    <article className="light-border border-b py-10">
      <span id={answer.$id} className="hash-span" />

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            user={answer.author}
            classNames={{
              avatar: "size-5 rounded-full object-cover max-sm:mt-2",
            }}
          />

          <Link
            href={{
              pathname: `profile/${answer.author.$id}`,
            }}
            className="flex flex-col sm:flex-row sm:items-center sm:gap-2"
          >
            <p className="body-semibold text-dark300_light700">
              {answer.author.name.split(" ")[0]}
            </p>

            <p className="small-regular text-light400_light500 mt-0.5 ml-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span> answered {timeAgo}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">Votes</div>
      </div>

      <PreviewMarkdown content={answer.content} />
    </article>
  );
};

export default AnswerCard;
