import {
  findParticipantForLogin,
  insertAnonymousMessage,
  listMessagesForParticipant,
  listParticipants,
  participantExists,
} from "@/lib/repository";

describe("Supabase repository", () => {
  it("lists only public participant fields ordered by name", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: "p1", name: "Henrique", slug: "henrique" }],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    await expect(listParticipants({ from } as never)).resolves.toEqual([
      { id: "p1", name: "Henrique", slug: "henrique" },
    ]);
    expect(from).toHaveBeenCalledWith("participants");
    expect(select).toHaveBeenCalledWith("id,name,slug");
    expect(order).toHaveBeenCalledWith("name", { ascending: true });
  });

  it("checks whether a recipient exists without selecting private fields", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "p1" },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    await expect(participantExists("p1", { from } as never)).resolves.toBe(
      true,
    );
    expect(select).toHaveBeenCalledWith("id");
    expect(eq).toHaveBeenCalledWith("id", "p1");
  });

  it("inserts only recipient and message text", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    await insertAnonymousMessage(
      {
        recipientId: "p1",
        messageText: "Uma mensagem especial",
      },
      { from } as never,
    );

    expect(from).toHaveBeenCalledWith("messages");
    expect(insert).toHaveBeenCalledWith({
      recipient_id: "p1",
      message_text: "Uma mensagem especial",
    });
  });

  it("loads the password hash only for server-side login", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "p1",
        name: "Henrique",
        slug: "henrique",
        password_hash: "hash",
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      findParticipantForLogin("henrique", { from } as never),
    ).resolves.toEqual({
      id: "p1",
      name: "Henrique",
      slug: "henrique",
      passwordHash: "hash",
    });
    expect(select).toHaveBeenCalledWith("id,name,slug,password_hash");
    expect(eq).toHaveBeenCalledWith("slug", "henrique");
  });

  it("returns only messages for the participant, newest first", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        { id: "m2", message_text: "Mais nova" },
        { id: "m1", message_text: "Mais antiga" },
      ],
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    await expect(
      listMessagesForParticipant("p1", { from } as never),
    ).resolves.toEqual([
      { id: "m2", messageText: "Mais nova" },
      { id: "m1", messageText: "Mais antiga" },
    ]);
    expect(select).toHaveBeenCalledWith("id,message_text");
    expect(eq).toHaveBeenCalledWith("recipient_id", "p1");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("throws database errors instead of exposing partial data", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    await expect(listParticipants({ from } as never)).rejects.toThrow(
      "database unavailable",
    );
  });
});
