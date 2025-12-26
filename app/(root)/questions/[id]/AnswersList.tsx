import { getAnswers } from "@/actions/questions";
import AnswerCard from "@/components/cards/AnswerCard";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_ANSWERS } from "@/lib/constants/states";

type Props = {
  questionId: string;
  userId?: string;
};

const AnswersList = async ({ questionId, userId }: Props) => {
  const answersRes = await getAnswers({ questionId });

  return (
    <section className="my-5">
      <DataRenderer
        data={"error" in answersRes ? [] : [answersRes]}
        empty={EMPTY_ANSWERS}
        success={!("error" in answersRes)}
        error={
          "error" in answersRes ? { message: answersRes.error } : undefined
        }
        render={([res]) => (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="primary-text-gradient">
                {res.total || 0}{" "}
                {res.total && res.total > 1 ? "Answers" : "Answer"}
              </h3>

              <p>Filters</p>
            </div>

            {res.rows.map((answer) => (
              <AnswerCard key={answer.$id} answer={answer} userId={userId} />
            ))}
          </div>
        )}
      />
    </section>
  );
};

export default AnswersList;
