"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import qs from "query-string";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100] as const;

type Props = {
  page: number;
  pageSize: number;
  totalItems: number;
};

const AppPagination = ({ page, pageSize, totalItems }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);

  // Parse search params using query-string
  const parsedParams = qs.parse(searchParams.toString(), {
    parseNumbers: true,
    parseBooleans: true,
  }) as Record<string, string | number | boolean>;

  const createPageUrl = (pageNumber: number) => {
    return qs.stringifyUrl(
      {
        url: pathname,
        query: { ...parsedParams, p: pageNumber },
      },
      { skipEmptyString: true, skipNull: true },
    );
  };

  const createPageSizeUrl = (size: number) => {
    return qs.stringifyUrl(
      {
        url: pathname,
        query: { ...parsedParams, ps: size, p: 1 },
      },
      { skipEmptyString: true, skipNull: true },
    );
  };

  // Generate visible page numbers with ellipsis logic
  const getVisiblePages = (): (
    | number
    | "ellipsis-start"
    | "ellipsis-end"
  )[] => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <Pagination className="w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={hasPrevious ? createPageUrl(page - 1) : "#"}
              aria-disabled={!hasPrevious}
              tabIndex={hasPrevious ? 0 : -1}
              className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {visiblePages.map((pageItem) => {
            if (pageItem === "ellipsis-start" || pageItem === "ellipsis-end") {
              return (
                <PaginationItem key={pageItem}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageItem}>
                <PaginationLink
                  href={createPageUrl(pageItem)}
                  // render={<Link href={createPageUrl(pageItem)} />}
                  isActive={page === pageItem}
                >
                  {pageItem}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href={hasNext ? createPageUrl(page + 1) : "#"}
              aria-disabled={!hasNext}
              tabIndex={hasNext ? 0 : -1}
              className={!hasNext ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <PageSizeSelector
        currentSize={pageSize}
        createPageSizeUrl={createPageSizeUrl}
      />
    </div>
  );
};

type PageSizeSelectorProps = {
  currentSize: number;
  createPageSizeUrl: (size: number) => string;
};

const PageSizeSelector = ({
  currentSize,
  createPageSizeUrl,
}: PageSizeSelectorProps) => {
  return (
    <div className="w-full max-w-20">
      <Select value={currentSize.toString()}>
        <SelectTrigger
          className="no-focus light-border background-light800_dark300 text-dark500_light700 h-9 w-full max-w-full min-w-0 gap-1 rounded-md border px-3 text-sm"
          aria-label="Items per page"
        >
          <SelectValue>{currentSize}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem
              render={
                <Link replace scroll={false} href={createPageSizeUrl(size)} />
              }
              key={size}
              value={size.toString()}
            >
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppPagination;
