import { AnswersFilterType, CollectionFilterType, FilterObjectType, GlobalSearchFilterType, HomeFilterType, TagsFilterType, UsersFilterType } from "../types/filters";

export const homeFilters: Array<FilterObjectType<HomeFilterType>> = [
    { name: "All", value: "all" },
    { name: "Popular", value: "popular" },
    { name: "Unanswered", value: "unanswered" },
    { name: "Recommended", value: "recommended" },
];

export const collectionFilters: Array<FilterObjectType<CollectionFilterType>> = [
    {
        name: "Most Recent", value: "mostrecent"
    },
    { name: "Oldest", value: "oldest" },
    { name: "Most Voted", value: "mostvoted" },
    { name: "Most Viewed", value: "mostviewed" },
    { name: "Most Answered", value: "mostanswered" }

]

export const answerFilters: Array<FilterObjectType<AnswersFilterType>> = [
    { name: "Newest", value: "latest" },
    { name: "Oldest", value: "oldest" },
    { name: "Popular", value: "popular" },
];


export const tagFilters: Array<FilterObjectType<TagsFilterType>> = [
    { name: "A-Z", value: "name" },
    { name: "Recent", value: "recent" },
    { name: "Oldest", value: "oldest" },
    { name: "Popular", value: "popular" },
];

export const userFilters: Array<FilterObjectType<UsersFilterType>> = [
    { name: "Newest", value: "newest" },
    { name: "Oldest", value: "oldest" },
    { name: "Popular", value: "popular" },
];

export const globalSearchFilters: Array<FilterObjectType<GlobalSearchFilterType>> = [
    { name: "Question", value: "question" },
    { name: "Answer", value: "answer" },
    { name: "User", value: "user" },
    { name: "Tag", value: "tag" },
];