"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "./types";
import { duplicateCharacter, emptyCharacter } from "./defaults";

type Updater = (c: Character) => void;

interface State {
  characters: Character[];
  createCharacter: () => string;
  deleteCharacter: (id: string) => void;
  duplicate: (id: string) => string | null;
  update: (id: string, mutate: Updater) => void;
  rename: (id: string, nome: string) => void;
  get: (id: string) => Character | undefined;
}

export const useCharacters = create<State>()(
  persist(
    (set, get) => ({
      characters: [],
      createCharacter: () => {
        const c = emptyCharacter();
        set({ characters: [c, ...get().characters] });
        return c.id;
      },
      deleteCharacter: (id) =>
        set({ characters: get().characters.filter((c) => c.id !== id) }),
      duplicate: (id) => {
        const found = get().characters.find((c) => c.id === id);
        if (!found) return null;
        const copy = duplicateCharacter(found);
        set({ characters: [copy, ...get().characters] });
        return copy.id;
      },
      update: (id, mutate) => {
        const list = get().characters.map((c) => {
          if (c.id !== id) return c;
          const next = JSON.parse(JSON.stringify(c)) as Character;
          mutate(next);
          next.updatedAt = Date.now();
          return next;
        });
        set({ characters: list });
      },
      rename: (id, nome) =>
        get().update(id, (c) => {
          c.identidade.nome = nome;
        }),
      get: (id) => get().characters.find((c) => c.id === id),
    }),
    { name: "cis.characters.v1" }
  )
);
