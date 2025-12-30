import { getAnswers } from "@/actions/questions";
import AnswerCard from "@/components/cards/AnswerCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import { answerFilters } from "@/lib/constants/filters";
import { EMPTY_ANSWERS } from "@/lib/constants/states";
import { AnswersFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";

type Props = {
  questionId: string;
  userId?: string;
  searchParams: PaginationSearchParams<AnswersFilterType>;
};

const AnswersList = async ({ questionId, userId, searchParams }: Props) => {
  const answersRes = await getAnswers({
    questionId,
    filter: searchParams.filter,
  });

  return (
    <section className="my-5">
      <div className="flex gap-2 max-sm:flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="primary-text-gradient">
          {answersRes?.total || 0}{" "}
          {answersRes.total && answersRes.total > 1 ? "Answers" : "Answer"}
        </h3>

        <CommonFilter
          filters={answerFilters}
          searchParams={searchParams}
          classNames={{
            container: "max-sm:w-full",
            trigger: "sm:min-w-32",
          }}
        />
      </div>
      <DataRenderer
        data={"error" in answersRes ? [] : [answersRes]}
        empty={EMPTY_ANSWERS}
        success={!("error" in answersRes)}
        error={
          "error" in answersRes ? { message: answersRes.error } : undefined
        }
        render={([res]) =>
          res.rows.map((answer) => (
            <AnswerCard key={answer.$id} answer={answer} userId={userId} />
          ))
        }
      />
    </section>
  );
};

export default AnswersList;
