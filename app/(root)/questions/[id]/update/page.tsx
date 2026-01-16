import { getQuestionDetails } from "@/actions/questions";
import QuestionForm from "@/components/forms/QuestionForm";
import { getCurrentUser } from "@/lib/server";
import { redirect, RedirectType } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateQuestionPage = async ({ params }: Props) => {
  const { id } = await params;
  const [user, question] = await Promise.all([
    getCurrentUser(),
    getQuestionDetails(id),
  ]);

  if (!user || !question || question.author?.id !== user.id) {
    redirect(`/questions/${id}`, RedirectType.replace);
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Update your Question</h1>

      <div className="mt-9">
        <QuestionForm userId={user.id} question={question} />
      </div>
    </>
  );
};

export default UpdateQuestionPage;
