const { listParticipants } = vi.hoisted(() => ({
  listParticipants: vi.fn(),
}));

vi.mock("@/lib/repository", () => ({
  listParticipants,
}));

import { GET } from "@/app/api/participants/route";

describe("GET /api/participants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only public participant fields", async () => {
    listParticipants.mockResolvedValue([
      { id: "p1", name: "Henrique", slug: "henrique" },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      participants: [{ id: "p1", name: "Henrique", slug: "henrique" }],
    });
  });

  it("returns a friendly error when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    listParticipants.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Não foi possível carregar os participantes.",
    });
  });
});
