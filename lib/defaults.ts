import { nanoid } from "nanoid";
import type { Character } from "./types";

export function emptyCharacter(): Character {
  const now = Date.now();
  return {
    id: nanoid(10),
    createdAt: now,
    updatedAt: now,
    identidade: { nome: "" },
    visual: { referencias: [] },
    soul: {
      adjetivos: [],
      gostos: {
        comidas: [],
        musicas: [],
        hobbies: [],
        marcas: [],
        lugares: [],
        series: [],
      },
      odeia: { manias: [], conteudos: [], comportamentos: [], assuntos: [] },
      reacoes: {},
    },
    nicho: {
      performaFormatos: [],
      concorrentes: [],
      plataformas: [],
      pilares: [],
    },
    voz: {
      tomFormalidade: 50,
      tomHumor: 50,
      tomComplexidade: 50,
      girias: [],
      bordoes: [],
      proibidas: [],
      emoji: "pouco",
      tamanhoFrase: "medias",
      exemplos: [],
    },
    monetizacao: { modelos: [], marcasOk: [], marcasNao: [] },
  };
}

export function duplicateCharacter(c: Character): Character {
  const copy = JSON.parse(JSON.stringify(c)) as Character;
  copy.id = nanoid(10);
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.identidade.nome = c.identidade.nome ? `${c.identidade.nome} (cópia)` : "";
  return copy;
}
