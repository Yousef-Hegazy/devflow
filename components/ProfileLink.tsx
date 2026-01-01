import Image from "next/image";
import Link from "next/link";

type Props = {
  immgUrl: string;
  href?: string;
  title: string;
};

const ProfileLink = ({ immgUrl, href, title }: Props) => {
  return (
    <div className="flex-center gap-1">
      <Image src={immgUrl} alt={title} width={20} height={20} />
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="paragraph-medium text-link-100"
        >
          {title}
        </Link>
      ) : (
        <p className="paragraph-medium text-dark400_light800">{title}</p>
      )}
    </div>
  );
};

export default ProfileLink;
