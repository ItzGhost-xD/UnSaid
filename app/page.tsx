import { LibraryClient } from "@/components/LibraryClient";
import { listPosts } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await listPosts();
  return <LibraryClient initialPosts={posts} />;
}

