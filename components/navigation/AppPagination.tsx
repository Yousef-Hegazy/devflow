"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

type Props = {
  page: number;
  pageSize: number;
  totalItems: number;
};

const AppPagination = ({ page, pageSize, totalItems }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);

  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
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

  return totalPages > 1 ? (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? createPageUrl(page - 1) : "#"}
            aria-disabled={!hasPrevious}
            tabIndex={hasPrevious ? 0 : -1}
            className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
            // render={
            //   <Link

            //   />
            // }
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
            // render={
            //   <Link
            //     href={hasNext ? createPageUrl(page + 1) : "#"}
            //     aria-disabled={!hasNext}
            //     tabIndex={hasNext ? 0 : -1}
            //     className={!hasNext ? "pointer-events-none opacity-50" : ""}
            //   />
            // }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ) : null;
};

export default AppPagination;
