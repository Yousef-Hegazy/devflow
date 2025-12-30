import QuestionForm from "@/components/forms/QuestionForm";
import { createSessionClient } from "@/lib/appwrite/config";
import { Question } from "@/lib/types/appwrite";
import { appwriteConfig } from "@/lib/constants/server";
import { getCurrentUser } from "@/lib/server";
import { redirect, RedirectType } from "next/navigation";
import { Query } from "node-appwrite";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getQuestionById = async (id: string) => {
  try {
    const { database } = await createSessionClient();
    const question = await database.getRow<Question>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.questionsTableId,
      rowId: id,
      queries: [Query.select(["*", "tags.*", "tags.tag.title"])],
    });
    return question;
  } catch {
    return null;
  }
};

const UpdateQuestionPage = async ({ params }: Props) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const question = await getQuestionById(id);

  if (!user || !question || question.author.toString() !== user.$id) {
    redirect(`/questions/${id}`, RedirectType.replace);
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Update your Question</h1>

      <div className="mt-9">
        <QuestionForm userId={user.$id} question={question} />
      </div>
    </>
  );
};

export default UpdateQuestionPage;
