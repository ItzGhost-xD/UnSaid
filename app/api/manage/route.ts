import { NextResponse, type NextRequest } from "next/server";
import { hashPrivateValue } from "@/lib/aliases";
import { cleanText } from "@/lib/content-safety";
import { apiError, isSameOrigin, rateLimitError } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import { removePostByRecoveryHash } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("This request could not be verified.", 403);

  try {
    const { sessionHash } = await getOrCreateAnonymousSession();
    const rateLimit = await consumeRateLimit(sessionHash, "manage");
    if (!rateLimit.allowed) return rateLimitError(rateLimit.retryAfterSeconds);
    const body = (await request.json()) as { recoveryCode?: unknown };
    const recoveryCode = cleanText(body.recoveryCode).toUpperCase();
    if (!/^UNS-[A-F0-9]{5}-[A-F0-9]{5}$/.test(recoveryCode)) {
      return apiError("Enter the recovery code exactly as it was provided.", 400);
    }
    const removed = await removePostByRecoveryHash(hashPrivateValue(recoveryCode));
    if (!removed) return apiError("No active contribution matched that code.", 404);
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Unable to remove post", error);
    return apiError("The contribution could not be removed just now.", 500);
  }
}
