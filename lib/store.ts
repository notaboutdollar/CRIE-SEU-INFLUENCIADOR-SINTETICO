"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character } from "./types";
import { duplicateCharacter, emptyCharacter, hydrate } from "./defaults";
import { readPath, writePath } from "./paths";
import { deleteImageData, loadManyImages, saveImageData } from "./image-db";
import { deleteRemote } from "./sync/supabaseSync";

const STORE_KEY = "cis.characters.v1";

/**
 * Versões antigas guardavam as imagens em base64 dentro do localStorage, o
 * que estourava memória. Antes de removê-las de lá, move cada uma para o
 * IndexedDB — nenhuma imagem é descartada.
 */
let legacyImagesMigrated: Promise<void> = Promise.resolve();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw && raw.includes('"dataUrl":"data:')) {
      const found = new Map<string, string>();
      const re = /"id":"([^"]+)","name":"(?:[^"\\]|\\.)*","dataUrl":"(data:[^"]*)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(raw))) {
        if (!found.has(m[1])) found.set(m[1], m[2]);
      }
      localStorage.setItem(
        STORE_KEY,
        raw.replace(/"dataUrl":"data:[^"]*"/g, '"dataUrl":""')
      );
      legacyImagesMigrated = Promise.all(
        [...found].map(([id, url]) => saveImageData(id, url).catch(() => {}))
      ).then(() => {});
    }
  } catch {}
}

/** Imagens que sabemos estar no IndexedDB (id → dataUrl), para não regravar à toa. */
const imagesInDb = new Map<string, string>();

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

function cloneCharacter(c: Character): Character {
  const next = JSON.parse(
    JSON.stringify(c, (k, v) => (k === "dataUrl" ? undefined : v))
  ) as Character;
  for (const ref of next.visual.referencias) {
    const orig = c.visual.referencias.find((r) => r.id === ref.id);
    if (orig?.dataUrl) ref.dataUrl = orig.dataUrl;
  }
  return next;
}

function mutateCharacter(
  list: Character[],
  id: string,
  mutate: Updater
): Character[] {
  return list.map((c) => {
    if (c.id !== id) return c;
    const next = cloneCharacter(c);
    mutate(next);
    next.updatedAt = Date.now();
    return next;
  });
}

function mutateWithAutoConfirm(
  list: Character[],
  id: string,
  mutate: Updater
): Character[] {
  return list.map((c) => {
    if (c.id !== id) return c;
    const next = cloneCharacter(c);
    mutate(next);
    next.updatedAt = Date.now();
    for (const fieldId of Object.keys(next._suggestions)) {
      const before = JSON.stringify(readPath(c as unknown, fieldId));
      const after = JSON.stringify(readPath(next as unknown, fieldId));
      if (before !== after) delete next._suggestions[fieldId];
    }
    return next;
  });
}

function rehydrateImages(state: State) {
  const ids = state.characters.flatMap((c) =>
    c.visual.referencias.map((r) => r.id)
  );
  if (ids.length === 0) return;
  loadManyImages(ids).then((map) => {
    for (const [id, url] of map) imagesInDb.set(id, url);
    if (map.size === 0) return;
    useCharacters.setState((prev) => ({
      characters: prev.characters.map((c) => {
        const touched = c.visual.referencias.some((r) => map.has(r.id) && !r.dataUrl);
        if (!touched) return c;
        return {
          ...c,
          visual: {
            ...c.visual,
            referencias: c.visual.referencias.map((r) =>
              map.has(r.id) ? { ...r, dataUrl: map.get(r.id)! } : r
            ),
          },
        };
      }),
    }));
  });
}

function syncImagesToDb(prev: Character[], next: Character[]) {
  for (const nc of next) {
    const pc = prev.find((c) => c.id === nc.id);
    for (const ref of nc.visual.referencias) {
      // Grava toda imagem nova ou que chegou depois (ex.: vinda do banco).
      if (ref.dataUrl && imagesInDb.get(ref.id) !== ref.dataUrl) {
        imagesInDb.set(ref.id, ref.dataUrl);
        saveImageData(ref.id, ref.dataUrl).catch((e) => console.error("[images] save", e));
      }
    }
    if (pc) {
      for (const pr of pc.visual.referencias) {
        if (!nc.visual.referencias.some((r) => r.id === pr.id)) {
          imagesInDb.delete(pr.id);
          deleteImageData(pr.id).catch(() => {});
        }
      }
    }
  }
  for (const pc of prev) {
    if (!next.some((c) => c.id === pc.id)) {
      for (const ref of pc.visual.referencias) {
        imagesInDb.delete(ref.id);
        deleteImageData(ref.id).catch(() => {});
      }
    }
  }
}

/** Snapshot pro histórico sem as imagens (economiza memória; elas ficam no IndexedDB). */
function snapshotOf(c: Character) {
  const { _history, ...rest } = c;
  void _history;
  return JSON.parse(JSON.stringify(rest, (k, v) => (k === "dataUrl" ? "" : v)));
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
      // Único caminho que remove um personagem do banco: exclusão explícita.
      deleteCharacter: (id) => {
        set({ characters: get().characters.filter((c) => c.id !== id) });
        void deleteRemote(id);
      },
      duplicate: (id) => {
        const found = get().characters.find((c) => c.id === id);
        if (!found) return null;
        const copy = duplicateCharacter(found);
        set({ characters: [copy, ...get().characters] });
        return copy.id;
      },
      update: (id, mutate) => {
        set({ characters: mutateWithAutoConfirm(get().characters, id, mutate) });
      },
      rename: (id, nome) =>
        get().update(id, (c) => {
          c.identidade.nome = nome;
        }),
      get: (id) => get().characters.find((c) => c.id === id),

      applySuggestions: (id, suggestions, label) => {
        // snapshot + apply em uma passagem só, sem auto-confirmar (os próprios
        // writes abaixo é que escrevem os valores novos — eles NÃO podem ser
        // interpretados como "edição do usuário").
        set({
          characters: mutateCharacter(get().characters, id, (c) => {
            c._history = [
              { at: Date.now(), label, snapshot: snapshotOf(c) },
              ...c._history,
            ].slice(0, 3);
            for (const s of suggestions) {
              if (c._locks.includes(s.fieldId)) continue;
              writePath(c as unknown as Record<string, unknown>, s.fieldId, s.valor);
              c._suggestions[s.fieldId] = s.origem;
            }
          }),
        });
      },
      confirmSuggestion: (id, fieldId) =>
        set({
          characters: mutateCharacter(get().characters, id, (c) => {
            delete c._suggestions[fieldId];
          }),
        }),
      confirmAllSuggestions: (id) =>
        set({
          characters: mutateCharacter(get().characters, id, (c) => {
            c._suggestions = {};
          }),
        }),
      dropSuggestion: (id, fieldId) =>
        set({
          characters: mutateCharacter(get().characters, id, (c) => {
            delete c._suggestions[fieldId];
          }),
        }),
      toggleLock: (id, fieldId) =>
        set({
          characters: mutateCharacter(get().characters, id, (c) => {
            c._locks = c._locks.includes(fieldId)
              ? c._locks.filter((f) => f !== fieldId)
              : [...c._locks, fieldId];
          }),
        }),
      snapshotHistory: (id, label) =>
        set({
          characters: mutateCharacter(get().characters, id, (c) => {
            c._history = [
              { at: Date.now(), label, snapshot: snapshotOf(c) },
              ...c._history,
            ].slice(0, 3);
          }),
        }),
      undoLast: (id) => {
        const c = get().characters.find((x) => x.id === id);
        if (!c || c._history.length === 0) return;
        const [head, ...rest] = c._history;
        const restored = hydrate({
          ...head.snapshot,
          id: c.id,
          _history: rest,
          updatedAt: Date.now(),
        } as Character);
        // O snapshot não guarda imagens: reaproveita as que já estão em memória.
        restored.visual.referencias = restored.visual.referencias.map((r) => {
          const cur = c.visual.referencias.find((x) => x.id === r.id);
          return cur?.dataUrl ? { ...r, dataUrl: cur.dataUrl } : r;
        });
        set({
          characters: get().characters.map((x) => (x.id === id ? restored : x)),
        });
        rehydrateImages(get());
      },
    }),
    {
      name: STORE_KEY,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.characters = state.characters.map((c) => hydrate(c));
        void legacyImagesMigrated.then(() => rehydrateImages(useCharacters.getState()));
      },
      partialize: (state) => ({
        ...state,
        characters: state.characters.map((c) => ({
          ...c,
          visual: {
            ...c.visual,
            referencias: c.visual.referencias.map(({ dataUrl: _, ...rest }) => rest),
          },
          _history: c._history.map((h) => ({
            ...h,
            snapshot: {
              ...h.snapshot,
              visual: {
                ...h.snapshot.visual,
                referencias: h.snapshot.visual.referencias.map(
                  ({ dataUrl: _, ...rest }) => rest
                ),
              },
            },
          })),
        })),
      }) as unknown as State,
    }
  )
);

useCharacters.subscribe(
  (state, prev) => {
    if (state.characters !== prev.characters) {
      syncImagesToDb(prev.characters, state.characters);
    }
  }
);
