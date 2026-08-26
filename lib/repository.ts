import { randomUUID } from "node:crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { seedPosts, seedReplies } from "@/lib/seed-data";
import type {
  ExperiencePost,
  ExperienceReply,
  ModerationStatus,
  NewPostInput,
  PostDetail,
  ReactionCounts,
  ReactionType,
} from "@/lib/types";

interface StoredPost extends ExperiencePost {
  recoveryHash?: string;
}

interface MemoryStore {
  posts: StoredPost[];
  replies: ExperienceReply[];
  reactions: Map<string, Map<string, ReactionType>>;
  reports: Array<{ postId: string; sessionHash: string; reason: string; details: string; createdAt: string }>;
}

declare global {
  var __unsaidMemoryStore: MemoryStore | undefined;
}

const memoryStore: MemoryStore = globalThis.__unsaidMemoryStore ?? {
  posts: structuredClone(seedPosts),
  replies: structuredClone(seedReplies),
  reactions: new Map(),
  reports: [],
};
globalThis.__unsaidMemoryStore = memoryStore;

type DbPost = {
  id: string;
  topic: string;
  title: string;
  happened: string;
  helped: string | null;
  wish_known: string | null;
  author_alias: string;
  created_at: string;
  content_note: string | null;
  tags: string[] | null;
  status: ModerationStatus;
};

type DbReply = {
  id: string;
  post_id: string;
  author_alias: string;
  body: string;
  created_at: string;
  status: "published" | "review";
};

function emptyCounts(): ReactionCounts {
  return { seen: 0, helped: 0, with_you: 0 };
}

function readingTime(...parts: Array<string | null | undefined>) {
  const words = parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
}

function scorePost(post: ExperiencePost, query: string) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9]/g, ""))
    .filter((term) => term.length > 2);
  if (!terms.length) return 1;
  const searchable = [post.topic, post.title, post.happened, post.helped, post.wishKnown, ...post.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0);
}

function withMemoryEngagement(post: StoredPost, sessionHash?: string): ExperiencePost {
  const viewerReactions = memoryStore.reactions.get(post.id);
  const counts = { ...post.reactionCounts };
  viewerReactions?.forEach((reaction) => {
    counts[reaction] += 1;
  });
  const replyCount = memoryStore.replies.filter((reply) => reply.postId === post.id && reply.status === "published").length;
  return {
    ...post,
    reactionCounts: counts,
    viewerReaction: sessionHash ? viewerReactions?.get(sessionHash) ?? null : null,
    replyCount,
  };
}

function mapDbPost(
  post: DbPost,
  reactions: Array<{ reaction_type: ReactionType; session_hash: string }> = [],
  replies: DbReply[] = [],
  sessionHash?: string,
): ExperiencePost {
  const reactionCounts = emptyCounts();
  reactions.forEach((reaction) => {
    reactionCounts[reaction.reaction_type] += 1;
  });
  return {
    id: post.id,
    topic: post.topic,
    title: post.title,
    happened: post.happened,
    helped: post.helped,
    wishKnown: post.wish_known,
    authorAlias: post.author_alias,
    createdAt: post.created_at,
    readingTime: readingTime(post.happened, post.helped, post.wish_known),
    contentNote: post.content_note,
    tags: post.tags ?? [],
    status: post.status,
    reactionCounts,
    viewerReaction: sessionHash
      ? reactions.find((reaction) => reaction.session_hash === sessionHash)?.reaction_type ?? null
      : null,
    replyCount: replies.filter((reply) => reply.status === "published").length,
  };
}

async function loadSupabaseEngagement(postIds: string[]) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !postIds.length) return { reactions: [], replies: [] };

  const [{ data: reactions, error: reactionError }, { data: replies, error: replyError }] = await Promise.all([
    supabase.from("reactions").select("post_id,reaction_type,session_hash").in("post_id", postIds),
    supabase.from("replies").select("id,post_id,author_alias,body,created_at,status").in("post_id", postIds),
  ]);

  if (reactionError) throw new Error(reactionError.message);
  if (replyError) throw new Error(replyError.message);
  return {
    reactions: (reactions ?? []) as Array<{ post_id: string; reaction_type: ReactionType; session_hash: string }>,
    replies: (replies ?? []) as DbReply[],
  };
}

export function dataMode() {
  return isSupabaseConfigured() ? "supabase" : "demo";
}

export async function listPosts(options: { topic?: string; query?: string; sessionHash?: string } = {}) {
  const topic = options.topic?.trim();
  const query = options.query?.trim() ?? "";
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    let posts = memoryStore.posts
      .filter((post) => post.status === "published")
      .map((post) => withMemoryEngagement(post, options.sessionHash));
    if (topic) posts = posts.filter((post) => post.topic === topic);
    if (query) {
      posts = posts
        .map((post) => ({ post, score: scorePost(post, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ post }) => post);
    }
    return posts;
  }

  let request = supabase.from("posts").select("id,topic,title,happened,helped,wish_known,author_alias,created_at,content_note,tags,status").eq("status", "published");
  if (topic) request = request.eq("topic", topic);
  if (query) request = request.textSearch("search_document", query, { type: "websearch", config: "english" });
  const { data, error } = await request.order("created_at", { ascending: false }).limit(40);
  if (error) throw new Error(error.message);

  const posts = (data ?? []) as DbPost[];
  const engagement = await loadSupabaseEngagement(posts.map((post) => post.id));
  return posts.map((post) => mapDbPost(
    post,
    engagement.reactions.filter((reaction) => reaction.post_id === post.id),
    engagement.replies.filter((reply) => reply.post_id === post.id),
    options.sessionHash,
  ));
}

export async function getPost(id: string, sessionHash?: string): Promise<PostDetail | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const stored = memoryStore.posts.find((post) => post.id === id && post.status === "published");
    if (!stored) return null;
    return {
      ...withMemoryEngagement(stored, sessionHash),
      replies: memoryStore.replies
        .filter((reply) => reply.postId === id && reply.status === "published")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id,topic,title,happened,helped,wish_known,author_alias,created_at,content_note,tags,status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const engagement = await loadSupabaseEngagement([id]);
  return {
    ...mapDbPost(data as DbPost, engagement.reactions, engagement.replies, sessionHash),
    replies: engagement.replies
      .filter((reply) => reply.status === "published")
      .map((reply) => ({
        id: reply.id,
        postId: reply.post_id,
        authorAlias: reply.author_alias,
        body: reply.body,
        createdAt: reply.created_at,
        status: reply.status,
      })),
  };
}

export async function createPost(input: NewPostInput, options: {
  authorAlias: string;
  recoveryHash: string;
  sessionHash: string;
  status: ModerationStatus;
  moderationNotes: string[];
}) {
  const post: StoredPost = {
    id: randomUUID(),
    topic: input.topic,
    title: input.title,
    happened: input.happened,
    helped: input.helped || null,
    wishKnown: input.wishKnown || null,
    authorAlias: options.authorAlias,
    createdAt: new Date().toISOString(),
    readingTime: readingTime(input.happened, input.helped, input.wishKnown),
    contentNote: null,
    tags: [input.topic.toLowerCase()],
    status: options.status,
    reactionCounts: emptyCounts(),
    viewerReaction: null,
    replyCount: 0,
    recoveryHash: options.recoveryHash,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    memoryStore.posts.unshift(post);
    return post;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      id: post.id,
      topic: post.topic,
      title: post.title,
      happened: post.happened,
      helped: post.helped,
      wish_known: post.wishKnown,
      author_alias: post.authorAlias,
      status: post.status,
      session_hash: options.sessionHash,
      recovery_hash: options.recoveryHash,
      moderation_notes: options.moderationNotes,
      tags: post.tags,
    })
    .select("id,topic,title,happened,helped,wish_known,author_alias,created_at,content_note,tags,status")
    .single();
  if (error) throw new Error(error.message);
  return mapDbPost(data as DbPost);
}

export async function toggleReaction(postId: string, sessionHash: string, reactionType: ReactionType) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const post = memoryStore.posts.find((item) => item.id === postId && item.status === "published");
    if (!post) return null;
    const postReactions = memoryStore.reactions.get(postId) ?? new Map<string, ReactionType>();
    if (postReactions.get(sessionHash) === reactionType) postReactions.delete(sessionHash);
    else postReactions.set(sessionHash, reactionType);
    memoryStore.reactions.set(postId, postReactions);
    return withMemoryEngagement(post, sessionHash);
  }

  const { data: existing, error: existingError } = await supabase
    .from("reactions")
    .select("reaction_type")
    .eq("post_id", postId)
    .eq("session_hash", sessionHash)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  if (existing?.reaction_type === reactionType) {
    const { error } = await supabase.from("reactions").delete().eq("post_id", postId).eq("session_hash", sessionHash);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("reactions").upsert(
      { post_id: postId, session_hash: sessionHash, reaction_type: reactionType },
      { onConflict: "post_id,session_hash" },
    );
    if (error) throw new Error(error.message);
  }
  return getPost(postId, sessionHash);
}

export async function addReply(postId: string, options: {
  body: string;
  authorAlias: string;
  sessionHash: string;
  status: "published" | "review";
}) {
  const reply: ExperienceReply = {
    id: randomUUID(),
    postId,
    authorAlias: options.authorAlias,
    body: options.body,
    createdAt: new Date().toISOString(),
    status: options.status,
  };
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (!memoryStore.posts.some((post) => post.id === postId && post.status === "published")) return null;
    memoryStore.replies.push(reply);
    return reply;
  }

  const { data, error } = await supabase
    .from("replies")
    .insert({
      id: reply.id,
      post_id: postId,
      author_alias: reply.authorAlias,
      body: reply.body,
      session_hash: options.sessionHash,
      status: reply.status,
    })
    .select("id,post_id,author_alias,body,created_at,status")
    .single();
  if (error) throw new Error(error.message);
  const row = data as DbReply;
  return {
    id: row.id,
    postId: row.post_id,
    authorAlias: row.author_alias,
    body: row.body,
    createdAt: row.created_at,
    status: row.status,
  } satisfies ExperienceReply;
}

export async function reportPost(postId: string, options: { sessionHash: string; reason: string; details: string }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const post = memoryStore.posts.find((item) => item.id === postId && item.status === "published");
    if (!post) return null;
    if (!memoryStore.reports.some((report) => report.postId === postId && report.sessionHash === options.sessionHash)) {
      memoryStore.reports.push({ postId, ...options, createdAt: new Date().toISOString() });
    }
    const reportCount = memoryStore.reports.filter((report) => report.postId === postId).length;
    if (reportCount >= 3) post.status = "review";
    return { received: true, hiddenForReview: reportCount >= 3 };
  }

  const { error } = await supabase.from("reports").upsert(
    { post_id: postId, session_hash: options.sessionHash, reason: options.reason, details: options.details },
    { onConflict: "post_id,session_hash" },
  );
  if (error) throw new Error(error.message);
  const { count, error: countError } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  if (countError) throw new Error(countError.message);
  const hiddenForReview = (count ?? 0) >= 3;
  if (hiddenForReview) {
    const { error: updateError } = await supabase.from("posts").update({ status: "review" }).eq("id", postId);
    if (updateError) throw new Error(updateError.message);
  }
  return { received: true, hiddenForReview };
}

export async function removePostByRecoveryHash(recoveryHash: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const post = memoryStore.posts.find((item) => item.recoveryHash === recoveryHash && item.status !== "deleted");
    if (!post) return false;
    post.status = "deleted";
    return true;
  }

  const { data, error } = await supabase
    .from("posts")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("recovery_hash", recoveryHash)
    .neq("status", "deleted")
    .select("id");
  if (error) throw new Error(error.message);
  return Boolean(data?.length);
}
