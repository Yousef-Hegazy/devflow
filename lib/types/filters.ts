export type FilterObjectType<T> = {
    name: string;
    value: T;
};
export type HomeFilterType = "popular" | "all" | "unanswered" | "recommended";
export type CollectionFilterType = "mostrecent" | "oldest" | "mostvoted" | "mostviewed" | "mostanswered";
export type UsersFilterType = "popular" | "oldest" | "newest";
export type AnswersFilterType = "popular" | "oldest" | "latest";
export type TagsFilterType = "name" | "recent" | "oldest" | "popular";
export type GlobalSearchFilterType = "question" | "answer" | "user" | "tag";