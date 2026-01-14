import {
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core';

// Enums
export const voteType = pgEnum('vote_type', ['upvote', 'downvote']);
export const interactionType = pgEnum('interaction_type', ['question', 'answer']);

// NOTE: user table is defined in `db/auth-schema.ts` — import it to reference
import { user } from './auth-schema';

// Question table
export const question = pgTable('question', {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: text('author_id').notNull().references(() => user.id),
    title: text('title').notNull(),
    content: text('content').notNull(),
    views: integer('views').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => [
    index('question_author_idx').on(table.authorId)
]);


// Tag table
export const tag = pgTable('tag', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('tag_title_unique').on(table.title)
]);

// QuestionTag join table
export const questionTag = pgTable('question_tag', {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id').notNull().references(() => question.id),
    tagId: uuid('tag_id').notNull().references(() => tag.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('question_tag_unique').on(table.questionId, table.tagId)
]);

// Answer table
export const answer = pgTable('answer', {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: text('author_id').notNull().references(() => user.id),
    questionId: uuid('question_id').notNull().references(() => question.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => [
    index('answer_question_idx').on(table.questionId)
]);

// Vote table
export const vote = pgTable('vote', {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: text('author_id').notNull().references(() => user.id),
    questionId: uuid('question_id').references(() => question.id),
    answerId: uuid('answer_id').references(() => answer.id),
    type: voteType('type').notNull().default('upvote'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('vote_on_question_unique').on(table.authorId, table.questionId),
    uniqueIndex('vote_on_answer_unique').on(table.authorId, table.answerId)
]);

// Collection table
export const collection = pgTable('collection', {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: text('author_id').notNull().references(() => user.id),
    questionId: uuid('question_id').notNull().references(() => question.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('collection_unique').on(table.authorId, table.questionId)
]);

// Interaction table
export const interaction = pgTable('interaction', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id),
    action: text('action').notNull(),
    actionId: uuid('action_id').notNull(),
    actionType: interactionType('action_type').notNull().default('question'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
