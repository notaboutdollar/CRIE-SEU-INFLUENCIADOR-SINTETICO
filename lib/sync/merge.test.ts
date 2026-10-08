import { describe, expect, it } from "vitest";
import { emptyCharacter } from "@/lib/defaults";
import type { Character } from "@/lib/types";
import { mergeCharacters } from "./merge";

function char(id: string, updatedAt: number, nome = id): Character {
  const c = emptyCharacter();
  c.id = id;
  c.updatedAt = updatedAt;
  c.identidade.nome = nome;
  return c;
}

describe("mergeCharacters", () => {
  it("nunca descarta personagens que só existem localmente", () => {
    const { merged, toUpload } = mergeCharacters([char("a", 1)], []);
    expect(merged.map((c) => c.id)).toEqual(["a"]);
    expect(toUpload.has("a")).toBe(true);
  });

  it("nunca descarta personagens que só existem no banco", () => {
    const { merged, toUpload } = mergeCharacters([], [char("b", 1)]);
    expect(merged.map((c) => c.id)).toEqual(["b"]);
    expect(toUpload.size).toBe(0);
  });

  it("mantém a versão local quando ela é mais nova e marca para subir", () => {
    const { merged, toUpload } = mergeCharacters(
      [char("a", 200, "local novo")],
      [char("a", 100, "banco velho")]
    );
    expect(merged[0].identidade.nome).toBe("local novo");
    expect(toUpload.has("a")).toBe(true);
  });

  it("usa a versão do banco quando ela é mais nova", () => {
    const { merged, toUpload } = mergeCharacters(
      [char("a", 100, "local velho")],
      [char("a", 200, "banco novo")]
    );
    expect(merged[0].identidade.nome).toBe("banco novo");
    expect(toUpload.has("a")).toBe(false);
  });

  it("não duplica personagens presentes nos dois lados", () => {
    const { merged } = mergeCharacters(
      [char("a", 1), char("b", 1)],
      [char("a", 1), char("c", 1)]
    );
    expect(merged.map((c) => c.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("preenche imagens que faltam na versão vencedora com as do outro lado", () => {
    const local = char("a", 200);
    local.visual.referencias = [{ id: "r1", name: "x.png", dataUrl: "", size: 1 }];
    const remote = char("a", 100);
    remote.visual.referencias = [{ id: "r1", name: "x.png", dataUrl: "data:image/png;base64,AAA", size: 1 }];
    const { merged } = mergeCharacters([local], [remote]);
    expect(merged[0].visual.referencias[0].dataUrl).toBe("data:image/png;base64,AAA");
  });
});
