"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChatCircle,
  HandHeart,
  Lightbulb,
  SpinnerGap,
  UsersThree,
} from "@phosphor-icons/react";
import { useState } from "react";
import { ReportDialog } from "@/components/ReportDialog";
import type { ExperienceReply, PostDetail, ReactionType } from "@/lib/types";

const reactions: Array<{ type: ReactionType; label: string; icon: typeof HandHeart }> = [
  { type: "seen", label: "I felt this", icon: HandHeart },
  { type: "helped", label: "This helped", icon: Lightbulb },
  { type: "with_you", label: "You’re not alone", icon: UsersThree },
];

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function ExperienceDetail({ initialPost }: { initialPost: PostDetail }) {
  const [post, setPost] = useState(initialPost);
  const [reactionLoading, setReactionLoading] = useState<ReactionType | null>(null);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  async function react(type: ReactionType) {
    setReactionLoading(type);
    try {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: type }),
      });
      const data = (await response.json()) as Pick<PostDetail, "reactionCounts" | "viewerReaction"> & { error?: string };
      if (!response.ok) throw new Error(data.error || "The reaction could not be saved.");
      setPost((current) => ({ ...current, reactionCounts: data.reactionCounts, viewerReaction: data.viewerReaction }));
    } catch (caught) {
      setReplyMessage(caught instanceof Error ? caught.message : "The reaction could not be saved.");
    } finally {
      setReactionLoading(null);
    }
  }

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReplyLoading(true);
    setReplyMessage("");
    try {
      const response = await fetch(`/api/posts/${post.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = (await response.json()) as { reply?: ExperienceReply; status?: "published" | "review"; error?: string; issues?: string[] };
      if (!response.ok || !data.reply) throw new Error(data.issues?.[0] || data.error || "The reply could not be added.");
      if (data.status === "published") {
        setPost((current) => ({ ...current, replies: [...current.replies, data.reply as ExperienceReply], replyCount: current.replyCount + 1 }));
        setReplyMessage(`Reply added as ${data.reply.authorAlias}.`);
      } else {
        setReplyMessage("Your reply was received and is waiting for a safety review.");
      }
      setReply("");
    } catch (caught) {
      setReplyMessage(caught instanceof Error ? caught.message : "The reply could not be added.");
    } finally {
      setReplyLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
        <Link href="/" className="quiet-link inline-flex items-center gap-2 self-start">
          <ArrowLeft size={19} aria-hidden="true" /> Back to the library
        </Link>
        <ReportDialog postId={post.id} />
      </div>

      <article className="mx-auto max-w-3xl py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-ink/60">
          <span className="text-sage">{post.topic}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime}</span>
          <span aria-hidden="true">·</span>
          <span>{shortDate(post.createdAt)}</span>
        </div>
        {post.contentNote ? <p className="mt-5 border-l-2 border-sage pl-4 text-base text-ink/62">Content note: {post.contentNote}</p> : null}
        <h1 className="mt-7 text-[clamp(2.8rem,7vw,5.7rem)] leading-[1.02] tracking-[-0.045em]">{post.title}</h1>
        <p className="mt-5 text-lg text-ink/60">Shared by {post.authorAlias}. No profile is attached.</p>

        <section className="story-prose mt-10" aria-labelledby="what-happened-heading">
          <h2 id="what-happened-heading">What happened</h2>
          <p>{post.happened}</p>
        </section>

        {post.helped ? (
          <section className="story-prose mt-10" aria-labelledby="what-helped-heading">
            <h2 id="what-helped-heading">What helped</h2>
            <p>{post.helped}</p>
          </section>
        ) : null}

        {post.wishKnown ? (
          <blockquote className="mt-12 border-y border-line py-8 text-2xl leading-relaxed sm:px-7 sm:text-3xl">
            <span className="mb-3 block text-sm tracking-[0.16em] text-sage uppercase">What I wish I had known</span>
            {post.wishKnown}
          </blockquote>
        ) : null}

        <p className="mt-8 text-base leading-relaxed text-ink/55">This is one person’s lived experience, not professional advice.</p>
      </article>

      <section className="mx-auto max-w-3xl border-y border-line py-8" aria-labelledby="reactions-heading">
        <h2 id="reactions-heading" className="text-2xl">Did this experience meet you where you are?</h2>
        <p className="mt-2 text-base text-ink/55">Supportive reactions never affect ranking or create a profile.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {reactions.map((item) => {
            const Icon = item.icon;
            const active = post.viewerReaction === item.type;
            return (
              <button
                key={item.type}
                className={`reaction-button ${active ? "reaction-button-active" : ""}`}
                type="button"
                aria-pressed={active}
                disabled={Boolean(reactionLoading)}
                onClick={() => void react(item.type)}
              >
                {reactionLoading === item.type ? <SpinnerGap className="animate-spin" size={19} /> : <Icon size={19} aria-hidden="true" />}
                {item.label}
                <span className="text-ink/50">{post.reactionCounts[item.type]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl py-10" aria-labelledby="replies-heading">
        <div className="flex items-center gap-3">
          <ChatCircle size={25} weight="light" aria-hidden="true" />
          <h2 id="replies-heading" className="text-3xl">Short replies</h2>
          <span className="text-ink/50">{post.replies.length}</span>
        </div>
        <p className="mt-2 text-base text-ink/55">Keep replies kind, brief, and focused on the shared experience. No advice demands or private questions.</p>

        <div className="mt-7 divide-y divide-line border-y border-line">
          {post.replies.length ? post.replies.map((item) => (
            <article key={item.id} className="py-5">
              <div className="flex flex-wrap justify-between gap-3 text-sm text-ink/55">
                <strong className="font-normal text-sage">{item.authorAlias}</strong>
                <time dateTime={item.createdAt}>{shortDate(item.createdAt)}</time>
              </div>
              <p className="mt-2 text-lg leading-relaxed">{item.body}</p>
            </article>
          )) : <p className="py-7 text-ink/55">No replies yet. A quiet response can be the first one.</p>}
        </div>

        <form className="mt-7" onSubmit={submitReply}>
          <label className="form-label">
            Leave a short anonymous reply
            <textarea
              className="field min-h-28"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              minLength={2}
              maxLength={280}
              required
              placeholder="Share recognition or a brief perspective..."
            />
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-ink/50">{reply.length}/280 · A fresh anonymous name is generated when you reply.</span>
            <button className="button-solid" type="submit" disabled={replyLoading || !reply.trim()}>
              {replyLoading ? "Checking reply..." : "Add reply"}
            </button>
          </div>
          {replyMessage ? <p className="mt-4 text-base text-sage" role="status">{replyMessage}</p> : null}
        </form>
      </section>
    </main>
  );
}

