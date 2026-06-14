create extension if not exists pgcrypto;

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9-]+$'),
  password_hash text not null check (char_length(trim(password_hash)) > 0),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.participants(id) on delete cascade,
  message_text text not null check (
    char_length(trim(message_text)) between 1 and 2000
  ),
  created_at timestamptz not null default now()
);

create index messages_recipient_created_at_idx
  on public.messages (recipient_id, created_at desc);

alter table public.participants enable row level security;
alter table public.messages enable row level security;

revoke all on table public.participants from anon, authenticated;
revoke all on table public.messages from anon, authenticated;

grant all on table public.participants to service_role;
grant all on table public.messages to service_role;
