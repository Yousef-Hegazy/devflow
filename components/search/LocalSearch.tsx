"use client";

import { formUrlQuery, removeKeysFromQuery } from "@/lib/helpers/url";
import { cn } from "@/lib/utils";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const LocalSearch = ({
  imgSrc = "/icons/search.svg",
  placeholder = "Search...",
  classNames = {
    container: "",
    input: "",
    icon: "",
  },
}: {
  imgSrc?: string;
  placeholder?: string;
  classNames?: {
    container?: string;
    input?: string;
    icon?: string;
  };
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const query = sp.get("q") || "";

  const [value, setValue] = useState<string>(query);

  const debouncedQuery = useDebounce(value, 500);

  const handleSearch = useCallback(
    (query: string) => {
      if (query && query.length > 0) {
        const newUrl = formUrlQuery({
          params: sp.toString(),
          key: "q",
          value: query,
        });

        router.push(`${pathname}?${newUrl}`, { scroll: false });
      } else {
        const newUrl = removeKeysFromQuery({
          params: sp.toString(),
          keys: ["q"],
        });

        router.push(`${pathname}?${newUrl}`, { scroll: false });
      }
    },
    [pathname, router, sp],
  );

  useEffect(() => {
    handleSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div
      className={cn(
        "background-light800_darkgradient flex items-center gap-4 rounded-[10px] px-4",
        classNames.container,
      )}
    >
      <Image
        src={imgSrc}
        alt="Search"
        width={24}
        height={24}
        className={cn("cursor-pointer", classNames.icon)}
      />

      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "paragraph-regular min-h-14 w-full flex-1 rounded-[10px] border-none shadow-none outline-none focus:outline-none",
          classNames.input,
        )}
        value={value}
        onChange={(e) => setValue(e.target.value || "")}
      />
    </div>
  );
};

export default LocalSearch;
