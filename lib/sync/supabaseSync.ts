"use client";

import { getBrowserClient } from "@/lib/supabase/client";
import type { Character } from "@/lib/types";

/**
 * Camada de persistência pra Supabase. O store continua sendo a fonte
 * da verdade em memória; estes helpers são chamados por um syncer que
 * roda no cliente quando há usuário logado.
 */
export async function listRemote(): Promise<Character[]> {
  const supabase = getBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("characters")
    .select("id, data")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[sync] listRemote:", error.message);
    return [];
  }
  const rows = (data ?? []) as Array<{ id: string; data: Character | null }>;
  return rows
    .map((row) => row.data as Character)
    .filter((c): c is Character => !!c && !!c.id);
}

export async function upsertRemote(characters: Character[]): Promise<void> {
  const supabase = getBrowserClient();
  if (!supabase || !characters.length) return;
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return;
  const rows = characters.map((c) => ({
    id: c.id,
    user_id: userId,
    data: c,
    updated_at: new Date(c.updatedAt).toISOString(),
  }));
  const { error } = await supabase.from("characters").upsert(rows);
  if (error) console.error("[sync] upsertRemote:", error.message);
}

export async function deleteRemote(id: string): Promise<void> {
  const supabase = getBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) console.error("[sync] deleteRemote:", error.message);
}
