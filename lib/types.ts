export const reactionTypes = ["seen", "helped", "with_you"] as const;

export type ReactionType = (typeof reactionTypes)[number];

export type ModerationStatus = "published" | "review" | "deleted";

export type ReactionCounts = Record<ReactionType, number>;

export interface ExperiencePost {
  id: string;
  topic: string;
  title: string;
  happened: string;
  helped: string | null;
  wishKnown: string | null;
  authorAlias: string;
  createdAt: string;
  readingTime: string;
  contentNote: string | null;
  tags: string[];
  status: ModerationStatus;
  reactionCounts: ReactionCounts;
  viewerReaction: ReactionType | null;
  replyCount: number;
}

export interface ExperienceReply {
  id: string;
  postId: string;
  authorAlias: string;
  body: string;
  createdAt: string;
  status: "published" | "review";
}

export interface PostDetail extends ExperiencePost {
  replies: ExperienceReply[];
}

export interface NewPostInput {
  topic: string;
  title: string;
  happened: string;
  helped?: string;
  wishKnown?: string;
}

export interface NewReplyInput {
  body: string;
}

export interface ModerationResult {
  decision: "allow" | "review" | "block";
  issues: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

