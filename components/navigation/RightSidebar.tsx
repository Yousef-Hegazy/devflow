import { getHotQuestions } from "@/actions/questions";
import { getPopularTags } from "@/actions/tags";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import TagCard from "../cards/TagCard";
import Loading from "../Loading";

const RightSidebarContent = async () => {
  const [topQuestions, popularTags] = await Promise.all([
    getHotQuestions(),
    getPopularTags(),
  ]);

  return (
    <>
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-7.5">
          {topQuestions?.rows.map((q) => (
            <Link
              key={q.$id}
              href={`/questions/${q.$id}`}
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

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>

        <div className="mt-7 flex flex-col gap-4">
          {popularTags?.rows.map((tag) => (
            <TagCard
              key={tag.$id}
              $id={tag.$id}
              name={tag.title}
              questionsNo={tag.questionsCount}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </>
  );
};

const RightSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-87.5 flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <Suspense fallback={<Loading />}>
        <RightSidebarContent />
      </Suspense>
    </section>
  );
};

export default RightSidebar;
