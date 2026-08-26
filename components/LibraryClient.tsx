"use client";

import Link from "next/link";
import { ArrowRight, MagnifyingGlass, SpinnerGap, X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { PostRow } from "@/components/PostRow";
import { topics } from "@/lib/topics";
import type { ExperiencePost } from "@/lib/types";

export function LibraryClient({ initialPosts }: { initialPosts: ExperiencePost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const visiblePosts = useMemo(
    () => (expanded || submittedQuery || activeTopic ? posts : posts.slice(0, 3)),
    [activeTopic, expanded, posts, submittedQuery],
  );

  async function loadPosts(next: { query?: string; topic?: string }) {
    setLoading(true);
    setError("");
    setExpanded(true);
    const params = new URLSearchParams();
    if (next.query) params.set("q", next.query);
    if (next.topic) params.set("topic", next.topic);
    try {
      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = (await response.json()) as { posts?: ExperiencePost[]; error?: string };
      if (!response.ok || !data.posts) throw new Error(data.error || "The library could not be loaded.");
      setPosts(data.posts);
      setSubmittedQuery(next.query || "");
      setActiveTopic(next.topic || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The library could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPosts({ query: query.trim() });
  }

  async function chooseTopic(topic: string) {
    setQuery("");
    await loadPosts({ topic: activeTopic === topic ? "" : topic });
  }

  async function clearResults() {
    setQuery("");
    setSubmittedQuery("");
    setActiveTopic("");
    setExpanded(false);
    await loadPosts({});
    setExpanded(false);
  }

  return (
    <main>
      <section className="mx-auto w-full max-w-[1480px] px-5 pb-8 pt-12 sm:px-8 sm:pt-14 lg:px-12 lg:pt-14" aria-labelledby="library-heading">
        <h1 id="library-heading" className="max-w-[920px] text-[clamp(3rem,5vw,4.8rem)] leading-[1.04] tracking-[-0.035em]">
          An anonymous library of human experiences.
        </h1>

        <form className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_420px]" onSubmit={submitSearch}>
          <label className="relative block">
            <span className="sr-only">Describe what you are looking for</span>
            <MagnifyingGlass className="absolute top-1/2 left-5 -translate-y-1/2 text-ink/45" size={23} aria-hidden="true" />
            <input
              className="field min-h-16 pl-14 text-xl"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe what you’re looking for..."
              maxLength={180}
            />
          </label>
          <button className="button-outline min-h-16 text-xl disabled:opacity-100" type="submit" disabled={loading || !query.trim()}>
            {loading ? <><SpinnerGap className="animate-spin" size={22} aria-hidden="true" /> Finding experiences...</> : "Find experiences"}
          </button>
        </form>
        <p className="mt-3 text-base leading-relaxed text-ink/55">
          This first testing version uses keyword search to retrieve entries written by real people. AI-based matching is planned for a later version.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1480px] px-5 pb-8 sm:px-8 lg:px-12" aria-label="Experience library">
        <div className="no-scrollbar flex gap-3 overflow-x-auto border-b border-line py-4" role="group" aria-label="Filter experiences by topic">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              className={`topic-chip ${activeTopic === topic ? "topic-chip-active" : ""}`}
              aria-pressed={activeTopic === topic}
              onClick={() => void chooseTopic(topic)}
              disabled={loading}
            >
              {topic}
            </button>
          ))}
        </div>

        {submittedQuery || activeTopic ? (
          <div className="flex flex-col gap-3 border-b border-line bg-soft/55 px-4 py-4 text-base sm:flex-row sm:items-center sm:justify-between" role="status">
            <span>
              {submittedQuery ? <>Human-written matches for <strong>“{submittedQuery}”</strong></> : <>Browsing <strong>{activeTopic.toLowerCase()}</strong> experiences</>}
            </span>
            <button type="button" className="quiet-link inline-flex items-center gap-1 self-start sm:self-auto" onClick={() => void clearResults()}>
              <X size={16} aria-hidden="true" /> Clear
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="my-6 border border-danger/40 bg-danger/5 p-5" role="alert">
            <p>{error}</p>
            <button className="quiet-link mt-2" type="button" onClick={() => void clearResults()}>Try the full library</button>
          </div>
        ) : null}

        <div className={`border-t border-line ${loading ? "opacity-45" : "opacity-100"}`} aria-busy={loading}>
          {visiblePosts.length ? visiblePosts.map((post) => (
            <PostRow key={post.id} post={post} showMatch={Boolean(submittedQuery)} />
          )) : (
            <div className="py-16 text-center">
              <h2 className="text-3xl">No close matches yet.</h2>
              <p className="mt-3 text-lg text-ink/60">Try a broader description or browse another topic.</p>
              <button className="button-outline mt-6" type="button" onClick={() => void clearResults()}>Browse the full library</button>
            </div>
          )}
        </div>

        {!submittedQuery && !activeTopic && posts.length > 3 ? (
          <div className="flex justify-center py-4">
            <button className="quiet-link text-lg" type="button" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Show fewer entries" : `Show all ${posts.length} experiences`}
            </button>
          </div>
        ) : null}
      </section>

      <section className="mx-auto flex w-full max-w-[1480px] items-center gap-5 px-5 py-10 sm:px-8 lg:px-12" aria-label="Contribute to Unsaid">
        <span className="h-px flex-1 bg-ink/55" aria-hidden="true" />
        <Link href="/contribute" className="group inline-flex items-center gap-3 text-center text-xl text-ink no-underline sm:text-2xl">
          <ArrowRight className="text-sage transition-transform group-hover:translate-x-1" size={32} weight="light" aria-hidden="true" />
          Leave something for whoever comes next.
        </Link>
        <span className="h-px flex-1 bg-ink/55" aria-hidden="true" />
      </section>
    </main>
  );
}
