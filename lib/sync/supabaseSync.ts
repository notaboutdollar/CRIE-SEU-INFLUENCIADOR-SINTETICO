"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import { loadImageData } from "@/lib/image-db";
import { COMPRESS_THRESHOLD, compressDataUrl } from "@/lib/image-compress";
import type { Character } from "@/lib/types";

/**
 * Camada de persistência pra Supabase. O store continua sendo a fonte
 * da verdade em memória; estes helpers são chamados pelo CharactersSyncer
 * (upload/listagem) e pelo store (exclusão explícita).
 */

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Ids excluídos nesta sessão — impede que um upload em voo os ressuscite. */
const deletedIds = new Set<string>();

/** Última imagem conhecida no banco, por id da referência. Evita subir uma referência sem imagem por cima de uma que existe. */
const remoteImages = new Map<string, string>();

export async function listRemote(): Promise<Result<Character[]>> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: true, data: [] };
  const { data, error } = await supabase
    .from("characters")
    .select("id, data")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[sync] listRemote:", error);
    return { ok: false, error: error.message };
  }
  const rows = (data ?? []) as Array<{ id: string; data: Character | null }>;
  const chars = rows
    .filter((row) => row.data && typeof row.data === "object")
    .map((row) => ({ ...(row.data as Character), id: row.id }));
  for (const c of chars) {
    for (const r of c.visual?.referencias ?? []) {
      if (r.dataUrl) remoteImages.set(r.id, r.dataUrl);
    }
  }
  return { ok: true, data: chars };
}

async function toRemote(c: Character): Promise<Character> {
  const referencias = await Promise.all(
    c.visual.referencias.map(async (r) => {
      let dataUrl = r.dataUrl;
      if (!dataUrl) dataUrl = (await loadImageData(r.id).catch(() => undefined)) ?? "";
      if (!dataUrl) dataUrl = remoteImages.get(r.id) ?? "";
      if (dataUrl.length > COMPRESS_THRESHOLD) dataUrl = await compressDataUrl(dataUrl);
      if (dataUrl.length > COMPRESS_THRESHOLD) dataUrl = await compressDataUrl(dataUrl, 1200, 0.72);
      if (dataUrl) remoteImages.set(r.id, dataUrl);
      return { ...r, dataUrl };
    })
  );
  return {
    ...c,
    visual: { ...c.visual, referencias },
    // Histórico de desfazer não precisa carregar imagens pro banco.
    _history: (c._history ?? []).map((h) => ({
      ...h,
      snapshot: {
        ...h.snapshot,
        visual: {
          ...h.snapshot.visual,
          referencias: (h.snapshot.visual?.referencias ?? []).map((r) => ({ ...r, dataUrl: "" })),
        },
      },
    })),
  };
}

export async function upsertOne(
  c: Character,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getBrowserClient();
  if (!supabase || deletedIds.has(c.id)) return { ok: true };
  const payload = await toRemote(c);
  if (deletedIds.has(c.id)) return { ok: true };
  const { error } = await supabase.from("characters").upsert({
    id: c.id,
    user_id: userId,
    data: payload,
    updated_at: new Date(c.updatedAt || Date.now()).toISOString(),
  });
  if (error) {
    console.error("[sync] upsert", c.id, error);
    return { ok: false, error: error.message };
  }
  if (deletedIds.has(c.id)) {
    await supabase.from("characters").delete().eq("id", c.id);
  }
  return { ok: true };
}

/** Exclusão explícita (só quando o usuário apaga o personagem). */
export async function deleteRemote(id: string): Promise<void> {
  deletedIds.add(id);
  const supabase = getBrowserClient();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) console.error("[sync] delete", id, error.message);
}
