import type { Metadata } from "next";
import { ContributionForm } from "@/components/ContributionForm";

export const metadata: Metadata = {
  title: "Leave something behind",
  description: "Share an experience anonymously for whoever comes next.",
};

export default function ContributePage() {
  return <ContributionForm />;
}

