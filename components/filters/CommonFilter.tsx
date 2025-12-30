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
  searchParams: sp,
}: Props<T>) => {
  const searchParams = qs.parse(
    qs.stringify(sp, {
      skipEmptyString: true,
      skipNull: true,
    }),
    {
      parseBooleans: true,
      parseNumbers: true,
    },
  ) as { [key: string]: string };
  const activeFilterKey = searchParams?.filter || "";
  const filter = filters.find((f) => f.value === activeFilterKey);

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
                  href={{
                    pathname: "",
                    query: {
                      ...Object.assign(searchParams || {}, {
                        filter: filter.value,
                        p: 1,
                      }),
                    },
                  }}
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
