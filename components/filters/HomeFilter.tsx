import { homeFilters } from "@/lib/constants/filters";
import { cn } from "@/lib/utils";
import Link from "next/link";
import qs from "query-string";
import { Button } from "../ui/button";

const HomeFilter = ({
  searchParams: sp,
}: {
  searchParams: { [key: string]: string };
}) => {
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

  const activeFilter = searchParams?.filter || "all";

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {homeFilters.map((filter) => (
        <Button
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
          className={cn(
            "body-medium bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300 rounded-lg border-0 px-6 py-3 capitalize shadow-none",
            {
              "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400":
                activeFilter === filter.value,
            },
          )}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilter;
