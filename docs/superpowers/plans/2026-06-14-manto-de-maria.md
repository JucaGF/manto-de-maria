# Manto de Maria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deploy-ready mobile-first Next.js application that stores anonymous messages in Supabase and lets each participant read only their own messages after server-side password validation.

**Architecture:** Next.js App Router pages call three server-side route handlers. Route handlers validate with Zod and delegate database operations to a small repository backed by a service-role Supabase client; browser code never imports Supabase or password hashes. PostgreSQL RLS blocks direct public table access, while a seed script hashes the documented two-digit passwords with bcryptjs.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase JavaScript client, Zod, bcryptjs, Vitest, Testing Library, ESLint.

---

## File Map

- `app/`: App Router pages, route handlers, metadata, and global styling.
- `components/`: Mobile UI components and client-side form state.
- `lib/contracts.ts`: Zod request schemas and public response types.
- `lib/auth.ts`: Password hashing and comparison.
- `lib/rate-limit.ts`: Best-effort in-memory request throttling.
- `lib/supabase-server.ts`: Server-only service-role client factory.
- `lib/repository.ts`: Database queries and public row mapping.
- `scripts/seed-participants.ts`: Idempotent participant upsert with bcrypt hashes.
- `supabase/migrations/20260614000000_create_manto_de_maria_schema.sql`: Tables, checks, index, grants, and RLS.
- `tests/`: Unit, API, and component tests.
- `public/maria.png`: User-provided Marian artwork.
- `README.md`: Local setup, Supabase setup, passwords, and Vercel deploy.

### Task 1: Scaffold and Test Harness

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `public/maria.png`

- [ ] **Step 1: Create the project manifest**

Define scripts `dev`, `build`, `start`, `lint`, `test`, `test:watch`, and
`seed`. Install runtime dependencies `next`, `react`, `react-dom`,
`@supabase/supabase-js`, `bcryptjs`, `zod`, and `lucide-react`. Install
development dependencies for TypeScript, Tailwind/PostCSS, ESLint, Vitest,
jsdom, Testing Library, React types, Node types, and `tsx`.

- [ ] **Step 2: Create the failing smoke test**

Create `tests/app/layout.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

it("declares the Portuguese application shell", () => {
  render(<RootLayout><p>conteudo</p></RootLayout>);
  expect(screen.getByText("conteudo")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test -- tests/app/layout.test.tsx`

Expected: FAIL because the project configuration and `RootLayout` do not yet
exist.

- [ ] **Step 4: Add the minimal application shell**

Create a Portuguese root layout with metadata title `Manto de Maria`, import
`globals.css`, and render children inside `<html lang="pt-BR">`. Configure
aliases, Vitest jsdom, Testing Library setup, Tailwind, ESLint, environment
examples, and ignores. Copy the supplied transparent PNG to
`public/maria.png`.

- [ ] **Step 5: Verify GREEN**

Run: `npm test -- tests/app/layout.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts tests/setup.ts tests/app/layout.test.tsx .gitignore .env.example app/layout.tsx app/globals.css public/maria.png
git commit -m "chore: scaffold manto de maria app"
```

### Task 2: Contracts, Passwords, and Rate Limiting

**Files:**
- Create: `lib/contracts.ts`
- Create: `lib/auth.ts`
- Create: `lib/rate-limit.ts`
- Create: `tests/lib/contracts.test.ts`
- Create: `tests/lib/auth.test.ts`
- Create: `tests/lib/rate-limit.test.ts`

- [ ] **Step 1: Write failing contract tests**

Test that `sendMessageSchema` trims text, rejects empty text, rejects text over
2,000 characters, and rejects non-UUID recipients. Test that
`readMessagesSchema` accepts a slug plus two-digit password and rejects empty
fields.

```ts
expect(sendMessageSchema.parse({
  recipientId: "00000000-0000-4000-8000-000000000001",
  messageText: "  Ave Maria  ",
}).messageText).toBe("Ave Maria");
```

- [ ] **Step 2: Verify contract tests fail**

Run: `npm test -- tests/lib/contracts.test.ts`

Expected: FAIL because `lib/contracts.ts` does not exist.

- [ ] **Step 3: Implement contracts**

Export:

```ts
export const sendMessageSchema = z.object({
  recipientId: z.string().uuid("Escolha uma pessoa."),
  messageText: z.string().trim().min(1, "Escreva uma mensagem.")
    .max(2000, "A mensagem pode ter no máximo 2.000 caracteres."),
});

export const readMessagesSchema = z.object({
  participantSlug: z.string().trim().min(1, "Escolha seu nome."),
  password: z.string().trim().regex(/^\d{2}$/, "Digite sua senha de dois dígitos."),
});
```

Also export `PublicParticipant`, `PublicMessage`, and API response types that
contain no password hash, sender, date, or time.

- [ ] **Step 4: Verify contracts pass**

Run: `npm test -- tests/lib/contracts.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing auth tests**

Test that `hashPassword("14")` does not return `14`, that
`verifyPassword("14", hash)` is true, and that another password is false.

- [ ] **Step 6: Verify auth tests fail**

Run: `npm test -- tests/lib/auth.test.ts`

Expected: FAIL because `lib/auth.ts` does not exist.

- [ ] **Step 7: Implement bcrypt helpers**

Use `bcryptjs` with 10 salt rounds:

```ts
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
```

- [ ] **Step 8: Verify auth tests pass**

Run: `npm test -- tests/lib/auth.test.ts`

Expected: PASS.

- [ ] **Step 9: Write failing rate-limit tests**

With a fresh limiter, verify the first allowed requests pass, the next request
inside the window fails, and requests pass again after the window.

- [ ] **Step 10: Implement the limiter and verify GREEN**

Implement a small `MemoryRateLimiter` keyed by IP with configurable `limit`
and `windowMs`, plus shared read and send instances. Run:

`npm test -- tests/lib/rate-limit.test.ts`

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add lib/contracts.ts lib/auth.ts lib/rate-limit.ts tests/lib
git commit -m "feat: add validation and password security"
```

### Task 3: Supabase Schema, Repository, and Seed

**Files:**
- Create: `supabase/migrations/20260614000000_create_manto_de_maria_schema.sql`
- Create: `lib/supabase-server.ts`
- Create: `lib/repository.ts`
- Create: `scripts/seed-participants.ts`
- Create: `tests/lib/repository.test.ts`
- Create: `tests/scripts/seed-participants.test.ts`

- [ ] **Step 1: Write failing repository tests**

Use a narrow fake Supabase query builder to verify:

- Participants select exactly `id,name,slug` and are ordered by name.
- Message insertion contains only `recipient_id` and `message_text`.
- Read lookup selects `id,name,slug,password_hash` by slug.
- Message read selects `id,message_text`, filters by `recipient_id`, and calls
  `.order("created_at", { ascending: false })`.
- Returned public messages map `message_text` to `messageText`.

- [ ] **Step 2: Verify repository tests fail**

Run: `npm test -- tests/lib/repository.test.ts`

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement the server client and repository**

`createSupabaseServerClient()` must read
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, throw a clear
server-only configuration error when absent, and create a Supabase client with
session persistence and refresh disabled.

Repository functions accept an optional client for tests and export:

```ts
listParticipants(client?): Promise<PublicParticipant[]>
participantExists(id, client?): Promise<boolean>
insertAnonymousMessage(input, client?): Promise<void>
findParticipantForLogin(slug, client?): Promise<ParticipantLoginRow | null>
listMessagesForParticipant(id, client?): Promise<PublicMessage[]>
```

- [ ] **Step 4: Verify repository tests pass**

Run: `npm test -- tests/lib/repository.test.ts`

Expected: PASS.

- [ ] **Step 5: Create and inspect the migration**

Create both UUID tables, trim/length checks, foreign key, descending composite
index, RLS, and explicit revokes:

```sql
alter table public.participants enable row level security;
alter table public.messages enable row level security;
revoke all on table public.participants from anon, authenticated;
revoke all on table public.messages from anon, authenticated;
```

Do not create public policies and do not create a sender column.

- [ ] **Step 6: Write failing seed tests**

Export `PARTICIPANTS` and test that it contains exactly 21 unique names,
slugs, and two-digit passwords matching the approved specification.

- [ ] **Step 7: Implement the seed**

Hash every password with `hashPassword`, then upsert rows by `slug` using the
service-role client. Exit non-zero and print a concise server-side error if
upsert fails.

- [ ] **Step 8: Verify seed tests pass**

Run: `npm test -- tests/scripts/seed-participants.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add supabase lib/supabase-server.ts lib/repository.ts scripts tests/lib/repository.test.ts tests/scripts
git commit -m "feat: add supabase schema and participant seed"
```

### Task 4: Server API Routes

**Files:**
- Create: `app/api/participants/route.ts`
- Create: `app/api/messages/route.ts`
- Create: `app/api/read-messages/route.ts`
- Create: `lib/request.ts`
- Create: `tests/api/participants.test.ts`
- Create: `tests/api/messages.test.ts`
- Create: `tests/api/read-messages.test.ts`

- [ ] **Step 1: Write failing participant route tests**

Mock `listParticipants` and assert `GET` returns only the public participant
shape. Assert database errors become status `500` with
`"Não foi possível carregar os participantes."`.

- [ ] **Step 2: Implement participant route and verify GREEN**

Run: `npm test -- tests/api/participants.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing send route tests**

Assert:

- Invalid body returns `400`.
- Missing recipient returns a friendly `400`.
- A valid body calls `insertAnonymousMessage` with exactly
  `{ recipientId, messageText }`.
- Success returns `201` and `"Mensagem enviada com carinho!"`.
- Repository failure returns a generic `500`.
- A blocked IP returns `429`.

- [ ] **Step 4: Implement send route and verify GREEN**

Extract the first IP from `x-forwarded-for`, apply the send limiter, parse JSON
safely, validate with Zod, verify the recipient exists, and insert. Run:

`npm test -- tests/api/messages.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing read route tests**

Assert:

- Invalid input returns `400`.
- Unknown slug and wrong password both return `401` with `"Senha incorreta."`.
- Password comparison occurs server-side.
- Correct password queries messages only with the authenticated participant ID.
- Response contains participant name and `{ id, messageText }` only.
- A blocked IP returns `429`.

- [ ] **Step 6: Implement read route and verify GREEN**

Run: `npm test -- tests/api/read-messages.test.ts`

Expected: PASS.

- [ ] **Step 7: Run all server tests**

Run: `npm test -- tests/lib tests/api tests/scripts`

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add app/api lib/request.ts tests/api
git commit -m "feat: add anonymous message api"
```

### Task 5: Mobile Interface and Interaction

**Files:**
- Create: `components/MarianHeader.tsx`
- Create: `components/HomeCard.tsx`
- Create: `components/ParticipantSelector.tsx`
- Create: `components/SendMessageForm.tsx`
- Create: `components/ReadMessagesForm.tsx`
- Create: `components/MessagesList.tsx`
- Create: `app/page.tsx`
- Create: `app/enviar/page.tsx`
- Create: `app/mensagens/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/components/Home.test.tsx`
- Create: `tests/components/SendMessageForm.test.tsx`
- Create: `tests/components/ReadMessagesForm.test.tsx`
- Create: `tests/components/MessagesList.test.tsx`

- [ ] **Step 1: Write failing home tests**

Assert the home renders the Marian image, title, subtitle, and links to
`/enviar` and `/mensagens`.

- [ ] **Step 2: Implement home components and verify GREEN**

Use `next/image`, Lucide icons, semantic links, and large rounded action cards.
Run: `npm test -- tests/components/Home.test.tsx`

Expected: PASS.

- [ ] **Step 3: Write failing send form tests**

Mock `fetch` and assert:

- Participants load from `/api/participants`.
- Empty submit shows friendly field errors.
- Valid submit posts only `recipientId` and `messageText`.
- Success clears controls and displays the approved confirmation.
- API failure displays its friendly message.

- [ ] **Step 4: Implement send form and verify GREEN**

Use accessible labels, a 2,000-character textarea, disabled/loading button
state, and no sender input. Run:

`npm test -- tests/components/SendMessageForm.test.tsx`

Expected: PASS.

- [ ] **Step 5: Write failing read flow tests**

Assert participant loading, empty validation, numeric two-digit password input,
wrong-password feedback, loading state, and successful rendering of messages
without sender/date/time.

- [ ] **Step 6: Implement read flow and message cards**

Keep credentials in component memory only. On success, replace the login form
with the participant greeting and message list. Run:

`npm test -- tests/components/ReadMessagesForm.test.tsx tests/components/MessagesList.test.tsx`

Expected: PASS.

- [ ] **Step 7: Implement celestial responsive styling**

Create a layered sky/cream background, CSS stars and cloud shapes, golden halo,
glass cards, minimum 48 px controls, focus-visible rings, safe-area padding,
and a centered desktop shell. Ensure the main content fits 390 px without
horizontal overflow.

- [ ] **Step 8: Run component and accessibility-oriented tests**

Run: `npm test -- tests/components`

Expected: all tests PASS.

- [ ] **Step 9: Commit**

```bash
git add app components tests/components
git commit -m "feat: build celestial mobile interface"
```

### Task 6: Documentation and Full Verification

**Files:**
- Create: `README.md`
- Modify: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Write complete setup documentation**

Document:

- Project purpose and security limitation.
- The 21 approved names, slugs, and public two-digit passwords.
- Supabase project creation and SQL migration execution.
- `npm run seed` after setting server-side environment variables.
- Local commands `npm install`, `npm run dev`, `npm test`, and `npm run build`.
- Vercel import, all three environment variables, deploy, and mobile access.
- A warning that `SUPABASE_SERVICE_ROLE_KEY` must never use a
  `NEXT_PUBLIC_` prefix or be placed in browser code.
- A note that real Supabase verification needs project credentials.

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test`

Expected: all tests PASS with zero failures.

- [ ] **Step 3: Run static checks**

Run: `npm run lint`

Expected: exit 0 with no errors.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: exit 0 and all three pages plus three API routes listed.

- [ ] **Step 5: Run visual browser verification**

Start `npm run dev`, open the app at a 390 px viewport, and verify:

- Home title/image/actions are visible and balanced.
- No horizontal overflow.
- Form labels and controls are readable and touch-friendly.
- Empty validation messages appear.
- Maria is centered and uncut.
- Browser console has no application errors.

- [ ] **Step 6: Review the requirement checklist**

Confirm each acceptance criterion in the design spec has implementation or
test evidence. Record any limitation caused by absent live Supabase
credentials.

- [ ] **Step 7: Commit**

```bash
git add README.md .env.example .gitignore
git commit -m "docs: add supabase and vercel deployment guide"
```
