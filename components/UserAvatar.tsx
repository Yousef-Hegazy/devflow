import { AppUser } from "@/lib/appwrite/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";

type Props = {
  user: AppUser;
  classNames?: {
    avatar?: string;
    image?: string;
    fallback?: string;
  };
};

const UserAvatar = ({ user, classNames }: Props) => {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={`/profile/${user?.$id}`}>
      <Avatar className={cn("size-9", classNames?.avatar)}>
        <AvatarImage
          src={user.image || ""}
          alt={user.name}
          width={36}
          height={36}
          className={cn("object-cover", classNames?.image)}
          // render={
          //   <Image
          //     src={user.image || "/icons/avatar.svg"}
          //     alt={user.name}
          //     width={36}
          //     height={36}
          //     quality={100}
          //     className={cn("object-cover", classNames?.image)}
          //   />
          // }
        />

        <AvatarFallback
          className={cn(
            "primary-gradient font-space-grotesk font-bold tracking-wider text-white",
            classNames?.fallback,
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
};

export default UserAvatar;
