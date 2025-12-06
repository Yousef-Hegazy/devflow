"use client";

import { formUrlQuery } from "@/lib/helpers/url";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

const filters = [
  { name: "All", value: "all" },
  { name: "Popular", value: "popular" },
  { name: "Unanswered", value: "unanswered" },
  { name: "Recommended", value: "recommended" },
];

const HomeFilter = () => {
  const path = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const activeFilter = sp.get("filter") || "all";

  const handleSelectFilter = (filter: (typeof filters)[number]) => {
    const newUrl = formUrlQuery({
      params: sp.toString(),
      key: "filter",
      value: filter.value,
    });

    router.push(`${path}?${newUrl}`, { scroll: false });
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => handleSelectFilter(filter)}
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
