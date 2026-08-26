import { NextResponse, type NextRequest } from "next/server";
import { generateAnonymousAlias } from "@/lib/aliases";
import { validateReply } from "@/lib/content-safety";
import { apiError, isSameOrigin, rateLimitError, requestIsTooLarge } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import { addReply } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return apiError("This request could not be verified.", 403);
  if (requestIsTooLarge(request, 4_000)) return apiError("That reply is too large.", 413);

  try {
    const { id } = await context.params;
    const { sessionHash } = await getOrCreateAnonymousSession();
    const rateLimit = await consumeRateLimit(sessionHash, "reply");
    if (!rateLimit.allowed) return rateLimitError(rateLimit.retryAfterSeconds);
    const body = (await request.json()) as { body?: unknown };
    const validation = validateReply(body.body);
    if (validation.errors.length) return apiError("Please check your reply.", 400, { issues: validation.errors });
    if (validation.moderation.decision === "block") {
      return apiError("Please remove private or unsafe details before replying.", 422, {
        code: "content_blocked",
        issues: validation.moderation.issues,
      });
    }

    const status = validation.moderation.decision === "review" ? "review" : "published";
    const reply = await addReply(id, {
      body: validation.body,
      authorAlias: generateAnonymousAlias(),
      sessionHash,
      status,
    });
    if (!reply) return apiError("That experience is not available.", 404);
    return NextResponse.json({ reply, status }, { status: 201 });
  } catch (error) {
    console.error("Unable to add reply", error);
    return apiError("Your reply could not be added.", 500);
  }
}

