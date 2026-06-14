import { MemoryRateLimiter } from "@/lib/rate-limit";

describe("MemoryRateLimiter", () => {
  it("blocks requests after the configured limit", () => {
    const limiter = new MemoryRateLimiter(2, 1_000);

    expect(limiter.check("ip", 0).allowed).toBe(true);
    expect(limiter.check("ip", 100).allowed).toBe(true);

    const blocked = limiter.check("ip", 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
  });

  it("allows requests again after the window expires", () => {
    const limiter = new MemoryRateLimiter(1, 1_000);

    expect(limiter.check("ip", 0).allowed).toBe(true);
    expect(limiter.check("ip", 999).allowed).toBe(false);
    expect(limiter.check("ip", 1_000).allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    const limiter = new MemoryRateLimiter(1, 1_000);

    expect(limiter.check("ip-a", 0).allowed).toBe(true);
    expect(limiter.check("ip-b", 0).allowed).toBe(true);
  });
});
