import { cn } from "@/lib/utils";
import Link from "next/link";
import qs from "query-string";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props<T extends { filter?: string }> = {
  filters: Array<{ name: string; value: string }>;
  classNames?: {
    container?: string;
    trigger?: string;
  };
  searchParams: T | { [key: string]: string };
};

const CommonFilter = <T extends { filter?: string }>({
  filters,
  classNames,
  searchParams,
}: Props<T>) => {
  const activeFilterKey = searchParams?.filter as string;
  const filter = filters.find((f) => f.value === activeFilterKey);
  const queries = qs.parse(searchParams.toString());

  return (
    <div className={cn("relative", classNames?.container)}>
      <Select value={filter?.value}>
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5",
            classNames?.trigger,
          )}
          aria-label="Filter Options"
        >
          <SelectValue className="line-clamp-1 flex-1 text-left">
            {filter ? filter.name : "Select a Filter"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {filters.map((filter) => (
            <SelectItem
              render={
                <Link
                  replace
                  scroll={false}
                  href={`?${qs.stringify({ ...queries, filter: filter.value }, { skipNull: true, skipEmptyString: true })}`}
                />
              }
              key={filter.value}
              value={filter.value}
            >
              {filter.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
