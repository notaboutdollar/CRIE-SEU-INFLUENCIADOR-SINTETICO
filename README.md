# Crie seu Influenciador Sintético

Wizard em etapas para definir, campo a campo, quem é o seu influenciador sintético. No final, entrega a **Ficha do Influenciador** completa e o **Prompt Mestre** (imagem, roteiro, vídeo) + o **Prompt de sistema** pronto para colar em qualquer chat de IA.

As features de IA (expansão por contexto, sugerir campo, regenerar seção, checar coerência) são **opcionais** — ficam escondidas por padrão. O wizard manual funciona 100% sem configurar nada.

> **v2.** Personagens vivem no `localStorage`. Quando a IA é ligada, a geração usa a API da Anthropic no server-side.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Pronto — o wizard manual já funciona.

Build e start de produção:

```bash
npm run build
npm run start
```

Checagem de tipos / testes:

```bash
npm run typecheck
npm test
```

## Gerar no Claude (sem custo, sem chave)

Ao clicar em **Criar personagem**, o site pergunta como começar:

- **Criar manualmente** — wizard em branco.
- **Gerar no Claude** — o site monta um prompt com todas as perguntas do wizard (+ a ideia que você escrever, opcional). Você copia, cola no seu Claude (claude.ai), e cola a resposta JSON de volta no site. A ficha é preenchida e cada campo vem marcado como "sugestão" para você revisar.

Tudo roda no navegador: nenhuma chave de API, nenhum custo para o site. O prompt e o importador são gerados a partir de [`data/perguntas.ts`](data/perguntas.ts); o texto-base fica em [`data/prompts/gerar-no-claude.ts`](data/prompts/gerar-no-claude.ts).

## Ligar a IA (opcional)

Por padrão, nenhum botão de IA aparece — assim nenhum request vai pra Anthropic e não tem custo. Para habilitar as features de IA:

1. Copie `.env.example` para `.env.local` (ignorado pelo git).
2. Preencha `ANTHROPIC_API_KEY=sk-ant-...` (só server-side, nunca vai pro bundle).
3. Setar `NEXT_PUBLIC_AI_ENABLED=true` (controla a UI).
4. Reinicie o `npm run dev`.

Com a flag desligada, os botões "Expandir com IA", "Sugerir com IA", "Regenerar esta seção" e "Checar com IA" ficam escondidos; o resto do app funciona normal. Com a flag ligada mas sem chave, os botões aparecem mas devolvem erro `CONFIG_MISSING` em pt-BR.

Variáveis adicionais:
- `ANTHROPIC_MODEL` — opcional. Default `claude-sonnet-5-5`.
- `RATE_LIMIT_PER_MINUTE` — opcional. Default `10` (janela deslizante de 1 min por IP, em memória).

Deploy na Vercel: `Settings → Environment Variables` → adicione `ANTHROPIC_API_KEY` **e** `NEXT_PUBLIC_AI_ENABLED=true` → Redeploy. Deixar as duas em branco mantém o deploy no modo manual, zero custo.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** — tema claro, cream + verde, serif Fraunces + Inter + JetBrains Mono (design system do Treinadores de IA)
- **Zustand** + middleware `persist` → localStorage
- **@anthropic-ai/sdk** + **Zod** para as rotas de IA
- **vitest** para testes
- **lucide-react**, **html2canvas**, **jspdf**

## Estrutura do projeto

```
app/
  layout.tsx                     tema + fonts
  page.tsx                       Home — "Seus Personagens"
  personagem/[id]/page.tsx       Wizard
  api/
    expandir-ficha/route.ts      POST — contexto curto → sugestões para toda a ficha
    sugerir-campo/route.ts       POST — sugere valor para 1 campo específico
    regenerar-secao/route.ts     POST — regenera uma seção respeitando campos travados
    checar-consistencia/route.ts POST — editor crítico IA (contradições, clichês, genéricos)

components/
  home/                          CreateDialog (modal "Como começar?"), cards, empty state
  wizard/                        shell, tabs, header, footer, StatusBadge, SuggestionCounter,
                                 SuggestFieldButton, RegenerateSection, WizardContext
  preview/CharacterCard.tsx      pré-visualização ao vivo
  steps/                         7 arquivos (Identidade…Revisão)
  revisao/                       ConsistenciaIA, PontosEmAberto
  ui/                            Button, Input, Textarea, TagInput, CardChoice, Chip, Field,
                                 Slider, DicaBox
  export/FichaPoster.tsx         pôster vertical/horizontal da ficha

lib/
  types.ts                       Character + metadados IA (_suggestions, _locks, _history)
  defaults.ts                    emptyCharacter + hydrate (migra personagens antigos)
  store.ts                       Zustand (CRUD + applySuggestions, undoLast, toggleLock…)
  useCharacter.ts                hook de leitura/escrita por id
  completion.ts                  Rascunho/Completo + checker regex (vazios, contradições)
  cn.ts, paths.ts                utilitários
  export.ts                      Markdown, JSON, PNG, PDF, copiar
  prompts/
    imagem.ts, roteiro.ts, video.ts, index.ts      Prompt Mestre
    sistema.ts                                     Prompt de sistema do personagem
  ai/
    anthropic.ts                 client + askClaude; erros tipados
    schema.ts                    Zod envelopes + extractJson
    parse.ts                     askJson com retry/reparo de JSON
    flatten.ts                   payload nested → lista de Suggestion
    prompts.ts                   leitor + render dos .md
    rate-limit.ts                in-memory por IP
    strip.ts                     limpa _metadados e dataUrls antes de enviar à IA

data/
  steps.ts                       config das 7 etapas (título, ícone, dica)
  choices.ts                     opções fixas (gêneros, formas, traços, arquétipos…)
  prompts/                       templates em Markdown — editáveis sem tocar em componente
    expandir-ficha.md
    sugerir-campo.md
    regenerar-secao.md
    checar-consistencia.md
    sistema-personagem.md
```

## Como adicionar uma pergunta nova

1. Novo campo? Acrescente a propriedade em [`lib/types.ts`](lib/types.ts) e inicialize em [`lib/defaults.ts`](lib/defaults.ts) (também em `hydrate()` se for aditivo).
2. Abra o step correspondente em `components/steps/` e inclua um `<Field>` com o componente adequado. Passe `fieldId="chave.subchave"` para habilitar o badge "Sugestão da IA", o cadeado e o auto-confirm. Passe `aiDescricao` se quiser o botão "Sugerir com IA".
3. Registre a pergunta em [`data/perguntas.ts`](data/perguntas.ts) (mesmo `fieldId`, tipo e descrição). É isso que faz o prompt "Gerar no Claude" perguntar e o importador aceitar o campo.
3. Se o campo deve contar para "Rascunho/Completo" ou para o checker regex, adicione em [`lib/completion.ts`](lib/completion.ts).
4. Se o campo deve ir para a ficha ou os prompts, inclua em `lib/export.ts`, nos `lib/prompts/*` e em `data/prompts/expandir-ficha.md`.
5. Para a IA conhecer o novo campo, adicione a entrada no esquema de [`lib/ai/schema.ts`](lib/ai/schema.ts) e em `data/prompts/expandir-ficha.md`.

## Como adicionar uma etapa nova

1. Crie o componente em `components/steps/MinhaEtapaStep.tsx`.
2. Em [`data/steps.ts`](data/steps.ts), adicione um item em `STEPS` (id, título, subtítulo, ícone, dica).
3. Em [`lib/types.ts`](lib/types.ts), inclua o id na union `STEP_IDS`.
4. No `switch` dentro de [`components/wizard/Wizard.tsx`](components/wizard/Wizard.tsx), associe o novo id ao componente.
5. Em [`components/wizard/RegenerateSection.tsx`](components/wizard/RegenerateSection.tsx), adicione a lista de campos no `CAMPOS_POR_STEP`.

## Como editar o prompt da IA

Todos os templates estão em `data/prompts/*.md`. Variáveis são `{{nome}}`; a renderização substitui por valores do personagem/contexto. Os templates podem ser reescritos livremente — contanto que a saída continue sendo JSON válido para `lib/ai/schema.ts`.

## Prompt Mestre e Prompt de sistema

Três blocos separados do Prompt Mestre (`lib/prompts/{imagem,roteiro,video}.ts`) + um Prompt de sistema (`lib/prompts/sistema.ts`) montado client-side, pronto para colar em qualquer chat para o personagem responder sempre no estilo dele.

## Deploy

Vercel: importe o repo, defina `ANTHROPIC_API_KEY` em Environment Variables, deploy.

## v3 — backlog

- [ ] Login (NextAuth / Clerk / Supabase Auth)
- [ ] Banco (Supabase/Postgres) substituindo o `persist` do Zustand
- [ ] Streaming das sugestões por etapa (hoje é um bloco só)
- [ ] Rate limit distribuído (Upstash) + por conta logada
- [ ] "Usar minha chave Anthropic" (BYOK) opcional
- [ ] Geração de imagem via API direto do Prompt de imagem
- [ ] Compartilhamento da ficha por link público (`/ficha/[slug]`)
- [ ] Versionamento do personagem com diff entre gerações
- [ ] Cards de "Traço/estilo" com arte real em vez de placeholders
- [ ] Importar JSON de outra sessão / outro usuário
- [ ] Tradução para espanhol e inglês
