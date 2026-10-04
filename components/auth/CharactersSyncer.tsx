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
 * Comportamento combinado com o user:
 *  - Ao logar: a conta começa com os personagens que ela já tem no banco.
 *    Os personagens que estavam no localStorage SOMEM da visão de "Seus
 *    Personagens" (o store é substituído pelo que veio do banco). Eles
 *    continuam fisicamente no localStorage pra quando sair.
 *  - Ao sair: volta o estado anônimo que estava no localStorage antes
 *    do login.
 *  - Ao editar/criar/excluir enquanto logado: espelha no Supabase.
 */
export function CharactersSyncer() {
  const { user } = useAuth();
  const characters = useCharacters((s) => s.characters);
  const previousUser = useRef<string | null | undefined>(user?.id);
  const anonSnapshot = useRef<Character[] | null>(null);
  const hydrating = useRef(false);
  const lastSerialized = useRef<string>("");

  // Fase 1: hidrata/limpa o store nas transições anônimo <-> logado.
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId === previousUser.current) return;

    const store = useCharacters.getState();

    if (currentId && !previousUser.current) {
      // Login: guarda o estado anônimo e carrega remoto.
      anonSnapshot.current = store.characters;
      hydrating.current = true;
      void listRemote().then((remote) => {
        useCharacters.setState({ characters: remote });
        lastSerialized.current = JSON.stringify(remote);
        hydrating.current = false;
      });
    } else if (!currentId && previousUser.current) {
      // Logout: devolve o estado anônimo que estava antes do login.
      hydrating.current = true;
      useCharacters.setState({ characters: anonSnapshot.current ?? [] });
      lastSerialized.current = JSON.stringify(anonSnapshot.current ?? []);
      anonSnapshot.current = null;
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
