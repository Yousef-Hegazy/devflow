import {
  getAnswers,
  getQuestionDetails,
  getQuestionViews,
} from "@/actions/questions";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import AnswerForm from "@/components/forms/AnswerForm";
import IncrementQuestionView from "@/components/IncrementQuestionView";
import PreviewMarkdown from "@/components/MarkdownEditor/PreviewMarkdown";
import Metric from "@/components/Metric";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { EMPTY_ANSWERS, EMPTY_QUESTION } from "@/lib/constants/states";
import { getTimeAgo } from "@/lib/helpers/date";
import { getCurrentUser } from "@/lib/server";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import AnswersList from "./AnswersList";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const QuestionDetailsPage = async ({ params }: Props) => {
  const { id } = await params;
  const [user, question, views, answersRes] = await Promise.all([
    getCurrentUser(),
    getQuestionDetails(id),
    getQuestionViews(id),
    getAnswers({ questionId: id }),
  ]);

  return (
    <DataRenderer
      error={!question ? { message: "Question not found." } : undefined}
      empty={EMPTY_QUESTION}
      data={question ? [question] : undefined}
      success={!!question}
      render={([question]) => (
        <>
          <IncrementQuestionView questionId={question.$id} />
          <div className="flex-start w-full flex-col">
            <div className="flex w-full flex-col-reverse justify-between">
              <div className="flex items-center justify-start gap-1">
                <UserAvatar
                  user={question.author}
                  classNames={{
                    avatar: "size-[22px]",
                    fallback: "text-[10px]",
                  }}
                />

                <Link href={`/profile/${question.author.$id}`}>
                  <p className="paragraph-semibold text-dark300_light700">
                    {question.author.name.split(" ")[0]}
                  </p>
                </Link>
              </div>

              <div className="flex justify-end">
                {user?.$id === question.author.$id ? (
                  <Button
                    className="primary-gradient text-light-900 w-fit border-0 py-3"
                    render={
                      <Link
                        href={{
                          pathname: `${question.$id}/update`,
                        }}
                      />
                    }
                  >
                    Update Question
                  </Button>
                ) : null}
                {/* <p>Votes</p> */}
              </div>
            </div>

            <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
              {question.title}
            </h2>
          </div>

          <div className="mt-5 mb-8 flex flex-wrap gap-4">
            <Metric
              imgUrl="/icons/clock.svg"
              alt="clock icon"
              value={` asked ${getTimeAgo(new Date(question.$createdAt))}`}
              title=""
              classNames={{
                text: "small-regular text-dark400_light700",
              }}
            />

            <Metric
              imgUrl="/icons/message.svg"
              alt="message icon"
              value={question.answersCount}
              title=""
              classNames={{
                text: "small-regular text-dark400_light700",
              }}
            />

            <Metric
              imgUrl="/icons/eye.svg"
              alt="eye icon"
              value={formatNumber(views)}
              title=""
              classNames={{
                text: "small-regular text-dark400_light700",
              }}
            />
          </div>

          <PreviewMarkdown content={question.content} />

          <div className="mt-8 flex flex-wrap gap-2">
            {question.tags.map(({ tag }) => (
              <TagCard key={tag.$id} $id={tag.$id} name={tag.title} compact />
            ))}
          </div>

          <section className="my-5">
            <DataRenderer
              data={"error" in answersRes ? [] : [answersRes]}
              empty={EMPTY_ANSWERS}
              success={!("error" in answersRes)}
              error={
                "error" in answersRes
                  ? { message: answersRes.error }
                  : undefined
              }
              render={([res]) => (
                <AnswersList answers={res.rows} total={res.total} />
              )}
            />
          </section>

          <section className="my-5">
            <AnswerForm questionId={question.$id} />
          </section>
        </>
      )}
    />
  );
};

export default QuestionDetailsPage;
