
type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type MemoryBucket = { points: number; resetAt: number };

const MEMORY_STORE = new Map<string, MemoryBucket>();

async function consumeMemoryRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const current = MEMORY_STORE.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + config.windowMs;
    MEMORY_STORE.set(key, { points: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, config.limit - 1), resetAt };
  }

  const points = current.points + 1;
  const allowed = points <= config.limit;
  MEMORY_STORE.set(key, { points, resetAt: current.resetAt });

  return {
    allowed,
    remaining: Math.max(0, config.limit - points),
    resetAt: current.resetAt,
  };
}

export async function consumeRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  return consumeMemoryRateLimit(key, config);
}

export function getRateLimitKey(prefix: string, request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || realIp || "unknown";
  return `${prefix}:${ip}`;
}

