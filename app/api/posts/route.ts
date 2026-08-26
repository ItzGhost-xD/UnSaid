import { NextResponse, type NextRequest } from "next/server";
import { generateAnonymousAlias, generateRecoveryCode, hashPrivateValue } from "@/lib/aliases";
import { moderateText, validatePostInput } from "@/lib/content-safety";
import { apiError, isSameOrigin, rateLimitError, requestIsTooLarge } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createPost, dataMode, listPosts } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";
import type { NewPostInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { sessionHash } = await getOrCreateAnonymousSession();
    const topic = request.nextUrl.searchParams.get("topic") || undefined;
    const query = request.nextUrl.searchParams.get("q") || undefined;
    const posts = await listPosts({ topic, query, sessionHash });
    return NextResponse.json({ posts, mode: dataMode() });
  } catch (error) {
    console.error("Unable to list posts", error);
    return apiError("The library could not be loaded just now.", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("This request could not be verified.", 403);
  if (requestIsTooLarge(request)) return apiError("That entry is too large.", 413);

  try {
    const { sessionHash } = await getOrCreateAnonymousSession();
    const rateLimit = await consumeRateLimit(sessionHash, "post");
    if (!rateLimit.allowed) return rateLimitError(rateLimit.retryAfterSeconds);

    const body = (await request.json()) as NewPostInput;
    const { input, errors } = validatePostInput(body);
    if (errors.length) return apiError("Please check the highlighted parts of your entry.", 400, { issues: errors });

    const moderation = moderateText([input.title, input.happened, input.helped, input.wishKnown]);
    if (moderation.decision === "block") {
      return apiError("Please remove private or unsafe details before submitting.", 422, {
        code: "content_blocked",
        issues: moderation.issues,
      });
    }

    const authorAlias = generateAnonymousAlias();
    const recoveryCode = generateRecoveryCode();
    const status = moderation.decision === "review" ? "review" : "published";
    const post = await createPost(input, {
      authorAlias,
      recoveryHash: hashPrivateValue(recoveryCode),
      sessionHash,
      status,
      moderationNotes: moderation.issues,
    });

    return NextResponse.json(
      {
        post,
        authorAlias,
        recoveryCode,
        status,
        moderationIssues: moderation.issues,
        mode: dataMode(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create post", error);
    return apiError("Your entry could not be submitted. Please try again.", 500);
  }
}

