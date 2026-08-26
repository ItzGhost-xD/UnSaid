import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/http";
import { getPost } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { sessionHash } = await getOrCreateAnonymousSession();
    const post = await getPost(id, sessionHash);
    if (!post) return apiError("That experience is not available.", 404);
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Unable to load post", error);
    return apiError("That experience could not be loaded just now.", 500);
  }
}

