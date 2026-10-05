"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCharacters } from "@/lib/store";
import {
  deleteRemote,
  listRemote,
  upsertRemote,
} from "@/lib/sync/supabaseSync";
import type { Character } from "@/lib/types";

/**
 * Mantém o store Zustand em sync com Supabase enquanto o usuário está
 * logado.
 *
 *  - Ao logar: os personagens que já estavam no localStorage (modo
 *    anônimo) são anexados definitivamente à conta — nunca escondidos.
 *    São enviados ao Supabase junto com os que já existiam no banco.
 *  - Ao sair: a conta e o navegador já estão sincronizados, então volta
 *    pro estado anônimo vazio (os dados continuam na conta).
 *  - Ao editar/criar/excluir enquanto logado: espelha no Supabase.
 */
export function CharactersSyncer() {
  const { user } = useAuth();
  const characters = useCharacters((s) => s.characters);
  const previousUser = useRef<string | null | undefined>(user?.id);
  const hydrating = useRef(false);
  const lastSerialized = useRef<string>("");

  // Fase 1: mescla ao logar, limpa ao deslogar.
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId === previousUser.current) return;

    if (currentId && !previousUser.current) {
      hydrating.current = true;
      void listRemote().then((remote) => {
        const local = useCharacters.getState().characters;
        const remoteIds = new Set(remote.map((c) => c.id));
        const localOnly = local.filter((c) => !remoteIds.has(c.id));
        const merged = [...localOnly, ...remote];
        useCharacters.setState({ characters: merged });
        lastSerialized.current = JSON.stringify(merged);
        hydrating.current = false;
        if (localOnly.length > 0) {
          void upsertRemote(localOnly);
        }
      });
    } else if (!currentId && previousUser.current) {
      hydrating.current = true;
      useCharacters.setState({ characters: [] });
      lastSerialized.current = "[]";
      hydrating.current = false;
    }

    previousUser.current = currentId;
  }, [user]);

  // Fase 2: escreve mudanças no Supabase quando logado.
  useEffect(() => {
    if (!user?.id) {
      lastSerialized.current = JSON.stringify(characters);
      return;
    }
    if (hydrating.current) return;

    const serialized = JSON.stringify(characters);
    if (serialized === lastSerialized.current) return;

    // Diff mínimo: compara ids anteriores vs atuais para detectar exclusões.
    let prevIds: string[] = [];
    try {
      prevIds = (JSON.parse(lastSerialized.current || "[]") as Character[])
        .map((c) => c.id)
        .filter(Boolean);
    } catch {
      prevIds = [];
    }
    const currentIds = new Set(characters.map((c) => c.id));
    const removed = prevIds.filter((id) => !currentIds.has(id));
    lastSerialized.current = serialized;

    void (async () => {
      await upsertRemote(characters);
      for (const id of removed) await deleteRemote(id);
    })();
  }, [characters, user]);

  return null;
}
