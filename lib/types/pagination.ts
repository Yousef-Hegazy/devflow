export type PaginationParams<T = undefined> = {
    page: number;
    pageSize: number;
    query?: string;
    filter?: T;
}

export type PaginationSearchParams<T = undefined> = {
    p?: string;
    ps?: string;
    q?: string;
    filter?: T;
};