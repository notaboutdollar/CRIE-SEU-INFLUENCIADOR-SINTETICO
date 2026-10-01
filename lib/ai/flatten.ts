import type { Suggestion } from "@/lib/store";
import type { ExpandirResposta } from "./schema";

interface Envelope {
  valor: unknown;
  origem?: "contexto" | "suposicao";
}

function isEnvelope(x: unknown): x is Envelope {
  return !!x && typeof x === "object" && "valor" in (x as object);
}

const SECAO_SIMPLES: (keyof ExpandirResposta)[] = [
  "identidade",
  "visual",
  "nicho",
  "voz",
  "monetizacao",
];

const SOUL_NESTED = ["gostos", "odeia", "reacoes"] as const;

/**
 * Converte o payload nested da IA em uma lista plana de Suggestion
 * (`{fieldId em dot-notation, valor, origem}`), pronta para `applySuggestions`.
 */
export function toSuggestions(data: ExpandirResposta): Suggestion[] {
  const out: Suggestion[] = [];

  for (const sec of SECAO_SIMPLES) {
    const bloco = data[sec];
    if (!bloco || typeof bloco !== "object") continue;
    for (const [k, v] of Object.entries(bloco)) {
      if (isEnvelope(v)) {
        out.push({ fieldId: `${sec}.${k}`, valor: v.valor, origem: v.origem ?? "suposicao" });
      }
    }
  }

  // soul tem sub-objetos nested (gostos/odeia/reacoes)
  const soul = data.soul;
  if (soul && typeof soul === "object") {
    for (const [k, v] of Object.entries(soul)) {
      if ((SOUL_NESTED as readonly string[]).includes(k) && v && typeof v === "object") {
        for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) {
          if (isEnvelope(v2)) {
            out.push({
              fieldId: `soul.${k}.${k2}`,
              valor: v2.valor,
              origem: v2.origem ?? "suposicao",
            });
          }
        }
      } else if (isEnvelope(v)) {
        out.push({ fieldId: `soul.${k}`, valor: v.valor, origem: v.origem ?? "suposicao" });
      }
    }
  }

  return out;
}

export function extractPontosEmAberto(data: ExpandirResposta) {
  return (data.pontosEmAberto ?? []).map((p) => ({
    decisao: p.decisao,
    porQueImporta: p.porQueImporta,
  }));
}
