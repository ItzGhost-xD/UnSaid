import type { Metadata } from "next";
import Link from "next/link";
import { EyeSlash, Gauge, LockKey, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Safety and privacy" };

const safeguards = [
  {
    title: "Private by default",
    icon: LockKey,
    copy: "No account, public identity, profile, or direct message inbox is created. Anonymous session IDs are kept in an HTTP-only cookie and stored only as one-way hashes when needed for abuse prevention.",
  },
  {
    title: "Private details are stopped",
    icon: EyeSlash,
    copy: "Direct contact information, social usernames, links, and exact-looking addresses are blocked before publication. References that may identify a school, workplace, or location are held for review.",
  },
  {
    title: "Every action has limits",
    icon: Gauge,
    copy: "Posts, replies, reactions, reports, and recovery-code attempts have separate rate limits so one anonymous session cannot flood the community.",
  },
  {
    title: "Reporting changes visibility",
    icon: ShieldCheck,
    copy: "Readers can privately report an entry. Repeated reports temporarily remove it from public view until moderation can review it.",
  },
];

export default function SafetyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <p className="text-sm tracking-[0.18em] text-sage uppercase">Safety and privacy</p>
      <h1 className="mt-5 max-w-4xl text-[clamp(3rem,7vw,6rem)] leading-[1.02] tracking-[-0.045em]">A quiet space still needs clear boundaries.</h1>
      <p className="mt-7 max-w-3xl text-xl leading-relaxed text-ink/65">Unsaid is an experience-sharing community, not a professional advice or emergency service. The first testing build uses several layers of prevention instead of relying on anonymity alone.</p>

      <div className="mt-12 grid border-t border-line md:grid-cols-2">
        {safeguards.map((item, index) => {
          const Icon = item.icon;
          return (
            <section key={item.title} className={`border-b border-line py-8 md:px-8 ${index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"}`}>
              <Icon className="text-sage" size={30} weight="light" aria-hidden="true" />
              <h2 className="mt-5 text-3xl">{item.title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-ink/65">{item.copy}</p>
            </section>
          );
        })}
      </div>

      <section className="mt-12 border border-ink p-6 sm:p-8">
        <h2 className="text-3xl">What automation does—and does not do</h2>
        <p className="mt-4 max-w-4xl text-lg leading-relaxed text-ink/65">Automated checks identify obvious private information, repetition, spam patterns, and wording that needs closer review. They do not decide whether a person’s experience is valid, and they can make mistakes. Clear reporting and human moderation remain necessary before a public launch.</p>
      </section>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link className="button-outline" href="/guidelines">Read submission guidelines</Link>
        <Link className="button-solid" href="/contribute">Share an experience</Link>
      </div>
    </main>
  );
}

