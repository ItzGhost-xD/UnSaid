import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { hashPrivateValue } from "@/lib/aliases";

const COOKIE_NAME = "unsaid_anonymous_session";
const ONE_YEAR = 60 * 60 * 24 * 365;

function looksValid(value: string | undefined) {
  return Boolean(value && /^[a-f0-9-]{36}$/i.test(value));
}

export async function getOrCreateAnonymousSession() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (!looksValid(sessionId)) {
    sessionId = randomUUID();
    cookieStore.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR,
      path: "/",
    });
  }

  return {
    sessionHash: hashPrivateValue(sessionId as string),
  };
}

