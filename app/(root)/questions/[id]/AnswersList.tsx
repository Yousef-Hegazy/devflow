import AnswerCard from "@/components/cards/AnswerCard";
import { Answer } from "@/lib/appwrite/types/appwrite";

type Props = {
  answers: Array<Answer>;
  total?: number;
};

const AnswersList = ({ answers, total }: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {total || 0} {total && total > 1 ? "Answers" : "Answer"}
        </h3>

        <p>Filters</p>
      </div>

      {answers.map((answer) => (
        <AnswerCard key={answer.$id} answer={answer} />
      ))}
    </div>
  );
};

export default AnswersList;
