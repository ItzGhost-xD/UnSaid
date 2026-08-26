import { getSupabaseAdmin } from "@/lib/supabase";
import type { RateLimitResult } from "@/lib/types";

export type RateLimitAction = "post" | "reply" | "reaction" | "report" | "manage";

const rules: Record<RateLimitAction, { limit: number; windowSeconds: number }> = {
  post: { limit: 3, windowSeconds: 15 * 60 },
  reply: { limit: 8, windowSeconds: 10 * 60 },
  reaction: { limit: 24, windowSeconds: 60 },
  report: { limit: 6, windowSeconds: 30 * 60 },
  manage: { limit: 8, windowSeconds: 15 * 60 },
};

type MemoryRateStore = Map<string, number[]>;

declare global {
  var __unsaidRateLimitStore: MemoryRateStore | undefined;
}

const memoryStore = globalThis.__unsaidRateLimitStore ?? new Map<string, number[]>();
globalThis.__unsaidRateLimitStore = memoryStore;

function consumeMemory(sessionHash: string, action: RateLimitAction): RateLimitResult {
  const rule = rules[action];
  const now = Date.now();
  const cutoff = now - rule.windowSeconds * 1000;
  const key = `${sessionHash}:${action}`;
  const recent = (memoryStore.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

  if (recent.length >= rule.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + rule.windowSeconds * 1000 - now) / 1000));
    memoryStore.set(key, recent);
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  memoryStore.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function consumeRateLimit(sessionHash: string, action: RateLimitAction) {
  const supabase = getSupabaseAdmin();
  const rule = rules[action];

  if (!supabase) return consumeMemory(sessionHash, action);

  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_session_hash: sessionHash,
    p_action: action,
    p_limit: rule.limit,
    p_window_seconds: rule.windowSeconds,
  });

  if (error) throw new Error(`Rate limit check failed: ${error.message}`);
  return {
    allowed: Boolean(data),
    retryAfterSeconds: data ? 0 : rule.windowSeconds,
  } satisfies RateLimitResult;
}

