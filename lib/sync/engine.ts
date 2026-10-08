"use client";

import { useCharacters } from "@/lib/store";
import { hydrate } from "@/lib/defaults";
import { listRemote, upsertOne } from "./supabaseSync";
import { mergeCharacters } from "./merge";
import { useSyncStatus, type SyncStatus } from "./status";

/**
 * Sincronização store ↔ Supabase.
 *
 *  - Ao logar (ou abrir o site já logado): baixa o banco e mescla com o que
 *    está no navegador; por personagem, vence a edição mais recente.
 *  - Depois disso, cada personagem alterado (updatedAt diferente do último
 *    salvo com sucesso) sobe sozinho, com debounce e retry em caso de erro.
 *  - Nada é apagado do banco aqui: exclusão só acontece pelo deleteCharacter.
 *  - Ao sair: os personagens continuam no navegador.
 */

const DEBOUNCE_MS = 800;
const MIN_RETRY_MS = 2_000;
const MAX_RETRY_MS = 60_000;

let activeUser: string | null = null;
let generation = 0;
let ready = false;
let flushing = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let retryMs = MIN_RETRY_MS;
/** id → updatedAt da última versão confirmada no banco. */
const synced = new Map<string, number>();

function setStatus(status: SyncStatus, error: string | null = null) {
  useSyncStatus.getState().set(status, error);
}

function isDirty(id: string, updatedAt: number) {
  return synced.get(id) !== updatedAt;
}

export function setSyncUser(uid: string | null) {
  if (uid === activeUser) return;
  activeUser = uid;
  generation += 1;
  ready = false;
  synced.clear();
  if (timer) clearTimeout(timer);
  timer = null;
  if (!uid) {
    setStatus("local");
    return;
  }
  void loadRemote(uid, generation, MIN_RETRY_MS);
}

async function loadRemote(uid: string, gen: number, delay: number) {
  setStatus("loading");
  const r = await listRemote();
  if (gen !== generation) return;
  if (!r.ok) {
    // Sem saber o que há no banco, não sobe nada (poderia sobrescrever
    // edições feitas em outro aparelho). Tenta de novo.
    setStatus("error", r.error);
    setTimeout(() => {
      if (gen === generation) void loadRemote(uid, gen, Math.min(delay * 2, MAX_RETRY_MS));
    }, delay);
    return;
  }
  const { merged, toUpload } = mergeCharacters(
    useCharacters.getState().characters,
    r.data.map(hydrate)
  );
  for (const c of merged) {
    if (!toUpload.has(c.id)) synced.set(c.id, c.updatedAt);
  }
  useCharacters.setState({ characters: merged });
  ready = true;
  schedule(0);
}

function schedule(ms: number) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, ms);
}

async function flush() {
  const uid = activeUser;
  const gen = generation;
  if (!uid || !ready) return;
  if (flushing) {
    schedule(300);
    return;
  }
  const dirty = useCharacters
    .getState()
    .characters.filter((c) => isDirty(c.id, c.updatedAt))
    .map((c) => c.id);
  if (!dirty.length) {
    setStatus("saved");
    return;
  }

  flushing = true;
  setStatus("saving");
  let error: string | null = null;
  for (const id of dirty) {
    // Sempre a versão mais atual; se foi excluído no meio do caminho, pula.
    const c = useCharacters.getState().characters.find((x) => x.id === id);
    if (!c) continue;
    const sentAt = c.updatedAt;
    const r = await upsertOne(c, uid);
    if (gen !== generation) {
      flushing = false;
      return;
    }
    if (r.ok) synced.set(id, sentAt);
    else error = r.error;
  }
  flushing = false;

  if (error) {
    setStatus("error", error);
    schedule(retryMs);
    retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    return;
  }
  retryMs = MIN_RETRY_MS;
  const stillDirty = useCharacters.getState().characters.some((c) => isDirty(c.id, c.updatedAt));
  if (stillDirty) schedule(DEBOUNCE_MS);
  else setStatus("saved");
}

/** Chamado a cada mudança no store. */
export function notifySyncChange() {
  if (activeUser && ready) schedule(DEBOUNCE_MS);
}

/** Força o envio imediato (ex.: aba sendo fechada). */
export function flushSyncNow() {
  if (!activeUser || !ready) return;
  if (timer) clearTimeout(timer);
  timer = null;
  void flush();
}
