import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Props = {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  classNames?: {
    text?: string;
    image?: string;
  };
  isAuthor?: boolean;
};

const MetricContent = ({
  imgUrl,
  alt,
  value,
  title,
  classNames,
  isAuthor,
}: Props) => {
  return (
    <>
      <Image
        src={imgUrl}
        alt={alt}
        width={16}
        height={16}
        className={cn("rounded-full object-contain", classNames?.image)}
      />

      <p className={cn("flex items-center gap-1", classNames?.text)}>{value}</p>

      <span
        className={cn("small-regular line-clamp-1", {
          "max-sm:hiden": isAuthor,
        })}
      >
        {title}
      </span>
    </>
  );
};

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  classNames,
  isAuthor,
}: Props) => {
  return href ? (
    <Link href={href} className="flex-center gap-1">
      <MetricContent
        imgUrl={imgUrl}
        alt={alt}
        value={value}
        title={title}
        classNames={classNames}
        isAuthor={isAuthor}
      />
    </Link>
  ) : (
    <div className="flex-center gap-1">
      <MetricContent
        imgUrl={imgUrl}
        alt={alt}
        value={value}
        title={title}
        classNames={classNames}
        isAuthor={isAuthor}
      />
    </div>
  );
};

export default Metric;
