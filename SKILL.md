---
name: manto-de-maria-context
description: Use when working on the Manto de Maria repository, including its Next.js interface, anonymous messaging APIs, Supabase schema, participant passwords, tests, or Vercel deployment.
---

# Manto de Maria

## Objetivo

Manter uma aplicação mobile-first em português para um círculo da igreja enviar mensagens anônimas e cada participante ler somente as mensagens destinadas a ele.

Antes de alterar o sistema, ler o `README.md` e inspecionar o estado atual do Git. Preservar alterações existentes que não façam parte da tarefa.

## Stack e arquitetura

- Next.js App Router, TypeScript e Tailwind CSS.
- Supabase PostgreSQL compartilhado entre dispositivos.
- Deploy preparado para Vercel.
- Rotas principais: `/`, `/enviar` e `/mensagens`.
- APIs: `GET /api/participants`, `POST /api/messages` e `POST /api/read-messages`.
- Acesso ao banco centralizado em `lib/supabase-server.ts` e `lib/repository.ts`.
- Componentes de interface ficam em `components/`.

## Regras que não podem ser quebradas

- Nunca solicitar, armazenar ou retornar identidade do remetente.
- `messages` deve conter apenas destinatário, texto e data interna de criação.
- Não mostrar data nem hora das mensagens na interface.
- Retornar ao frontend somente `id`, `name` e `slug` dos participantes.
- Nunca retornar `password_hash` em endpoints públicos.
- Validar senhas exclusivamente no servidor usando bcrypt.
- Nunca armazenar senhas em texto puro no banco.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` em código client-side ou variável `NEXT_PUBLIC_`.
- Manter RLS habilitado e acesso público direto às tabelas revogado.
- Manter interface em português, mobile-first, acessível e adequada a telas próximas de 390 px.

## Participantes

A lista oficial contém 25 participantes. A fonte editável é `scripts/seed-participants.ts`; a lista e as senhas públicas de dois dígitos também estão documentadas no `README.md`.

A migration `supabase/migrations/20260615015957_seed_participants.sql` cadastra os 21 participantes iniciais. A migration `supabase/migrations/20260615021806_add_additional_participants.sql` adiciona Aline, Lisandro, Joaquim e Clara Melo. Ambas usam hashes bcrypt e `ON CONFLICT (slug) DO UPDATE`. Ao mudar nomes, slugs ou senhas, manter o script, o README e a migration correspondente consistentes.

## Banco de dados

- `participants`: `id`, `name`, `slug`, `password_hash`, `created_at`.
- `messages`: `id`, `recipient_id`, `message_text`, `created_at`.
- Schema inicial: `supabase/migrations/20260614181543_create_manto_de_maria_schema.sql`.
- Migration dos 21 usuários iniciais: `supabase/migrations/20260615015957_seed_participants.sql`.
- Migration dos 4 usuários complementares: `supabase/migrations/20260615021806_add_additional_participants.sql`.
- `created_at` existe apenas para ordenar mensagens da mais nova para a mais antiga.

## Ambiente

Variáveis esperadas:

`NEXT_PUBLIC_SUPABASE_URL`
`NEXT_PUBLIC_SUPABASE_ANON_KEY`
`SUPABASE_SERVICE_ROLE_KEY`

A chave secreta do Supabase deve existir somente no servidor e na configuração protegida da Vercel.

## Fluxo de trabalho

1. Ler os arquivos relacionados e seguir os padrões existentes.
2. Adicionar ou ajustar testes para mudanças de comportamento.
3. Executar `npm test`.
4. Executar `npm run build` para mudanças que afetem produção.
5. Executar `git diff --check` e revisar o diff.
6. Não alterar nem reverter arquivos fora do escopo.

## Estado relevante

A migration automática dos 21 participantes iniciais e a migration incremental dos 4 participantes complementares foram criadas em:

- `supabase/migrations/20260615015957_seed_participants.sql`
- `supabase/migrations/20260615021806_add_additional_participants.sql`
- `tests/supabase/seed-participants-migration.test.ts`
- `tests/supabase/add-additional-participants-migration.test.ts`

Na última verificação, a suíte tinha 49 testes aprovados e o build de produção concluía com sucesso. Sempre executar verificações novamente antes de afirmar que o estado atual está válido.
