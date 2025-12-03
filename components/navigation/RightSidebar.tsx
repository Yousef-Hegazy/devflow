import Image from "next/image";
import Link from "next/link";

const topQuestions = [
  {
    $id: "1",
    title: "How to implement authentication in a React application?",
  },
  {
    $id: "2",
    title: "What are the best practices for state management in React?",
  },
  {
    $id: "3",
    title: "How to optimize performance in a React app?",
  },
  {
    $id: "4",
    title: "What is the difference between React hooks and class components?",
  },
];

const RightSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border overflw-y-auto shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {topQuestions.map((q) => (
            <Link
              key={q.$id}
              href={`/question/${q.$id}`}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">{q.title}</p>
              <Image
                src="/icons/chevron-right.svg"
                alt="Chevron Right"
                width={24}
                height={24}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
