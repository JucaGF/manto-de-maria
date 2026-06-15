import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDirectory = resolve(process.cwd(), "supabase/migrations");
const migrationFilename = readdirSync(migrationsDirectory).find((filename) =>
  filename.endsWith("_add_additional_participants.sql"),
);

describe("additional participants migration", () => {
  it("upserts the four approved participants with bcrypt hashes", () => {
    expect(migrationFilename).toBeDefined();

    const migration = readFileSync(
      resolve(migrationsDirectory, migrationFilename as string),
      "utf8",
    );
    const participantRows = migration.match(
      /\('[^']+', '[a-z0-9-]+', crypt\('\d{2}', gen_salt\('bf', 12\)\)\)/g,
    );

    expect(participantRows).toHaveLength(4);
    expect(migration).toContain(
      "('Aline', 'aline', crypt('43', gen_salt('bf', 12)))",
    );
    expect(migration).toContain(
      "('Lisandro', 'lisandro', crypt('92', gen_salt('bf', 12)))",
    );
    expect(migration).toContain(
      "('Joaquim', 'joaquim', crypt('67', gen_salt('bf', 12)))",
    );
    expect(migration).toContain(
      "('Clara Melo', 'clara-melo', crypt('38', gen_salt('bf', 12)))",
    );
    expect(migration).toContain("insert into public.participants");
    expect(migration).toContain("on conflict (slug) do update");
    expect(migration).toContain("password_hash = excluded.password_hash");
  });
});
