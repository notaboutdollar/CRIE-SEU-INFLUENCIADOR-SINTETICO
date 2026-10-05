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

export function CharactersSyncer() {
  const { user } = useAuth();
  const characters = useCharacters((s) => s.characters);
  const previousUser = useRef<string | null | undefined>(user?.id);
  const anonSnapshot = useRef<Character[] | null>(null);
  const hydrating = useRef(false);
  const lastSerialized = useRef<string>("");

  useEffect(() => {
    const currentId = user?.id ?? null;
    if (currentId === previousUser.current) return;

    const store = useCharacters.getState();

    if (currentId && !previousUser.current) {
      anonSnapshot.current = store.characters;
      hydrating.current = true;
      void listRemote().then((remote) => {
        const local = useCharacters.getState().characters;
        const remoteIds = new Set(remote.map((c) => c.id));
        const newLocal = local.filter((c) => !remoteIds.has(c.id) && !anonSnapshot.current?.some((a) => a.id === c.id));
        const merged = [...newLocal, ...remote];
        useCharacters.setState({ characters: merged });
        lastSerialized.current = JSON.stringify(merged);
        hydrating.current = false;
        if (newLocal.length > 0) {
          void upsertRemote(newLocal);
        }
      });
    } else if (!currentId && previousUser.current) {
      hydrating.current = true;
      useCharacters.setState({ characters: anonSnapshot.current ?? [] });
      lastSerialized.current = JSON.stringify(anonSnapshot.current ?? []);
      anonSnapshot.current = null;
      hydrating.current = false;
    }

    previousUser.current = currentId;
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      lastSerialized.current = JSON.stringify(characters);
      return;
    }
    if (hydrating.current) return;

    const serialized = JSON.stringify(characters);
    if (serialized === lastSerialized.current) return;

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
