# Manto de Maria

Aplicação mobile-first para o círculo enviar mensagens anônimas e cada
participante ler somente as mensagens destinadas a ele.

- **Next.js + TypeScript** na interface e nas APIs.
- **Supabase** como banco compartilhado entre celulares.
- **Vercel** para o deploy.
- Senhas comparadas no servidor com **bcrypt**.
- Nenhuma informação sobre o remetente é solicitada ou armazenada.

## Aviso sobre as senhas

As senhas desta primeira versão têm apenas dois dígitos e estão publicadas
neste README por escolha do grupo. Elas funcionam somente como uma barreira
informal. Qualquer pessoa com acesso ao repositório pode entrar nas caixas de
mensagens.

Para privacidade real, troque essas senhas por credenciais longas e não as
publique.

## Participantes e senhas iniciais

| Participante | Slug | Senha |
| --- | --- | --- |
| Henrique | `henrique` | `14` |
| Cauã Victor | `caua-victor` | `27` |
| Clarinha | `clarinha` | `31` |
| Felipe | `felipe` | `46` |
| João Victor | `joao-victor` | `52` |
| Leonardo Filho | `leonardo-filho` | `68` |
| Mariah Norat | `mariah-norat` | `73` |
| Miguel Antônio | `miguel-antonio` | `85` |
| Giullia | `giullia` | `19` |
| Isabela | `isabela` | `24` |
| Júlia Barros | `julia-barros` | `37` |
| Lucas Gabriel | `lucas-gabriel` | `41` |
| Hellô | `hello` | `56` |
| Mariah Serrano | `mariah-serrano` | `62` |
| Samuel | `samuel` | `79` |
| Hanna | `hanna` | `83` |
| Jaya | `jaya` | `95` |
| Leo Azevedo | `leo-azevedo` | `12` |
| Malu | `malu` | `34` |
| Marina | `marina` | `58` |
| Mariah Alves | `mariah-alves` | `76` |
| Aline | `aline` | `43` |
| Lisandro | `lisandro` | `92` |
| Joaquim | `joaquim` | `67` |
| Clara Melo | `clara-melo` | `38` |

Para mudar as senhas iniciais, edite `PARTICIPANTS` em
[`scripts/seed-participants.ts`](scripts/seed-participants.ts) e execute o seed
novamente. O banco recebe somente `password_hash`, nunca a senha em texto
puro.

## Configuração local

Requisitos:

- Node.js 20.9 ou mais recente.
- Um projeto no Supabase.

Instale as dependências:

```bash
npm install
```

Crie o arquivo local de ambiente:

```bash
cp .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE
```

`SUPABASE_SERVICE_ROLE_KEY` é secreta. Nunca adicione `NEXT_PUBLIC_` ao nome
dela, nunca importe essa chave em componentes client-side e nunca publique o
arquivo `.env.local`.

## Criar o banco no Supabase

1. Acesse [Supabase](https://supabase.com/) e crie um projeto.
2. Abra **SQL Editor** no painel.
3. Copie e execute todo o conteúdo de
   [`supabase/migrations/20260614181543_create_manto_de_maria_schema.sql`](supabase/migrations/20260614181543_create_manto_de_maria_schema.sql).
4. Em **Project Settings > API**, copie a URL, a chave anon e a service role
   para `.env.local`.
5. Execute:

```bash
npm run seed
```

O seed é idempotente: ele atualiza os participantes usando o `slug` e não cria
duplicatas.

Para adicionar os quatro participantes complementares em um banco que já
possui os 21 iniciais, execute também a migration
[`supabase/migrations/20260615021806_add_additional_participants.sql`](supabase/migrations/20260615021806_add_additional_participants.sql).

### Segurança do banco

As tabelas `participants` e `messages` têm RLS habilitado e acesso revogado
para os papéis públicos `anon` e `authenticated`. Somente as APIs server-side
do Next.js usam a service role.

A tabela `messages` não possui coluna de remetente. Ela armazena apenas:

- `id`
- `recipient_id`
- `message_text`
- `created_at`

`created_at` serve somente para ordenar da mensagem mais nova para a mais
antiga. A interface não mostra data nem hora.

## Desenvolvimento

Inicie o servidor:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Comandos disponíveis:

```bash
npm test
npm run lint
npm run build
npm start
```

Sem credenciais Supabase, a home abre normalmente, mas os seletores mostrarão
um erro amigável porque a API não consegue carregar os participantes.

## Deploy na Vercel

O fluxo mais simples é:

1. Crie o projeto Supabase.
2. Execute a migração SQL.
3. Configure `.env.local` e rode `npm run seed` uma vez no seu computador.
4. Envie este repositório para o GitHub.
5. Acesse [Vercel](https://vercel.com/new) e importe o repositório.
6. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Clique em **Deploy**.
8. Abra a URL `*.vercel.app` no celular e compartilhe com o círculo.

Não é necessário configurar servidor próprio. A Vercel executa as rotas de
API, e todos os celulares leem e gravam no mesmo projeto Supabase.

## Endpoints

### `GET /api/participants`

Retorna somente `id`, `name` e `slug`.

### `POST /api/messages`

```json
{
  "recipientId": "uuid",
  "messageText": "Uma mensagem especial"
}
```

Não recebe nem armazena remetente.

### `POST /api/read-messages`

```json
{
  "participantSlug": "henrique",
  "password": "14"
}
```

A senha é comparada com o hash no servidor. A resposta contém somente o nome
do participante e os textos destinados a ele.

## Limitações conhecidas

- Senhas públicas de dois dígitos não oferecem segurança forte.
- O limitador por IP usa memória local e funciona apenas como proteção de
  melhor esforço em funções serverless.
- A validação real contra Supabase depende das credenciais do projeto. Os
  testes automatizados simulam o banco e verificam os contratos das queries.
