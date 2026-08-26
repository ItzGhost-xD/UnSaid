import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8 lg:px-12">
      <p className="text-sm tracking-[0.18em] text-sage uppercase">Not found</p>
      <h1 className="mt-5 text-5xl leading-tight">That experience is no longer in the library.</h1>
      <p className="mt-5 text-xl text-ink/60">It may have been removed by its contributor or held for moderation.</p>
      <Link className="button-solid mt-8" href="/">Browse other experiences</Link>
    </main>
  );
}

