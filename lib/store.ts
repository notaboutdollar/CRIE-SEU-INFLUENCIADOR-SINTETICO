"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "./types";
import { duplicateCharacter, emptyCharacter, hydrate } from "./defaults";
import { writePath } from "./paths";

type Updater = (c: Character) => void;

export interface Suggestion {
  fieldId: string;
  valor: unknown;
  origem: "contexto" | "suposicao";
}

interface State {
  characters: Character[];
  createCharacter: () => string;
  deleteCharacter: (id: string) => void;
  duplicate: (id: string) => string | null;
  update: (id: string, mutate: Updater) => void;
  rename: (id: string, nome: string) => void;
  get: (id: string) => Character | undefined;

  // v2 — sugestões / cadeado / histórico
  applySuggestions: (id: string, suggestions: Suggestion[], label: string) => void;
  confirmSuggestion: (id: string, fieldId: string) => void;
  confirmAllSuggestions: (id: string) => void;
  dropSuggestion: (id: string, fieldId: string) => void;
  toggleLock: (id: string, fieldId: string) => void;
  snapshotHistory: (id: string, label: string) => void;
  undoLast: (id: string) => void;
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

      applySuggestions: (id, suggestions, label) => {
        get().snapshotHistory(id, label);
        get().update(id, (c) => {
          for (const s of suggestions) {
            if (c._locks.includes(s.fieldId)) continue;
            writePath(c as unknown as Record<string, unknown>, s.fieldId, s.valor);
            c._suggestions[s.fieldId] = s.origem;
          }
        });
      },
      confirmSuggestion: (id, fieldId) =>
        get().update(id, (c) => {
          delete c._suggestions[fieldId];
        }),
      confirmAllSuggestions: (id) =>
        get().update(id, (c) => {
          c._suggestions = {};
        }),
      dropSuggestion: (id, fieldId) =>
        get().update(id, (c) => {
          delete c._suggestions[fieldId];
        }),
      toggleLock: (id, fieldId) =>
        get().update(id, (c) => {
          c._locks = c._locks.includes(fieldId)
            ? c._locks.filter((f) => f !== fieldId)
            : [...c._locks, fieldId];
        }),
      snapshotHistory: (id, label) =>
        get().update(id, (c) => {
          const { _history, ...rest } = c;
          void _history;
          c._history = [
            { at: Date.now(), label, snapshot: JSON.parse(JSON.stringify(rest)) },
            ...c._history,
          ].slice(0, 3);
        }),
      undoLast: (id) => {
        const c = get().characters.find((x) => x.id === id);
        if (!c || c._history.length === 0) return;
        const [head, ...rest] = c._history;
        set({
          characters: get().characters.map((x) =>
            x.id === id
              ? ({ ...head.snapshot, _history: rest, updatedAt: Date.now() } as Character)
              : x
          ),
        });
      },
    }),
    {
      name: "cis.characters.v1",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Migra personagens antigos (fase 1) para o novo schema sem crashar.
        state.characters = state.characters.map((c) => hydrate(c));
      },
    }
  )
);
