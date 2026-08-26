import type { Metadata } from "next";
import { ManageContribution } from "@/components/ManageContribution";

export const metadata: Metadata = { title: "Remove a contribution" };

export default function ManagePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <p className="text-sm tracking-[0.18em] text-sage uppercase">Contributor control</p>
      <h1 className="mt-5 text-[clamp(3rem,7vw,5.4rem)] leading-[1.02]">Remove something you left behind.</h1>
      <p className="mt-6 text-xl leading-relaxed text-ink/65">Because Unsaid has no accounts, your private recovery code is the only way to remove a contribution. The code is checked as a one-way hash and is never shown publicly.</p>
      <ManageContribution />
    </main>
  );
}

