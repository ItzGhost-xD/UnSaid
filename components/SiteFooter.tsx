import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 text-base text-ink/70 sm:flex-row sm:items-center sm:justify-between">
        <p>Human experiences, shared without a profile.</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
          <Link className="quiet-link" href="/guidelines">Submission guidelines</Link>
          <Link className="quiet-link" href="/manage">Remove a contribution</Link>
          <Link className="quiet-link" href="/safety">Privacy and safety</Link>
        </nav>
      </div>
    </footer>
  );
}

