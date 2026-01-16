import { getUserDetails } from "@/actions/community";
import CommonFilter from "@/components/filters/CommonFilter";
import Loading from "@/components/Loading";
import ProfileLink from "@/components/ProfileLink";
import Stats from "@/components/Stats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import UserAvatar from "@/components/UserAvatar";
import { answerFilters, homeFilters } from "@/lib/constants/filters";
import { getCurrentUser } from "@/lib/server";
import { AnswersFilterType, HomeFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";
import dayjs from "dayjs";
import Link from "next/link";
import { Suspense } from "react";
import UserAnswersTab from "./UserAnswersTab";
import UserQuestionsTab from "./UserQuestionsTab";
import UserTopTags from "./UserTopTags";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<
    PaginationSearchParams<HomeFilterType | AnswersFilterType> & {
      tab?: string;
    }
  >;
};

export default async function Profile({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  const { tab } = sp;

  const [user, currentUser] = await Promise.all([
    getUserDetails(id),
    getCurrentUser(),
  ]);

  if (user instanceof Error) {
    return (
      <div>
        <div className="h1-bold text-dark100_light900">{user.message}</div>
      </div>
    );
  }

  const questionsFilters = homeFilters.filter((f) => f.value !== "recommended");

  const isCurrentUser = !!(currentUser && user && currentUser.id === user.id);

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col-reverse items-start gap-4 lg:flex-row">
          <UserAvatar
            user={user}
            classNames={{
              avatar: "size-[140px] rounded-full object-cover",
              image: "object-cover",
              fallback: "text-6xl font-bolder",
            }}
          />

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">
              @{user.username}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {user.portfolio ? (
                <ProfileLink
                  immgUrl="/icons/link.svg"
                  href={user.portfolio}
                  title="Portfolio"
                />
              ) : null}
              {user.location ? (
                <ProfileLink immgUrl="/icons/location.svg" title="Location" />
              ) : null}

              <ProfileLink
                immgUrl="/icons/calendar.svg"
                title={dayjs(user.createdAt).format("MMMM D, YYYY")}
              />
            </div>

            {user.bio ? (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {user.bio}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {isCurrentUser ? (
            <Button
              className="paragraph-medium! btn-secondary! text-dark300_light900! min-h-12! min-w-44! border-none px-4 py-3"
              render={<Link href={`/profile/${user.id}/edit`} />}
            >
              Edit Profile
            </Button>
          ) : null}
        </div>
      </section>

      <Stats
        totalQuestions={user.questionsCount}
        totalAnswers={user.answersCount}
        badges={{
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        }}
      />

      <section className="mt-10 flex gap-10">
        <Tabs value={tab || "top-posts"} className="w-full! flex-1!">
          <div className="flex flex-row items-center justify-between gap-2">
            <TabsList className="min-h-10.5 p-1">
              <TabsTab
                nativeButton={false}
                value="top-posts"
                render={<Link href="?tab=top-posts" />}
              >
                Top Posts
              </TabsTab>

              <TabsTab
                nativeButton={false}
                value="answers"
                render={<Link href="?tab=answers" />}
              >
                Answers
              </TabsTab>
            </TabsList>

            {tab === "top-posts" ? (
              <CommonFilter filters={questionsFilters} searchParams={sp} />
            ) : (
              <CommonFilter filters={answerFilters} searchParams={sp} />
            )}
          </div>

          <TabsPanel
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <Suspense fallback={<Loading />}>
              <UserQuestionsTab
                userId={user.id}
                searchParams={sp as PaginationSearchParams<HomeFilterType>}
              />
            </Suspense>
          </TabsPanel>

          <TabsPanel
            value="answers"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <Suspense fallback={<Loading />}>
              <UserAnswersTab
                userId={user.id}
                searchParams={sp as PaginationSearchParams<AnswersFilterType>}
              />
            </Suspense>
          </TabsPanel>
        </Tabs>

        <div className="flex min-w-62.5 shrink-0 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tags</h3>
          <div className="mt-7 flex flex-col gap-4">
            <Suspense fallback={<Loading />}>
              <UserTopTags userId={user.id} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
