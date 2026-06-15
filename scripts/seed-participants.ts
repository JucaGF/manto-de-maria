import { pathToFileURL } from "node:url";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hashPassword } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const PARTICIPANTS = [
  { name: "Henrique", slug: "henrique", password: "14" },
  { name: "Cauã Victor", slug: "caua-victor", password: "27" },
  { name: "Clarinha", slug: "clarinha", password: "31" },
  { name: "Felipe", slug: "felipe", password: "46" },
  { name: "João Victor", slug: "joao-victor", password: "52" },
  { name: "Leonardo Filho", slug: "leonardo-filho", password: "68" },
  { name: "Mariah Norat", slug: "mariah-norat", password: "73" },
  { name: "Miguel Antônio", slug: "miguel-antonio", password: "85" },
  { name: "Giullia", slug: "giullia", password: "19" },
  { name: "Isabela", slug: "isabela", password: "24" },
  { name: "Júlia Barros", slug: "julia-barros", password: "37" },
  { name: "Lucas Gabriel", slug: "lucas-gabriel", password: "41" },
  { name: "Hellô", slug: "hello", password: "56" },
  { name: "Mariah Serrano", slug: "mariah-serrano", password: "62" },
  { name: "Samuel", slug: "samuel", password: "79" },
  { name: "Hanna", slug: "hanna", password: "83" },
  { name: "Jaya", slug: "jaya", password: "95" },
  { name: "Leo Azevedo", slug: "leo-azevedo", password: "12" },
  { name: "Malu", slug: "malu", password: "34" },
  { name: "Marina", slug: "marina", password: "58" },
  { name: "Mariah Alves", slug: "mariah-alves", password: "76" },
  { name: "Aline", slug: "aline", password: "43" },
  { name: "Lisandro", slug: "lisandro", password: "92" },
  { name: "Joaquim", slug: "joaquim", password: "67" },
  { name: "Clara Melo", slug: "clara-melo", password: "38" },
] as const;

export async function seedParticipants(
  client: SupabaseClient = createSupabaseServerClient(),
) {
  const rows = await Promise.all(
    PARTICIPANTS.map(async ({ name, slug, password }) => ({
      name,
      slug,
      password_hash: await hashPassword(password),
    })),
  );

  const { error } = await client
    .from("participants")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    throw new Error(error.message);
  }

  return rows.length;
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1] as string).href;

if (isDirectRun) {
  seedParticipants()
    .then((count) => {
      console.log(`${count} participantes configurados com sucesso.`);
    })
    .catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido.";
      console.error(`Não foi possível configurar os participantes: ${message}`);
      process.exitCode = 1;
    });
}
