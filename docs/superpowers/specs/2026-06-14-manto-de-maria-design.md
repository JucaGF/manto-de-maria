# Manto de Maria - Especificacao de Design

## Objetivo

Construir uma aplicacao web mobile-first para um circulo de igreja enviar
mensagens anonimas e permitir que cada participante leia somente as mensagens
destinadas a ele. A aplicacao sera publicada na Vercel e usara o Supabase como
banco compartilhado entre celulares.

## Escopo

A primeira versao tera tres telas:

- Inicio, com acesso aos dois fluxos principais.
- Envio de mensagem anonima.
- Autenticacao simples e leitura das mensagens recebidas.

Nao havera cadastro, identificacao do remetente, painel administrativo,
edicao ou exclusao de mensagens, notificacoes, recuperacao de senha ou
historico com data visivel.

## Direcao Visual

A interface seguira a direcao "celestial equilibrada":

- Fundo em degradês de azul-claro, branco e creme.
- Nuvens, estrelas e brilhos suaves como elementos decorativos.
- Detalhes dourados discretos em bordas, halos e icones.
- Cartoes arredondados, translucidos e com sombras leves.
- Tipografia elegante nos titulos e altamente legivel nos formularios.
- Imagem fornecida de Maria centralizada no topo da pagina inicial, sem
  recorte, com halo dourado suave ao fundo.
- A mesma imagem aparecera menor nas telas internas para preservar espaco.

O layout sera desenhado primeiro para uma largura de 390 px. Controles
interativos terao pelo menos 48 px de altura, o conteudo nao causara rolagem
horizontal e a versao desktop apenas centralizara e ampliara moderadamente a
composicao mobile.

## Experiencia

### Inicio

A tela inicial mostrara:

- Imagem de Maria.
- Titulo "Manto de Maria".
- Texto "Um espaco de carinho, oracao e mensagens anonimas para o nosso
  circulo."
- Cartao "Enviar mensagem".
- Cartao "Ler minhas mensagens".

### Enviar mensagem

O formulario tera:

- Titulo "Escreva uma mensagem especial".
- Seletor "Para quem voce quer enviar?".
- Campo de texto multilinha.
- Botao "Enviar anonimamente".
- Acao "Voltar".

O usuario nunca informara o proprio nome. O envio exigira destinatario e
mensagem com conteudo apos remover espacos laterais. O servidor aceitara
mensagens entre 1 e 2.000 caracteres. Apos sucesso, o formulario sera limpo e
mostrara "Mensagem enviada com carinho!".

### Ler mensagens

O formulario de entrada tera:

- Seletor "Escolha seu nome".
- Campo "Digite sua senha" com teclado numerico em celulares.
- Botao "Entrar".
- Acao "Voltar".

Depois da validacao, a pagina mostrara "Minhas mensagens" e cartoes contendo
somente o texto. Nao mostrara remetente, data ou hora. A consulta usara
`created_at` apenas para ordenar da mensagem mais recente para a mais antiga.
Sem resultados, mostrara "Ainda nao ha mensagens para voce.". Uma senha
invalida mostrara exatamente "Senha incorreta.".

## Participantes e Senhas Iniciais

As senhas serao publicadas no README conforme solicitado. Elas sao uma
barreira informal para um grupo fechado, nao autenticacao segura. Com apenas
dois digitos e credenciais publicas, qualquer pessoa com acesso ao repositorio
pode entrar em qualquer caixa de mensagens.

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

O seed armazenara somente hashes bcrypt. Os numeros em texto puro existirao
apenas no arquivo de seed e no README para facilitar a configuracao e
distribuicao inicial.

## Arquitetura

### Aplicacao

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Componentes React client-side apenas onde houver formulario ou estado
  interativo.
- Rotas de API do Next.js para todas as operacoes de banco.
- `next/image` para otimizar a imagem fornecida.

### Supabase

O navegador nao consultara tabelas diretamente. As rotas de API usarao um
cliente Supabase server-side com `SUPABASE_SERVICE_ROLE_KEY`. A chave nunca
sera importada por componentes client-side.

As tabelas do schema `public` terao RLS habilitado e nenhuma policy para
`anon` ou `authenticated`. Isso bloqueia o acesso direto pela Data API; o
cliente server-side com service role executara somente as operacoes
necessarias.

Variaveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

A anon key sera aceita na configuracao por compatibilidade com o fluxo de
setup solicitado, mas a primeira versao nao a usara para ler ou gravar dados
no navegador.

### Banco

`participants`:

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text unique not null`
- `password_hash text not null`
- `created_at timestamptz not null default now()`

`messages`:

- `id uuid primary key default gen_random_uuid()`
- `recipient_id uuid not null references participants(id) on delete cascade`
- `message_text text not null`
- `created_at timestamptz not null default now()`

Restricoes SQL garantirao `char_length(trim(message_text)) between 1 and
2000`. Um indice em `(recipient_id, created_at desc)` apoiara a leitura.
Nao existira coluna de remetente.

## Contratos da API

### `GET /api/participants`

Resposta `200`:

```json
{
  "participants": [
    {
      "id": "uuid",
      "name": "Henrique",
      "slug": "henrique"
    }
  ]
}
```

Nunca retornara `password_hash`.

### `POST /api/messages`

Entrada:

```json
{
  "recipientId": "uuid",
  "messageText": "Uma mensagem especial"
}
```

Comportamento:

- Valida UUID, destinatario existente e texto.
- Remove espacos laterais do texto.
- Insere somente `recipient_id` e `message_text`.
- Retorna `201` sem expor o registro completo.
- Retorna `400` para entrada invalida e `500` com mensagem generica para
  falha interna.

### `POST /api/read-messages`

Entrada:

```json
{
  "participantSlug": "henrique",
  "password": "14"
}
```

Comportamento:

- Busca o participante pelo slug somente no servidor.
- Compara a senha com `password_hash` usando bcrypt.
- Retorna `401` e `"Senha incorreta."` quando a senha nao confere.
- Retorna apenas `id` e `messageText` das mensagens daquele participante.
- Ordena por `created_at desc`, sem retornar a data.

Resposta `200`:

```json
{
  "participant": {
    "name": "Henrique"
  },
  "messages": [
    {
      "id": "uuid",
      "messageText": "Uma mensagem especial"
    }
  ]
}
```

## Validacao e Erros

Schemas compartilhados com Zod validarao os corpos das requisicoes. A
interface traduzira estados tecnicos para textos curtos em portugues. Erros
do Supabase serao registrados no servidor sem enviar detalhes internos ao
navegador.

Um limitador em memoria por IP protegera, em melhor esforco, os endpoints de
envio e leitura contra rajadas. Como instancias serverless da Vercel nao
compartilham memoria, ele nao constitui protecao forte nem substitui senhas
adequadas. Essa limitacao sera documentada.

## Estrutura Prevista

```text
app/
  api/
    messages/route.ts
    participants/route.ts
    read-messages/route.ts
  enviar/page.tsx
  mensagens/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  HomeCard.tsx
  MarianHeader.tsx
  MessagesList.tsx
  ParticipantSelector.tsx
  ReadMessagesForm.tsx
  SendMessageForm.tsx
lib/
  auth.ts
  contracts.ts
  rate-limit.ts
  supabase-server.ts
  types.ts
public/
  maria.png
scripts/
  seed-participants.ts
supabase/
  migrations/
    <timestamp>_create_manto_de_maria_schema.sql
tests/
  api/
  components/
  lib/
```

## Testes

Vitest e Testing Library cobrirao:

- Schemas de entrada vazia, UUID invalido e limite da mensagem.
- Comparacao de senha correta e incorreta.
- Serializacao publica de participantes sem hash.
- Envio sem qualquer campo de remetente.
- Falha amigavel quando o Supabase retorna erro.
- Leitura filtrada pelo participante autenticado.
- Ordenacao solicitada por `created_at desc`.
- Renderizacao dos estados vazio, erro, carregamento e sucesso.

A verificacao final incluira:

- `npm test`
- `npm run lint`
- `npm run build`
- Teste visual em viewport de 390 px.
- Fluxos de envio, senha incorreta e leitura bem-sucedida com dependencias de
  banco simuladas nos testes automatizados.

Uma verificacao real contra Supabase dependera das credenciais do projeto do
usuario e sera descrita no README.

## Deploy e Documentacao

O README explicara:

1. Criar um projeto Supabase.
2. Executar a migracao SQL.
3. Configurar as tres variaveis de ambiente.
4. Executar o seed dos participantes.
5. Revisar a lista publica de senhas.
6. Rodar localmente com `npm install`, `npm run dev` e `npm run build`.
7. Criar um projeto Vercel a partir do repositorio GitHub.
8. Adicionar as variaveis na Vercel e publicar.
9. Abrir a URL publicada no celular.

## Criterios de Aceite

- Diferentes celulares veem os mesmos dados armazenados no Supabase.
- Uma mensagem pode ser enviada sem informar ou armazenar remetente.
- A lista publica de participantes contem somente `id`, `name` e `slug`.
- Uma senha incorreta nao retorna mensagens.
- Uma senha correta retorna somente mensagens do participante escolhido.
- A interface nunca mostra remetente, data, hora ou hash.
- O projeto compila para producao na Vercel.
- A experiencia em 390 px e legivel, tocavel e sem rolagem horizontal.
