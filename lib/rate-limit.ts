type AttemptWindow = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export class MemoryRateLimiter {
  private readonly attempts = new Map<string, AttemptWindow>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now = Date.now()): RateLimitResult {
    const current = this.attempts.get(key);

    if (!current || now >= current.resetAt) {
      this.attempts.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });

      return {
        allowed: true,
        retryAfterSeconds: 0,
      };
    }

    if (current.count >= this.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((current.resetAt - now) / 1_000),
        ),
      };
    }

    current.count += 1;
    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }
}

export const sendMessageRateLimiter = new MemoryRateLimiter(20, 60_000);
export const readMessagesRateLimiter = new MemoryRateLimiter(8, 5 * 60_000);
