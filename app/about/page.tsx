import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <p className="text-sm tracking-[0.18em] text-sage uppercase">About Unsaid</p>
      <h1 className="mt-5 max-w-4xl text-[clamp(3rem,7vw,6rem)] leading-[1.02] tracking-[-0.045em]">AI finds the humans. It does not replace them.</h1>
      <div className="mt-10 max-w-3xl space-y-7 text-xl leading-[1.8] text-ink/75">
        <p>Unsaid is an anonymous library of human experiences: a place where people leave behind the things they wish someone had told them when they were going through something.</p>
        <p>You can describe what you are facing and find words written by someone who has experienced something similar. The technology handles discovery and safety checks; the understanding still comes from another person.</p>
        <p>There are no profiles, followers, rankings, or direct messages. Reactions are supportive rather than competitive, and short replies stay attached to the experience instead of opening private conversations.</p>
        <p>Come here when you need to find someone who has been there. When you are ready, leave something for whoever comes next.</p>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="button-outline">Browse experiences</Link>
        <Link href="/contribute" className="button-solid"><ArrowRight size={20} aria-hidden="true" /> Leave something behind</Link>
      </div>
    </main>
  );
}

