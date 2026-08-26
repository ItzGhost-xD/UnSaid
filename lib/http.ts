import { NextResponse, type NextRequest } from "next/server";

function firstForwardedValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const host = firstForwardedValue(request.headers.get("x-forwarded-host"))
      ?? request.headers.get("host")
      ?? requestUrl.host;
    const protocol = firstForwardedValue(request.headers.get("x-forwarded-proto"))
      ?? requestUrl.protocol.replace(":", "");

    return originUrl.host === host && originUrl.protocol === `${protocol}:`;
  } catch {
    return false;
  }
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