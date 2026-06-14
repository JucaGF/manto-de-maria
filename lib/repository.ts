import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PublicMessage,
  PublicParticipant,
  SendMessageInput,
} from "@/lib/contracts";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RepositoryClient = Pick<SupabaseClient, "from">;

type ParticipantRow = {
  id: string;
  name: string;
  slug: string;
};

type ParticipantLoginDatabaseRow = ParticipantRow & {
  password_hash: string;
};

type MessageRow = {
  id: string;
  message_text: string;
};

export type ParticipantLoginRow = ParticipantRow & {
  passwordHash: string;
};

function getClient(client?: RepositoryClient) {
  return client ?? createSupabaseServerClient();
}

function throwDatabaseError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function listParticipants(
  client?: RepositoryClient,
): Promise<PublicParticipant[]> {
  const { data, error } = await getClient(client)
    .from("participants")
    .select("id,name,slug")
    .order("name", { ascending: true });

  throwDatabaseError(error);
  return (data ?? []) as ParticipantRow[];
}

export async function participantExists(
  id: string,
  client?: RepositoryClient,
) {
  const { data, error } = await getClient(client)
    .from("participants")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  throwDatabaseError(error);
  return Boolean(data);
}

export async function insertAnonymousMessage(
  input: SendMessageInput,
  client?: RepositoryClient,
) {
  const { error } = await getClient(client).from("messages").insert({
    recipient_id: input.recipientId,
    message_text: input.messageText,
  });

  throwDatabaseError(error);
}

export async function findParticipantForLogin(
  slug: string,
  client?: RepositoryClient,
): Promise<ParticipantLoginRow | null> {
  const { data, error } = await getClient(client)
    .from("participants")
    .select("id,name,slug,password_hash")
    .eq("slug", slug)
    .maybeSingle();

  throwDatabaseError(error);

  if (!data) {
    return null;
  }

  const row = data as ParticipantLoginDatabaseRow;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    passwordHash: row.password_hash,
  };
}

export async function listMessagesForParticipant(
  participantId: string,
  client?: RepositoryClient,
): Promise<PublicMessage[]> {
  const { data, error } = await getClient(client)
    .from("messages")
    .select("id,message_text")
    .eq("recipient_id", participantId)
    .order("created_at", { ascending: false });

  throwDatabaseError(error);

  return ((data ?? []) as MessageRow[]).map((message) => ({
    id: message.id,
    messageText: message.message_text,
  }));
}
