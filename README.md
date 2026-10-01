# Crie seu Influenciador Sintético

Wizard em etapas para definir, campo a campo, quem é o seu influenciador sintético. No final, entrega a **Ficha do Influenciador** completa e o **Prompt Mestre** pronto para gerar imagem, vídeo e roteiro.

> **v1 — totalmente local.** Nada é enviado para servidor. Os personagens ficam no `localStorage` do navegador.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Build e start de produção:

```bash
npm run build
npm run start
```

Checagem de tipos:

```bash
npm run typecheck
```

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** 3 — tema dark, violeta/índigo com destaques em verde
- **Zustand** + middleware `persist` → localStorage
- **lucide-react** para ícones
- **html2canvas** + **jspdf** para exportar PNG/PDF da ficha

## Estrutura do projeto

```
app/
  layout.tsx               # tema dark, metadata
  page.tsx                 # Home — "Seus Personagens"
  personagem/[id]/page.tsx # Wizard do personagem

components/
  home/                    # cards da listagem, empty state
  wizard/                  # tabs, header, footer, status badge, shell
  preview/                 # cartão de pré-visualização ao vivo
  steps/                   # 1 arquivo por etapa (Identidade…Revisão)
  ui/                      # primitives (Button, Input, TagInput, DicaBox…)
  export/                  # Ficha pôster (renderizado em canvas)

lib/
  types.ts                 # tipos do Character
  defaults.ts              # emptyCharacter(), duplicateCharacter()
  store.ts                 # Zustand (CRUD + persist)
  useCharacter.ts          # hook de leitura+escrita por id
  completion.ts            # Rascunho/Completo + checklist de consistência
  cn.ts                    # merge de classes
  export.ts                # Markdown, JSON, PNG, PDF, copiar
  prompts/
    imagem.ts              # Prompt de imagem
    roteiro.ts             # Prompt de roteiro/texto
    video.ts               # Prompt de vídeo
    index.ts               # assembleMasterPrompt(character)

data/
  steps.ts                 # config das 7 etapas (título, ícone, dica)
  choices.ts               # opções (gêneros, formas, traços, arquétipos, plataformas…)
```

## Como adicionar uma pergunta nova

A maior parte das perguntas vive em um único step. Para adicionar uma:

1. Se é um campo novo, acrescente a propriedade em [`lib/types.ts`](lib/types.ts) e inicialize em [`lib/defaults.ts`](lib/defaults.ts).
2. Abra o step correspondente em `components/steps/` e inclua um `<Field>` com o componente adequado (`Input`, `Textarea`, `TagInput`, `CardChoice`, `Chip`, `Slider`).
3. Se o campo contar para "preenchimento" ou "consistência", adicione a checagem em [`lib/completion.ts`](lib/completion.ts).
4. Se o campo deve aparecer na ficha ou nos prompts, inclua-o em `lib/export.ts` e nos arquivos de `lib/prompts/`.

## Como adicionar uma etapa nova

1. Crie o componente em `components/steps/MinhaEtapaStep.tsx`.
2. Em [`data/steps.ts`](data/steps.ts), adicione um item em `STEPS` (id, título, subtítulo, ícone, dica).
3. Em [`lib/types.ts`](lib/types.ts), inclua o id na union `STEP_IDS`.
4. No `switch` dentro de [`components/wizard/Wizard.tsx`](components/wizard/Wizard.tsx), associe o novo id ao componente.

## Prompt Mestre

Os três blocos são montados a partir das respostas em arquivos separados:

- `lib/prompts/imagem.ts` → aparência, estilo, ambiente, negativos
- `lib/prompts/roteiro.ts` → personalidade, voz, bordões, limites, nicho
- `lib/prompts/video.ts` → resumo visual + tom + formato

Edite os templates lá para mudar o tom ou acrescentar diretrizes do seu stack de geração.

## Deploy

Pronto para Vercel: `vercel` ou importar via painel. Nenhuma variável de ambiente é necessária na v1.

## v2 — backlog

- [ ] Login (NextAuth / Clerk / Supabase Auth)
- [ ] Banco de dados (Supabase/Postgres), substituindo o `persist` do Zustand (a mesma API `useCharacters` muda só a camada abaixo)
- [ ] Compartilhamento da ficha por link público (`/ficha/[slug]`)
- [ ] Geração de imagem via API diretamente a partir do Prompt Mestre
- [ ] Versionamento do personagem (histórico, diff entre versões)
- [ ] Cards de "Traço/estilo" com arte real em vez de placeholders
- [ ] Dependências entre etapas (cadeado com motivo) — hoje tudo é navegável
- [ ] Importar JSON de outra sessão / outro usuário
- [ ] Modo claro / tema customizável por personagem
- [ ] Tradução para espanhol e inglês
