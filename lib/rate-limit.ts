type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const STORE = new Map<string, RateLimitState>();

export function consumeRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const current = STORE.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + config.windowMs;
    STORE.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, config.limit - 1), resetAt };
  }

  current.count += 1;
  const allowed = current.count <= config.limit;

  if (!allowed) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.limit - current.count),
    resetAt: current.resetAt,
  };
}

export function getRateLimitKey(prefix: string, request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || realIp || "unknown";
  return `${prefix}:${ip}`;
}
