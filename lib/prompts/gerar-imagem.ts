import type { Character } from "@/lib/types";
import { IMAGEM_FLUX, IMAGEM_MIDJOURNEY, IMAGEM_NEUTRO } from "@/data/prompts/gerar-imagem";

export type FormatoImagem = "neutro" | "midjourney" | "flux";

export interface PromptImagem {
  formato: FormatoImagem;
  nome: string;
  descricaoCurta: string;
  gerador: string;
  prompt: string;
}

/**
 * Monta o prompt de imagem no formato pedido, usando os campos visuais da
 * ficha. Qualquer campo vazio é omitido naturalmente.
 */
export function buildImagePrompt(c: Character, formato: FormatoImagem): string {
  const nome = c.identidade.nome?.trim() || "the character";
  const descricao = extractDescricaoVisual(c, formato);
  const negativos = extractNegativos(c, formato);

  const template =
    formato === "midjourney"
      ? IMAGEM_MIDJOURNEY
      : formato === "flux"
      ? IMAGEM_FLUX
      : IMAGEM_NEUTRO;

  return template
    .replace(/\{\{nome\}\}/g, nome)
    .replace(/\{\{descricao\}\}/g, descricao)
    .replace(/\{\{negativos\}\}/g, negativos);
}

export function buildAllImagePrompts(c: Character): PromptImagem[] {
  return [
    {
      formato: "neutro",
      nome: "Neutro",
      descricaoCurta: "Para ChatGPT, Nano Banana, Gemini — linguagem natural rica em detalhes.",
      gerador: "ChatGPT · Gemini · Nano Banana",
      prompt: buildImagePrompt(c, "neutro"),
    },
    {
      formato: "midjourney",
      nome: "Midjourney",
      descricaoCurta: "Compacto, com --ar, --style raw, --v 6.1 e --no.",
      gerador: "Midjourney v6+",
      prompt: buildImagePrompt(c, "midjourney"),
    },
    {
      formato: "flux",
      nome: "Flux / SD",
      descricaoCurta: "Positive + Negative separados, para Flux, Stable Diffusion, DALL·E.",
      gerador: "Flux · Stable Diffusion · DALL·E",
      prompt: buildImagePrompt(c, "flux"),
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Descrição do personagem a partir da ficha                            */
/* ------------------------------------------------------------------ */

/**
 * Extrai um parágrafo descritivo dos campos visuais da ficha, com algumas
 * cores do nicho/soul (idade, gênero, vibe) para calibrar o rosto e o porte.
 * Formato pode mudar levemente conforme o template (Midjourney gosta de
 * descrições em frases curtas separadas por vírgulas; neutro/flux aceitam
 * prosa mais rica).
 */
export function extractDescricaoVisual(c: Character, formato: FormatoImagem): string {
  const partes: string[] = [];

  // Básicos
  const basicos: string[] = [];
  if (c.identidade.genero) basicos.push(labelGenero(c.identidade.genero));
  if (c.identidade.idadeAparente) basicos.push(c.identidade.idadeAparente);
  if (c.identidade.forma && c.identidade.forma !== "humano") {
    basicos.push(`${c.identidade.forma} form`);
  }
  if (basicos.length) partes.push(basicos.join(", "));

  // Aparência
  if (c.visual.cabelo) partes.push(`hair: ${c.visual.cabelo}`);
  if (c.visual.pele) partes.push(`skin: ${c.visual.pele}`);
  if (c.visual.olhos) partes.push(`eyes: ${c.visual.olhos}`);
  if (c.visual.tracosMarcantes) partes.push(`distinctive features: ${c.visual.tracosMarcantes}`);

  // Roupa
  const roupa: string[] = [];
  if (c.visual.roupa) roupa.push(c.visual.roupa);
  if (c.visual.acessorios) roupa.push(`accessories: ${c.visual.acessorios}`);
  if (roupa.length) partes.push(`wearing: ${roupa.join("; ")}`);

  // Paleta
  if (c.visual.paleta) partes.push(`color palette: ${c.visual.paleta}`);

  // Vibe
  if (c.soul.adjetivos.length) {
    partes.push(`vibe: ${c.soul.adjetivos.slice(0, 5).join(", ")}`);
  }

  // Traço autoral (se não for "automatico")
  if (c.visual.traco && c.visual.traco !== "automatico") {
    partes.push(`drawing style note: ${labelTraco(c.visual.traco)}`);
  }

  if (partes.length === 0) return "no visual details provided yet";

  // Midjourney gosta de tudo em linha; neutro/flux podem quebrar em frases
  if (formato === "midjourney") {
    return partes.join(", ");
  }
  return partes.join(". ") + ".";
}

function extractNegativos(c: Character, formato: FormatoImagem): string {
  const extra = c.visual.negativos?.trim();
  if (!extra) return "";
  if (formato === "midjourney") return `, ${extra}`;
  if (formato === "flux") return `, ${extra}`;
  return `\nAlso avoid: ${extra}`;
}

function labelGenero(g: string): string {
  if (g === "feminino") return "woman";
  if (g === "masculino") return "man";
  return "non-binary person";
}
function labelTraco(t: string): string {
  const map: Record<string, string> = {
    realista: "fully photorealistic, no stylization",
    editorial: "editorial fashion photography feel",
    anime: "anime-inspired features but photoreal rendering",
    manhwa: "manhwa-inspired features but photoreal rendering",
    concept: "concept art influence but photoreal rendering",
    "3d": "stylized 3D character, Pixar/AAA game polish",
    proprio: "custom style defined by the user fields",
  };
  return map[t] ?? t;
}
