import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { user } from './auth-schema';
import { question, tag, questionTag, answer, vote, collection, interaction } from './db-schema';

// Enums mirroring Appwrite types
export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

export enum InteractionActionType {
  QUESTION = 'question',
  ANSWER = 'answer',
}

// Select / Insert types for tables
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type Question = InferSelectModel<typeof question>;
export type NewQuestion = InferInsertModel<typeof question>;

export type Tag = InferSelectModel<typeof tag>;
export type NewTag = InferInsertModel<typeof tag>;

export type QuestionTag = InferSelectModel<typeof questionTag>;
export type NewQuestionTag = InferInsertModel<typeof questionTag>;

export type Answer = InferSelectModel<typeof answer>;
export type NewAnswer = InferInsertModel<typeof answer>;

export type Vote = InferSelectModel<typeof vote>;
export type NewVote = InferInsertModel<typeof vote>;

export type Collection = InferSelectModel<typeof collection>;
export type NewCollection = InferInsertModel<typeof collection>;

export type Interaction = InferSelectModel<typeof interaction>;
export type NewInteraction = InferInsertModel<typeof interaction>;
