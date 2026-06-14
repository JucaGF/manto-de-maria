const {
  findParticipantForLogin,
  listMessagesForParticipant,
  verifyPassword,
  checkRateLimit,
} = vi.hoisted(() => ({
  findParticipantForLogin: vi.fn(),
  listMessagesForParticipant: vi.fn(),
  verifyPassword: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/repository", () => ({
  findParticipantForLogin,
  listMessagesForParticipant,
}));

vi.mock("@/lib/auth", () => ({
  verifyPassword,
}));

vi.mock("@/lib/rate-limit", () => ({
  readMessagesRateLimiter: {
    check: checkRateLimit,
  },
}));

import { POST } from "@/app/api/read-messages/route";

function createRequest(body: unknown) {
  return new Request("http://localhost/api/read-messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.2",
    },
    body: JSON.stringify(body),
  });
}

const participant = {
  id: "p1",
  name: "Henrique",
  slug: "henrique",
  passwordHash: "hash",
};

describe("POST /api/read-messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimit.mockReturnValue({
      allowed: true,
      retryAfterSeconds: 0,
    });
    findParticipantForLogin.mockResolvedValue(participant);
    verifyPassword.mockResolvedValue(true);
    listMessagesForParticipant.mockResolvedValue([
      { id: "m1", messageText: "Deus te abençoe" },
    ]);
  });

  it("rejects invalid input", async () => {
    const response = await POST(
      createRequest({ participantSlug: "", password: "" }),
    );

    expect(response.status).toBe(400);
    expect(findParticipantForLogin).not.toHaveBeenCalled();
  });

  it.each([
    ["an unknown participant", null, true],
    ["a wrong password", participant, false],
  ])("returns the same error for %s", async (_label, found, passwordMatches) => {
    findParticipantForLogin.mockResolvedValue(found);
    verifyPassword.mockResolvedValue(passwordMatches);

    const response = await POST(
      createRequest({ participantSlug: "henrique", password: "14" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Senha incorreta.",
    });
    expect(listMessagesForParticipant).not.toHaveBeenCalled();
  });

  it("validates the hash server-side and returns only that participant messages", async () => {
    const response = await POST(
      createRequest({ participantSlug: "henrique", password: "14" }),
    );

    expect(verifyPassword).toHaveBeenCalledWith("14", "hash");
    expect(listMessagesForParticipant).toHaveBeenCalledWith("p1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      participant: { name: "Henrique" },
      messages: [{ id: "m1", messageText: "Deus te abençoe" }],
    });
  });

  it("blocks excessive login attempts", async () => {
    checkRateLimit.mockReturnValue({
      allowed: false,
      retryAfterSeconds: 60,
    });

    const response = await POST(
      createRequest({ participantSlug: "henrique", password: "14" }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(findParticipantForLogin).not.toHaveBeenCalled();
  });

  it("does not expose database errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    listMessagesForParticipant.mockRejectedValue(
      new Error("private db detail"),
    );

    const response = await POST(
      createRequest({ participantSlug: "henrique", password: "14" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Não foi possível carregar suas mensagens.",
    });
  });
});
