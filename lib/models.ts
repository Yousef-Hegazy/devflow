
export type PaginationParams = {
    page: number;
    pageSize: number;
    query?: string;
}

export type HomeFilterType = "popular" | "all" | "unanswered" | "recommended";

export type CollectionFilterType = "mostrecent" | "oldest" | "mostvoted" | "mostviewed" | "mostanswered";
