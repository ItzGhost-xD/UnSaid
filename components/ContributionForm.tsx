"use client";

import Link from "next/link";
import { ArrowLeft, Check, CheckCircle, Copy, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { topicDescriptions, topics } from "@/lib/topics";

type FormState = {
  topic: string;
  title: string;
  happened: string;
  helped: string;
  wishKnown: string;
};

type SubmissionResult = {
  post: { id: string };
  authorAlias: string;
  recoveryCode: string;
  status: "published" | "review";
  moderationIssues: string[];
};

const initialForm: FormState = { topic: "", title: "", happened: "", helped: "", wishKnown: "" };

export function ContributionForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [communityChecked, setCommunityChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [copied, setCopied] = useState(false);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function continueFromWriting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssues([]);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitEntry() {
    setSubmitting(true);
    setIssues([]);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as SubmissionResult & { error?: string; issues?: string[] };
      if (!response.ok) {
        setIssues(data.issues?.length ? data.issues : [data.error || "The entry could not be submitted."]);
        return;
      }
      setResult(data);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setIssues(["The entry could not be submitted. Check your connection and try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.recoveryCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (step === 4 && result) {
    return (
      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <section className="border-y border-line py-12 text-center">
          <CheckCircle className="mx-auto text-sage" size={62} weight="light" aria-hidden="true" />
          <p className="mt-6 text-sm tracking-[0.16em] text-sage uppercase">Contribution received</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-[clamp(2.7rem,7vw,5.5rem)] leading-[1.02]">
            {result.status === "published" ? "Your words are now in the library." : "Your words are waiting for review."}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-ink/65">
            This contribution appears as <strong className="font-normal text-ink">{result.authorAlias}</strong>. The name belongs only to this post; no account or profile was created.
          </p>

          <div className="mx-auto mt-9 max-w-xl border border-ink bg-soft/55 p-6 text-left">
            <div className="flex items-start gap-3">
              <LockKey className="mt-1 shrink-0 text-sage" size={25} aria-hidden="true" />
              <div>
                <h2 className="text-2xl">Keep your recovery code</h2>
                <p className="mt-2 leading-relaxed text-ink/60">It is the only way to remove this contribution later. Unsaid cannot recover it for you.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <code className="border border-line bg-paper px-4 py-3 font-mono text-lg tracking-wider">{result.recoveryCode}</code>
              <button className="button-outline" type="button" onClick={() => void copyCode()}>
                {copied ? <Check size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
          </div>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            {result.status === "published" ? <Link className="button-solid" href={`/experiences/${result.post.id}`}>Read your contribution</Link> : null}
            <Link className="button-outline" href="/">Return to the library</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <Link href="/" className="quiet-link inline-flex items-center gap-2"><ArrowLeft size={19} aria-hidden="true" /> Back to the library</Link>

      <div className="mt-9 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <aside>
          <p className="text-sm tracking-[0.16em] text-sage uppercase">Leave something behind</p>
          <ol className="mt-5 space-y-3" aria-label="Contribution progress">
            {["Choose a topic", "Write the experience", "Privacy check"].map((label, index) => {
              const number = index + 1;
              return (
                <li key={label} className={`flex items-center gap-3 text-lg ${step === number ? "text-ink" : step > number ? "text-sage" : "text-ink/40"}`}>
                  <span className={`inline-flex size-8 items-center justify-center border ${step >= number ? "border-sage" : "border-line"}`}>
                    {step > number ? <Check size={17} aria-hidden="true" /> : number}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
          <div className="mt-7 border-l-2 border-sage pl-4 text-base leading-relaxed text-ink/58">
            A different anonymous animal name is generated for every post. No profile follows you between contributions.
          </div>
        </aside>

        <section>
          {step === 1 ? (
            <div>
              <h1 className="text-[clamp(2.8rem,7vw,5.2rem)] leading-[1.02]">What is this experience about?</h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink/60">Choose the closest topic. It helps readers find your words; it does not define the whole experience.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    className={`topic-card ${form.topic === topic ? "topic-card-active" : ""}`}
                    type="button"
                    aria-pressed={form.topic === topic}
                    onClick={() => update("topic", topic)}
                  >
                    <strong>{topic}</strong>
                    <span>{topicDescriptions[topic]}</span>
                  </button>
                ))}
              </div>
              <button className="button-solid mt-8" type="button" disabled={!form.topic} onClick={() => setStep(2)}>Continue to writing</button>
            </div>
          ) : null}

          {step === 2 ? (
            <form onSubmit={continueFromWriting}>
              <h1 className="text-[clamp(2.8rem,7vw,5.2rem)] leading-[1.02]">Write what you would leave behind.</h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink/60">You do not need to explain everything. Include only the context another person needs to understand the experience.</p>
              <div className="mt-8 space-y-7">
                <label className="form-label">
                  Short title
                  <input className="field" value={form.title} onChange={(event) => update("title", event.target.value)} minLength={8} maxLength={90} required placeholder="What would help someone recognise this experience?" />
                  <span className="field-hint">{form.title.length}/90</span>
                </label>
                <label className="form-label">
                  What happened?
                  <textarea className="field min-h-48" value={form.happened} onChange={(event) => update("happened", event.target.value)} minLength={40} maxLength={1800} required placeholder="Share the experience in your own words..." />
                  <span className="field-hint">{form.happened.length}/1800</span>
                </label>
                <label className="form-label">
                  What helped? <span className="text-ink/45">(optional)</span>
                  <textarea className="field min-h-32" value={form.helped} onChange={(event) => update("helped", event.target.value)} maxLength={900} placeholder="A small action, perspective, person, or change..." />
                  <span className="field-hint">{form.helped.length}/900</span>
                </label>
                <label className="form-label">
                  What do you wish you had known? <span className="text-ink/45">(optional)</span>
                  <textarea className="field min-h-32" value={form.wishKnown} onChange={(event) => update("wishKnown", event.target.value)} maxLength={900} placeholder="Leave something for whoever comes next..." />
                  <span className="field-hint">{form.wishKnown.length}/900</span>
                </label>
              </div>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button className="button-quiet" type="button" onClick={() => setStep(1)}>Back to topics</button>
                <button className="button-solid" type="submit">Continue to privacy check</button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <div>
              <h1 className="text-[clamp(2.8rem,7vw,5.2rem)] leading-[1.02]">One last privacy check.</h1>
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink/60">Automated checks help, but they can miss context. Read your entry once more before it enters the library.</p>

              {issues.length ? (
                <div className="mt-7 border border-danger/45 bg-danger/5 p-5" role="alert">
                  <h2 className="text-xl text-danger">Please change these details</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base">
                    {issues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                </div>
              ) : null}

              <div className="mt-8 border-y border-line py-7">
                <div className="flex flex-wrap justify-between gap-3 text-base text-ink/55"><span className="text-sage">{form.topic}</span><span>Preview</span></div>
                <h2 className="mt-5 text-4xl leading-tight">{form.title}</h2>
                <section className="story-prose mt-6"><h3>What happened</h3><p>{form.happened}</p></section>
                {form.helped ? <section className="story-prose mt-6"><h3>What helped</h3><p>{form.helped}</p></section> : null}
                {form.wishKnown ? <blockquote className="mt-7 border-l-2 border-sage pl-5 text-2xl leading-relaxed">{form.wishKnown}</blockquote> : null}
              </div>

              <div className="mt-7 border border-line bg-soft/60 p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-1 shrink-0 text-sage" size={25} aria-hidden="true" />
                  <div>
                    <h2 className="text-2xl">Automated safety and privacy check</h2>
                    <p className="mt-2 leading-relaxed text-ink/60">Direct contact details, social usernames, links, exact addresses, repeated spam, and some high-risk wording are blocked or held for review. Safe entries publish immediately in this testing build.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="check-row">
                  <input type="checkbox" checked={privacyChecked} onChange={(event) => setPrivacyChecked(event.target.checked)} />
                  <span><LockKey size={20} aria-hidden="true" /> I removed names, contact details, schools, workplaces, and exact locations.</span>
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={communityChecked} onChange={(event) => setCommunityChecked(event.target.checked)} />
                  <span><Check size={20} aria-hidden="true" /> I understand readers may leave supportive reactions and short moderated replies.</span>
                </label>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button className="button-quiet" type="button" onClick={() => setStep(2)}>Edit the entry</button>
                <button className="button-solid" type="button" disabled={!privacyChecked || !communityChecked || submitting} onClick={() => void submitEntry()}>
                  {submitting ? "Checking and submitting..." : "Submit anonymously"}
                </button>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-ink/50">By submitting, you agree to the <Link className="quiet-link" href="/guidelines">submission guidelines</Link>. No account is created.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

