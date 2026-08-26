import Link from "next/link";
import type { ExperiencePost } from "@/lib/types";

export function PostRow({ post, showMatch = false }: { post: ExperiencePost; showMatch?: boolean }) {
  return (
    <Link
      href={`/experiences/${post.id}`}
      className="group grid min-h-24 grid-cols-1 gap-3 border-b border-line px-1 py-4 text-ink no-underline transition-colors hover:bg-soft/65 focus-visible:bg-soft/65 sm:grid-cols-[190px_1fr_auto] sm:items-center sm:gap-7 sm:px-6"
    >
      <span className="text-base text-ink/70 sm:border-r sm:border-line sm:py-2">{post.topic}</span>
      <span className="min-w-0">
        <span className="block text-[1.4rem] leading-tight transition-transform group-hover:translate-x-1 sm:text-[1.55rem]">
          {post.title}
        </span>
        <span className="mt-1 block truncate text-base leading-normal text-ink/58">
          {post.happened}
        </span>
        {showMatch ? (
          <span className="mt-2 block text-sm text-sage">Matched through {post.tags.slice(0, 3).join(", ")}</span>
        ) : null}
      </span>
      <span className="flex items-center gap-4 whitespace-nowrap text-sm text-ink/60 sm:flex-col sm:items-end sm:gap-2">
        <span>{post.readingTime}</span>
      </span>
    </Link>
  );
}
