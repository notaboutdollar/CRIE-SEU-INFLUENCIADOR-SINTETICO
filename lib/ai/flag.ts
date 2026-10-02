/**
 * Flag global que liga/desliga as features de IA na UI.
 *
 * Desligada por padrão porque a geração custa dinheiro na Anthropic. Quando
 * você quiser habilitar:
 *   1. Preencha `ANTHROPIC_API_KEY` no `.env.local` (server-side).
 *   2. Setar `NEXT_PUBLIC_AI_ENABLED=true` no mesmo arquivo (client + server).
 *
 * Sem essa flag ligada:
 *   - O modal "Como começar?" não mostra a opção "Expandir com IA".
 *   - O botão "Sugerir com IA" não aparece em nenhum campo.
 *   - "Regenerar esta seção" não aparece no footer dos steps.
 *   - A seção "Checar com IA" na Revisão fica escondida.
 * As rotas em `app/api/*` continuam existindo, mas ninguém as chama.
 */
export const AI_ENABLED =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_AI_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_AI_ENABLED === "1");
