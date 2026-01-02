import { getUserDetails } from "@/actions/community";
import ProfileLink from "@/components/ProfileLink";
import Stats from "@/components/Stats";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { getCurrentUser } from "@/lib/server";
import dayjs from "dayjs";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Profile({ params }: Props) {
  const { id } = await params;
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

  const isCurrentUser = !!(currentUser && user && currentUser.$id === user.$id);

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
                title={dayjs(user.$createdAt).format("MMMM D, YYYY")}
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
              render={<Link href={`/profile/${user.$id}/edit`} />}
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
    </>
  );
}
