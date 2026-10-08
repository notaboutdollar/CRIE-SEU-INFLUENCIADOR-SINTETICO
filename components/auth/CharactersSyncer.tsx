"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCharacters } from "@/lib/store";
import { flushSyncNow, notifySyncChange, setSyncUser } from "@/lib/sync/engine";

/** Liga o estado de login e as mudanças do store ao motor de sincronização. */
export function CharactersSyncer() {
  const { user } = useAuth();
  const characters = useCharacters((s) => s.characters);

  // user === null → sessão ainda carregando; não decide nada ainda.
  useEffect(() => {
    if (user === null) return;
    setSyncUser(user?.id ?? null);
  }, [user]);

  useEffect(() => {
    notifySyncChange();
  }, [characters]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushSyncNow();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushSyncNow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushSyncNow);
    };
  }, []);

  return null;
}
