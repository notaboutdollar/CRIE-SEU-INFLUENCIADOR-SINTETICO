import { describe, expect, it } from "vitest";
import { emptyCharacter } from "@/lib/defaults";
import {
  buildAllImagePrompts,
  buildImagePrompt,
  extractDescricaoVisual,
} from "./gerar-imagem";

function sampleCharacter() {
  const c = emptyCharacter();
  c.identidade.nome = "Lila Serafina";
  c.identidade.genero = "feminino";
  c.identidade.forma = "humano";
  c.identidade.idadeAparente = "28 anos";
  c.visual.traco = "realista";
  c.visual.cabelo = "Cacheado cor cobre, altura dos ombros";
  c.visual.pele = "Pele quente com sardas no nariz";
  c.visual.olhos = "Castanhos, levemente puxados";
  c.visual.roupa = "Oversize vintage colorido";
  c.visual.acessorios = "Óculos redondo, anéis grandes";
  c.visual.tracosMarcantes = "Tatuagem floral no antebraço";
  c.visual.paleta = "Terracota, bege, verde-oliva";
  c.visual.negativos = "logotipos, texto, cenário corporativo";
  c.soul.adjetivos = ["debochada", "generosa", "teimosa"];
  return c;
}

describe("buildImagePrompt", () => {
  it("os 3 formatos sempre têm o nome do personagem", () => {
    const c = sampleCharacter();
    for (const f of ["neutro", "midjourney", "flux"] as const) {
      expect(buildImagePrompt(c, f)).toContain("Lila Serafina");
    }
  });

  it("não deixa placeholders por substituir", () => {
    const c = sampleCharacter();
    for (const f of ["neutro", "midjourney", "flux"] as const) {
      expect(buildImagePrompt(c, f)).not.toMatch(/\{\{.*?\}\}/);
    }
  });

  it("inclui cabelo, roupa, paleta e tatuagem", () => {
    const p = buildImagePrompt(sampleCharacter(), "neutro");
    expect(p).toContain("Cacheado cor cobre");
    expect(p).toContain("Oversize vintage colorido");
    expect(p).toContain("Terracota, bege, verde-oliva");
    expect(p).toContain("Tatuagem floral no antebraço");
  });

  it("Midjourney traz as flags --ar, --style raw, --v e --no", () => {
    const p = buildImagePrompt(sampleCharacter(), "midjourney");
    expect(p).toMatch(/--ar\s/);
    expect(p).toContain("--style raw");
    expect(p).toMatch(/--v\s/);
    expect(p).toContain("--no ");
  });

  it("Flux separa Positive e Negative", () => {
    const p = buildImagePrompt(sampleCharacter(), "flux");
    expect(p).toContain("Positive:");
    expect(p).toContain("Negative:");
  });

  it("negativos extras da ficha entram no bloco Avoid/Negative", () => {
    const p = buildImagePrompt(sampleCharacter(), "neutro");
    expect(p).toContain("Also avoid: logotipos, texto, cenário corporativo");
  });

  it("não quebra quando a ficha está vazia", () => {
    const c = emptyCharacter();
    const p = buildImagePrompt(c, "neutro");
    expect(p).toContain("the character");
    expect(p).toContain("no visual details provided yet");
    expect(p).not.toMatch(/\{\{.*?\}\}/);
  });

  it("forma != humano aparece explicitamente", () => {
    const c = emptyCharacter();
    c.identidade.nome = "Vulpes";
    c.identidade.forma = "animal";
    const d = extractDescricaoVisual(c, "neutro");
    expect(d).toContain("animal form");
  });
});

describe("buildAllImagePrompts", () => {
  it("retorna os 3 formatos, cada um com nome e descrição curta", () => {
    const list = buildAllImagePrompts(sampleCharacter());
    expect(list.map((p) => p.formato)).toEqual(["neutro", "midjourney", "flux"]);
    for (const p of list) {
      expect(p.nome).toBeTruthy();
      expect(p.descricaoCurta.length).toBeGreaterThan(10);
      expect(p.prompt).toContain("Lila Serafina");
    }
  });
});
