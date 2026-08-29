"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Moon, Sun, X } from "@phosphor-icons/react";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Library" },
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety" },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/experiences/");
  return pathname.startsWith(href);
}

function toggleTheme() {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;

  try {
    window.localStorage.setItem("unsaid-theme", nextTheme);
  } catch {
    // The selected theme still applies for this visit when storage is unavailable.
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-24 w-full max-w-[1480px] items-center px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="font-wordmark text-[2.05rem] tracking-[0.16em] text-ink no-underline sm:text-[2.3rem]"
          aria-label="Unsaid home"
        >
          UNSAID
        </Link>

        <nav
          aria-label="Main navigation"
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute inset-x-0 top-full flex-col border-b border-line bg-paper px-5 py-5 shadow-sm lg:static lg:ml-14 lg:flex lg:flex-1 lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-8">
            {navigation.map((item) => {
              const active = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`relative px-1 py-3 text-xl no-underline transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-ink after:transition-transform lg:py-2 ${
                    active ? "text-ink after:scale-x-100" : "text-ink/70 after:scale-x-0 hover:text-ink hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <Link href="/contribute" className="button-outline mt-4 lg:mt-0 lg:ml-auto" onClick={() => setMenuOpen(false)}>
            Leave something behind
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <button
            type="button"
            className="icon-button"
            aria-label="Switch between light and dark mode"
            title="Switch between light and dark mode"
            onClick={toggleTheme}
          >
            <Moon className="theme-toggle-moon" size={22} aria-hidden="true" />
            <Sun className="theme-toggle-sun" size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-ink bg-paper lg:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
