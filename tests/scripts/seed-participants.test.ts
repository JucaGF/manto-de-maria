import { PARTICIPANTS } from "@/scripts/seed-participants";

describe("participant seed", () => {
  it("contains the 25 approved participants", () => {
    expect(PARTICIPANTS).toHaveLength(25);
    expect(PARTICIPANTS.map(({ name }) => name)).toEqual([
      "Henrique",
      "Cauã Victor",
      "Clarinha",
      "Felipe",
      "João Victor",
      "Leonardo Filho",
      "Mariah Norat",
      "Miguel Antônio",
      "Giullia",
      "Isabela",
      "Júlia Barros",
      "Lucas Gabriel",
      "Hellô",
      "Mariah Serrano",
      "Samuel",
      "Hanna",
      "Jaya",
      "Leo Azevedo",
      "Malu",
      "Marina",
      "Mariah Alves",
      "Aline",
      "Lisandro",
      "Joaquim",
      "Clara Melo",
    ]);
  });

  it("uses unique slugs and unique two-digit passwords", () => {
    const slugs = PARTICIPANTS.map(({ slug }) => slug);
    const passwords = PARTICIPANTS.map(({ password }) => password);

    expect(new Set(slugs).size).toBe(PARTICIPANTS.length);
    expect(new Set(passwords).size).toBe(PARTICIPANTS.length);
    expect(passwords.every((password) => /^\d{2}$/.test(password))).toBe(true);
  });

  it("keeps the approved initial credentials", () => {
    expect(PARTICIPANTS).toContainEqual({
      name: "Henrique",
      slug: "henrique",
      password: "14",
    });
    expect(PARTICIPANTS).toContainEqual({
      name: "Mariah Alves",
      slug: "mariah-alves",
      password: "76",
    });
    expect(PARTICIPANTS).toContainEqual({
      name: "Aline",
      slug: "aline",
      password: "43",
    });
    expect(PARTICIPANTS).toContainEqual({
      name: "Lisandro",
      slug: "lisandro",
      password: "92",
    });
    expect(PARTICIPANTS).toContainEqual({
      name: "Joaquim",
      slug: "joaquim",
      password: "67",
    });
    expect(PARTICIPANTS).toContainEqual({
      name: "Clara Melo",
      slug: "clara-melo",
      password: "38",
    });
  });
});
