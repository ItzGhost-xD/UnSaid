import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceDetail } from "@/components/ExperienceDetail";
import { getPost } from "@/lib/repository";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  return post ? { title: post.title, description: post.happened.slice(0, 150) } : { title: "Experience not found" };
}

export default async function ExperiencePage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  return <ExperienceDetail initialPost={post} />;
}

