import { Badge } from "@/components/ui/badge";
import { cn, getDevIconClassName } from "@/lib/utils";
import Link from "next/link";

type Props = {
  $id: string;
  questionsNo?: number;
  name: string;
  showCount?: boolean;
  compact?: boolean;
};

const TagCard = ({ $id, name, questionsNo, showCount, compact }: Props) => {
  const iconClass = () => getDevIconClassName(name);

  return (
    <Link href={`/tags/${$id}`} className="flex justify-between gap-2">
      <Badge className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={cn(iconClass(), "text-sm")} />
          <span>{name}</span>
        </div>
      </Badge>

      {showCount ? (
        <p className="small-medium text-dark500_light700">{questionsNo}</p>
      ) : null}
    </Link>
  );
};

export default TagCard;
