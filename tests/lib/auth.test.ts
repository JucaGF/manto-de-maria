import { hashPassword, verifyPassword } from "@/lib/auth";

describe("password helpers", () => {
  it("hashes passwords instead of storing plain text", async () => {
    const hash = await hashPassword("14");

    expect(hash).not.toBe("14");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("accepts the correct password and rejects another one", async () => {
    const hash = await hashPassword("14");

    await expect(verifyPassword("14", hash)).resolves.toBe(true);
    await expect(verifyPassword("27", hash)).resolves.toBe(false);
  });
});
