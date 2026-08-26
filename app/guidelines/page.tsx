import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Submission guidelines" };

const guidelines = [
  ["Share your own experience", "Write from your point of view. Do not expose, accuse, or identify another person."],
  ["Protect private details", "Remove names, contact details, usernames, links, exact locations, schools, workplaces, and any detail that could reveal someone’s identity."],
  ["Leave perspective, not instructions", "Describe what happened and what helped you. Do not present your experience as a guaranteed solution or professional advice."],
  ["Keep it relevant", "Choose the closest topic and include only the context a reader needs to understand the experience."],
  ["Make replies kind and brief", "Short replies should acknowledge the experience or add a careful perspective. Do not demand answers, judge the writer, or ask for private contact."],
  ["Do not promote or flood", "Spam, advertising, repeated text, copied submissions, and attempts to manipulate reactions are removed."],
  ["Accept moderation", "Automation may block private information or hold an entry for review. Reports can temporarily hide content while it is checked."],
];

export default function GuidelinesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <p className="text-sm tracking-[0.18em] text-sage uppercase">Submission guidelines</p>
      <h1 className="mt-5 text-[clamp(3rem,7vw,5.6rem)] leading-[1.02]">Write for the person who comes next.</h1>
      <p className="mt-6 max-w-3xl text-xl leading-relaxed text-ink/65">The strongest entries are honest, specific enough to recognise, and careful with everyone’s privacy. They do not need a perfect lesson or a positive ending.</p>

      <ol className="mt-10 divide-y divide-line border-y border-line">
        {guidelines.map(([title, copy], index) => (
          <li key={title} className="grid gap-3 py-6 sm:grid-cols-[52px_1fr] sm:gap-5">
            <span className="text-xl text-sage">{String(index + 1).padStart(2, "0")}</span>
            <div><h2 className="text-2xl">{title}</h2><p className="mt-2 text-lg leading-relaxed text-ink/65">{copy}</p></div>
          </li>
        ))}
      </ol>

      <section className="mt-10 border-l-2 border-sage pl-5">
        <h2 className="text-2xl">Before you submit</h2>
        <p className="mt-2 text-lg leading-relaxed text-ink/65">Read the entry once as if it belonged to someone else. Remove anything that could reveal a person, check that the title matches the experience, and decide whether you are comfortable with supportive reactions and short replies.</p>
      </section>

      <Link className="button-solid mt-9" href="/contribute">Begin an anonymous contribution</Link>
    </main>
  );
}

