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
      regrasConsistencia: [],
    },
    nicho: {
      performaFormatos: [],
      concorrentes: [],
      plataformas: [],
      ideiasConteudo: [],
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
    pontosEmAberto: [],
    _suggestions: {},
    _locks: [],
    _history: [],
  };
}

export function duplicateCharacter(c: Character): Character {
  const copy = JSON.parse(JSON.stringify(c)) as Character;
  copy.id = nanoid(10);
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.identidade.nome = c.identidade.nome ? `${c.identidade.nome} (cópia)` : "";
  // Ids próprios: imagens são guardadas por id no IndexedDB, e excluir a
  // cópia não pode apagar as imagens do original.
  copy.visual.referencias = copy.visual.referencias.map((r) => ({ ...r, id: nanoid(8) }));
  copy._suggestions = {};
  copy._locks = [];
  copy._history = [];
  return copy;
}

/**
 * Migração defensiva: personagens antigos (localStorage) ou vindos do banco
 * podem não ter todos os campos. Garante que ninguém crashe ao ler um objeto
 * incompleto.
 */
export function hydrate(c: Character): Character {
  const base = emptyCharacter();
  const src = (c ?? {}) as Partial<Character>;
  return {
    ...base,
    ...src,
    id: src.id ?? base.id,
    createdAt: src.createdAt ?? base.createdAt,
    updatedAt: src.updatedAt ?? src.createdAt ?? 0,
    identidade: { ...base.identidade, ...src.identidade },
    visual: { ...base.visual, ...src.visual, referencias: src.visual?.referencias ?? [] },
    soul: {
      ...base.soul,
      ...src.soul,
      adjetivos: src.soul?.adjetivos ?? [],
      gostos: { ...base.soul.gostos, ...src.soul?.gostos },
      odeia: { ...base.soul.odeia, ...src.soul?.odeia },
      reacoes: src.soul?.reacoes ?? {},
      regrasConsistencia: src.soul?.regrasConsistencia ?? [],
    },
    nicho: {
      ...base.nicho,
      ...src.nicho,
      ideiasConteudo: src.nicho?.ideiasConteudo ?? [],
    },
    voz: { ...base.voz, ...src.voz },
    monetizacao: { ...base.monetizacao, ...src.monetizacao },
    pontosEmAberto: src.pontosEmAberto ?? [],
    _suggestions: src._suggestions ?? {},
    _locks: src._locks ?? [],
    _history: src._history ?? [],
  };
}
