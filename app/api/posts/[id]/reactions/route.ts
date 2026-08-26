import { NextResponse, type NextRequest } from "next/server";
import { apiError, isSameOrigin, rateLimitError } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import { toggleReaction } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";
import { reactionTypes, type ReactionType } from "@/lib/types";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return apiError("This request could not be verified.", 403);

  try {
    const { id } = await context.params;
    const { sessionHash } = await getOrCreateAnonymousSession();
    const rateLimit = await consumeRateLimit(sessionHash, "reaction");
    if (!rateLimit.allowed) return rateLimitError(rateLimit.retryAfterSeconds);

    const body = (await request.json()) as { reactionType?: ReactionType };
    if (!body.reactionType || !reactionTypes.includes(body.reactionType)) {
      return apiError("Choose one of the available reactions.", 400);
    }
    const post = await toggleReaction(id, sessionHash, body.reactionType);
    if (!post) return apiError("That experience is not available.", 404);
    return NextResponse.json({ reactionCounts: post.reactionCounts, viewerReaction: post.viewerReaction });
  } catch (error) {
    console.error("Unable to save reaction", error);
    return apiError("Your reaction could not be saved.", 500);
  }
}

