import UserAnswerVotes from "@/app/(root)/questions/[id]/UserAnswerVotes";
import { getTimeAgo } from "@/lib/helpers/date";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import PreviewMarkdown from "../MarkdownEditor/PreviewMarkdown";
import { Skeleton } from "../ui/skeleton";
import UserAvatar from "../UserAvatar";
import Votes from "../votes/Votes";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer: any; // supports both legacy Appwrite-shaped and new Postgres-shaped answers
  userId?: string;
  isCompact?: boolean;
  isLink?: boolean;
};

const AnswerContent = ({ answer, userId, isCompact }: Props) => {
  const answerId = answer.id ?? answer.$id;
  const createdAt = answer.createdAt ?? answer.createdAt;
  const author = answer.author ?? {};
  const authorId = author.id ?? author.$id;
  const questionId = answer.questionId ?? answer.question;

  const timeAgo = getTimeAgo(new Date(createdAt));
  return (
    <>
      <span id={`answer-${answerId}`} className="hash-span" />

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            user={author}
            classNames={{
              avatar: "size-5 rounded-full object-cover max-sm:mt-2",
            }}
          />

          <Link
            href={{
              pathname: `/profile/${authorId}`,
            }}
            className="flex flex-col sm:flex-row sm:items-center sm:gap-2"
          >
            <p className="body-semibold text-dark300_light700">
              {author.name.split(" ")[0]}
            </p>

            <p className="small-regular text-light400_light500 mt-0.5 ml-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span> answered {timeAgo}
            </p>
          </Link>
        </div>

        {isCompact ? (
          <Link
            className="paragraph-semibold text-dark500_light700 text-sm"
            href={`/questions/${String(questionId)}#answer-${answerId}`}
          >
            Read More...
          </Link>
        ) : null}

        <Suspense fallback={<Skeleton className="h-6 w-27.5" />}>
          {userId ? (
            <UserAnswerVotes
              upvotes={answer.upvotes}
              downvotes={answer.downvotes}
              userId={userId}
              answerId={answerId}
              questionId={String(questionId)}
            />
          ) : (
            <Votes
              upvotes={answer.upvotes}
              downvotes={answer.downvotes}
              answerId={answerId}
              questionId={String(questionId)}
            />
          )}
        </Suspense>
      </div>

      <PreviewMarkdown content={answer.content} />
    </>
  );
};

const AnswerCard = ({ answer, userId, isLink, isCompact }: Props) => {
  const containerClasses = cn(
    "card-wrapper rounded-md light-border border-b p-10",
    {
      "p-5 max-h-[150px] overflow-hidden": isCompact,
    },
  );

  const answerId = answer.id ?? answer.$id;
  const questionId = answer.questionId ?? answer.question;

  return isLink ? (
    <Link
      href={`/questions/${String(questionId)}#answer-${answerId}`}
      className={containerClasses}
    >
      <AnswerContent answer={answer} userId={userId} isCompact={isCompact} />
    </Link>
  ) : (
    <article className={containerClasses}>
      <AnswerContent answer={answer} userId={userId} isCompact={isCompact} />
    </article>
  );
};

export default AnswerCard;
