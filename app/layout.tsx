import type { Metadata } from "next";
import "@fontsource/coming-soon/400.css";
import "@fontsource/patrick-hand/400.css";
import "./globals.css";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "Unsaid — Human experiences, left behind",
    template: "%s · Unsaid",
  },
  description: "An anonymous library of human experiences. Find someone who has been here before, or leave something for whoever comes next.",
  robots: {
  index: false,
  follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <SessionBootstrap />
        <div className="border-b border-line bg-soft px-5 py-2 text-center text-sm tracking-[0.08em] text-ink/65">
          User-testing beta · Starter library entries are samples.
        </div>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

