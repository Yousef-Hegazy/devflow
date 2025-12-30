import UserAnswerVotes from "@/app/(root)/questions/[id]/UserAnswerVotes";
import { Answer } from "@/lib/types/appwrite";
import { getTimeAgo } from "@/lib/helpers/date";
import Link from "next/link";
import { Suspense } from "react";
import PreviewMarkdown from "../MarkdownEditor/PreviewMarkdown";
import { Skeleton } from "../ui/skeleton";
import UserAvatar from "../UserAvatar";
import Votes from "../votes/Votes";

type Props = {
  answer: Answer;
  userId?: string;
};

const AnswerCard = ({ answer, userId }: Props) => {
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

        <Suspense fallback={<Skeleton className="h-6 w-27.5" />}>
          {userId ? (
            <UserAnswerVotes
              upvotes={answer.upvotes}
              downvotes={answer.downvotes}
              userId={userId}
              answerId={answer.$id}
              questionId={String(answer.question)}
            />
          ) : (
            <Votes
              upvotes={answer.upvotes}
              downvotes={answer.downvotes}
              answerId={answer.$id}
              questionId={String(answer.question)}
            />
          )}
        </Suspense>
      </div>

      <PreviewMarkdown content={answer.content} />
    </article>
  );
};

export default AnswerCard;
