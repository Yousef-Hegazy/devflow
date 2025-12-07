import { Badge } from "@/components/ui/badge";
import { cn, getDevIconClassName } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Props = {
  $id: string;
  questionsNo?: number;
  name: string;
  showCount?: boolean;
  compact?: boolean;
  isButton?: boolean;
  handleRemove?: (tag: string) => void;
};

const TagContent = ({
  $id,
  name,
  questionsNo,
  showCount,
  isRemove,
  handleRemove,
}: Props & { isRemove?: boolean }) => {
  const iconClass = () => getDevIconClassName(name);

  return (
    <>
      <Badge className="subtle-medium background-light800_dark300 text-light400_light500 flex flex-row items-center gap-2 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={cn(iconClass(), "text-sm")} />
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

const TagCard = (props: Props) => {
  const isRemove = Boolean(props.isButton && props.handleRemove);
  return props.isButton ? (
    // <Button className="flex justify-between gap-2 border-0! bg-transparent px-0! py-0! shadow-none! ring-0 outline-none hover:bg-transparent">
    <TagContent {...props} isRemove={isRemove} />
  ) : (
    // </Button>
    <Link href={`/tags/${props.$id}`} className="flex justify-between gap-2">
      <TagContent {...props} />
    </Link>
  );
};

export default TagCard;
