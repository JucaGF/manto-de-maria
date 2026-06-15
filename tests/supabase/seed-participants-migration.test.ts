import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260615015957_seed_participants.sql",
  ),
  "utf8",
);

describe("seed participants migration", () => {
  it("upserts all approved participants with bcrypt hashes", () => {
    const participantRows = migration.match(
      /\('[^']+', '[a-z0-9-]+', crypt\('\d{2}', gen_salt\('bf', 12\)\)\)/g,
    );

    expect(participantRows).toHaveLength(21);
    expect(migration).toContain("insert into public.participants");
    expect(migration).toContain("on conflict (slug) do update");
    expect(migration).toContain("password_hash = excluded.password_hash");
  });
});
