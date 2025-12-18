import { Badge } from "@/components/ui/badge";
import { cn, getDevIconClassName, getTagDescription } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

type Props = {
  $id: string;
  questionsNo?: number;
  name: string;
  showCount?: boolean;
  compact?: boolean;
  isButton?: boolean;
  handleRemove?: (tag: string) => void;
};

const CompactTagContent = ({
  $id,
  name,
  questionsNo,
  showCount,
  isRemove,
  handleRemove,
}: Props & { isRemove?: boolean }) => {
  const iconClass = useMemo(() => getDevIconClassName(name), [name]);

  return (
    <>
      <Badge className="subtle-medium background-light800_dark300 text-light400_light500 flex flex-row items-center gap-2 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={cn(iconClass, "text-sm")} />
          <span>{name}</span>
        </div>

        {isRemove ? (
          <Image
            src="/icons/close.svg"
            width={12}
            height={12}
            alt="close"
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={() => handleRemove?.($id)}
          />
        ) : null}
      </Badge>

      {showCount ? (
        <p className="small-medium text-dark500_light700">{questionsNo}</p>
      ) : null}
    </>
  );
};

const NonCompactTag = ({ name, $id, questionsNo }: Props) => {
  const iconClass = useMemo(() => getDevIconClassName(name), [name]);
  const iconDesc = useMemo(() => getTagDescription(name), [name]);

  return (
    <Link href={`/tags/${$id}`} className="shadow-light100_darknone">
      <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-65">
        <div className="flex items-center justify-between gap-3">
          <div className="background-light800_dark300 w-fit rounded-sm px-5 py-1.5">
            <p className="paragraph-semibold text-dark300_light900">{name}</p>
          </div>
          <i className={cn(iconClass, "text-2xl")} aria-hidden="true" />
        </div>

        <p className="small-regular text-dark500_light700 line-clamp-3 mt-5 w-full">
          {iconDesc}
        </p>

        <p className="small-medium text-dark400_light500 mt-3.5">
          <span className="body-semibold primary-text-gradient mr-2.5">
            {questionsNo}
            {questionsNo ? "+" : ""}
          </span>
        </p>
      </article>
    </Link>
  );
};

const TagCard = ({ compact = true, ...props }: Props) => {
  const isRemove = Boolean(props.isButton && props.handleRemove);

  return compact ? (
    props.isButton ? (
      <CompactTagContent {...props} isRemove={isRemove} />
    ) : (
      // </Button>
      <Link href={`/tags/${props.$id}`} className="flex justify-between gap-2">
        <CompactTagContent {...props} />
      </Link>
    )
  ) : (
    <NonCompactTag {...props} />
  );
};

export default TagCard;
