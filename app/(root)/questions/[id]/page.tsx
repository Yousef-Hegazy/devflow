import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const QuestionDetailsPage = async ({ params }: Props) => {
  const { id } = await params;

  return <div>
    <h1 className="h1-bold text-dark100_light900">Question Details Page - {id}</h1>
    <Link href={`/questions/${id}/update`} className="text-primary-600_light400 underline mt-4 inline-block">
      Update Question
    </Link>
  </div>;
};

export default QuestionDetailsPage;
