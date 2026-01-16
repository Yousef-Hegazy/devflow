import QuestionForm from "@/components/forms/QuestionForm";
import { getCurrentUser } from "@/lib/server";
import { redirect, RedirectType } from "next/navigation";

const AskQuestion = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in", RedirectType.replace);
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>

      <div className="mt-9">
        <QuestionForm userId={user.id} />
      </div>
    </>
  );
};

export default AskQuestion;
