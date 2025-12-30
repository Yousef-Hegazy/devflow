import { AppUser } from "@/lib/types/appwrite";
import Link from "next/link";
import UserAvatar from "../UserAvatar";

type Props = {
  user: AppUser;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="shadow-light100_darknone xs:w-59.5 w-full">
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
        <UserAvatar
          user={user}
          classNames={{
            avatar: "size-[100px] rounded-full object-cover",
            fallback: "text-3xl tracking-widest",
          }}
        />

        <Link href={`/profile/${user.$id}`}>
          <div className="mt-4 text-center">
            <h3 className="h3-bold text-dark200_light900 line-clamp-1">
              {user.name}
            </h3>
            <p className="body-regular text-dark500_light500 mt-2">
              {user.username}
            </p>
          </div>
        </Link>
      </article>
    </div>
  );
};

export default UserCard;
