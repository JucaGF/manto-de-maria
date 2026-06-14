import {
  readMessagesSchema,
  sendMessageSchema,
} from "@/lib/contracts";

const recipientId = "00000000-0000-4000-8000-000000000001";

describe("sendMessageSchema", () => {
  it("trims a valid anonymous message", () => {
    const result = sendMessageSchema.parse({
      recipientId,
      messageText: "  Ave Maria  ",
    });

    expect(result).toEqual({
      recipientId,
      messageText: "Ave Maria",
    });
  });

  it.each([
    [{ recipientId: "", messageText: "Olá" }, "Escolha uma pessoa."],
    [{ recipientId: "invalido", messageText: "Olá" }, "Escolha uma pessoa."],
    [{ recipientId, messageText: "   " }, "Escreva uma mensagem."],
    [
      { recipientId, messageText: "a".repeat(2001) },
      "A mensagem pode ter no máximo 2.000 caracteres.",
    ],
  ])("rejects invalid message input", (input, errorMessage) => {
    const result = sendMessageSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(errorMessage);
    }
  });
});

describe("readMessagesSchema", () => {
  it("accepts a participant slug and a two-digit password", () => {
    expect(
      readMessagesSchema.parse({
        participantSlug: "henrique",
        password: "14",
      }),
    ).toEqual({
      participantSlug: "henrique",
      password: "14",
    });
  });

  it.each([
    [{ participantSlug: "", password: "14" }, "Escolha seu nome."],
    [
      { participantSlug: "henrique", password: "" },
      "Digite sua senha de dois dígitos.",
    ],
    [
      { participantSlug: "henrique", password: "1" },
      "Digite sua senha de dois dígitos.",
    ],
    [
      { participantSlug: "henrique", password: "ab" },
      "Digite sua senha de dois dígitos.",
    ],
  ])("rejects invalid login input", (input, errorMessage) => {
    const result = readMessagesSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(errorMessage);
    }
  });
});
