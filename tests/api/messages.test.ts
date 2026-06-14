const { participantExists, insertAnonymousMessage, checkRateLimit } =
  vi.hoisted(() => ({
    participantExists: vi.fn(),
    insertAnonymousMessage: vi.fn(),
    checkRateLimit: vi.fn(),
  }));

vi.mock("@/lib/repository", () => ({
  participantExists,
  insertAnonymousMessage,
}));

vi.mock("@/lib/rate-limit", () => ({
  sendMessageRateLimiter: {
    check: checkRateLimit,
  },
}));

import { POST } from "@/app/api/messages/route";

const recipientId = "00000000-0000-4000-8000-000000000001";

function createRequest(
  body: unknown,
  headers: Record<string, string> = {},
) {
  return new Request("http://localhost/api/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimit.mockReturnValue({
      allowed: true,
      retryAfterSeconds: 0,
    });
    participantExists.mockResolvedValue(true);
    insertAnonymousMessage.mockResolvedValue(undefined);
  });

  it("rejects invalid input", async () => {
    const response = await POST(
      createRequest({ recipientId: "", messageText: " " }),
    );

    expect(response.status).toBe(400);
    expect(insertAnonymousMessage).not.toHaveBeenCalled();
  });

  it("rejects a recipient that does not exist", async () => {
    participantExists.mockResolvedValue(false);

    const response = await POST(
      createRequest({ recipientId, messageText: "Olá" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Escolha uma pessoa válida.",
    });
  });

  it("stores only recipient and trimmed message text", async () => {
    const response = await POST(
      createRequest(
        { recipientId, messageText: "  Uma mensagem especial  " },
        { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
      ),
    );

    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.1");
    expect(insertAnonymousMessage).toHaveBeenCalledWith({
      recipientId,
      messageText: "Uma mensagem especial",
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      message: "Mensagem enviada com carinho!",
    });
  });

  it("blocks excessive requests", async () => {
    checkRateLimit.mockReturnValue({
      allowed: false,
      retryAfterSeconds: 30,
    });

    const response = await POST(
      createRequest({ recipientId, messageText: "Olá" }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("30");
    expect(participantExists).not.toHaveBeenCalled();
  });

  it("returns a generic error when insertion fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    insertAnonymousMessage.mockRejectedValue(new Error("private db detail"));

    const response = await POST(
      createRequest({ recipientId, messageText: "Olá" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Não foi possível enviar sua mensagem.",
    });
  });
});
