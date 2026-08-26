import { NextResponse, type NextRequest } from "next/server";

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export function requestIsTooLarge(request: NextRequest, maxBytes = 20_000) {
  const value = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(value) && value > maxBytes;
}

export function apiError(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function rateLimitError(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Please wait before trying that again.", retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

