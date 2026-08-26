import { NextResponse, type NextRequest } from "next/server";
import { cleanText } from "@/lib/content-safety";
import { apiError, isSameOrigin, rateLimitError, requestIsTooLarge } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import { reportPost } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";

const reasons = ["private_information", "unsafe_advice", "harassment", "spam", "other"] as const;

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return apiError("This request could not be verified.", 403);
  if (requestIsTooLarge(request, 4_000)) return apiError("That report is too large.", 413);

  try {
    const { id } = await context.params;
    const { sessionHash } = await getOrCreateAnonymousSession();
    const rateLimit = await consumeRateLimit(sessionHash, "report");
    if (!rateLimit.allowed) return rateLimitError(rateLimit.retryAfterSeconds);
    const body = (await request.json()) as { reason?: string; details?: unknown };
    if (!body.reason || !reasons.includes(body.reason as (typeof reasons)[number])) {
      return apiError("Choose a reason for the report.", 400);
    }
    const details = cleanText(body.details).slice(0, 240);
    const result = await reportPost(id, { sessionHash, reason: body.reason, details });
    if (!result) return apiError("That experience is not available.", 404);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to report post", error);
    return apiError("Your report could not be sent.", 500);
  }
}

