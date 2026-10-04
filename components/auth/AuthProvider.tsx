"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";

interface AuthState {
  /** `null` até terminar a leitura inicial. Depois: User ou undefined (anônimo). */
  user: User | null | undefined;
  session: Session | null | undefined;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  /** Supabase não configurado neste deploy. */
  disabled: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getBrowserClient(), []);
  const [user, setUser] = useState<User | null | undefined>(supabase ? null : undefined);
  const [session, setSession] = useState<Session | null | undefined>(
    supabase ? null : undefined
  );

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then((r: { data: { session: Session | null } }) => {
      if (!active) return;
      setSession(r.data.session ?? undefined);
      setUser(r.data.session?.user ?? undefined);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, s: Session | null) => {
        setSession(s ?? undefined);
        setUser(s?.user ?? undefined);
      }
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      disabled: !supabase,
      signInWithGoogle: async () => {
        if (!supabase) return;
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined;
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });
      },
      signInWithEmail: async (email: string) => {
        if (!supabase) return { ok: false, error: "Supabase não configurado." };
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [supabase, user, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Permite componentes serem usados fora do Provider (ex.: AI_ENABLED=false
    // dev local); retornamos um estado "desligado".
    return {
      user: undefined,
      session: undefined,
      disabled: true,
      signInWithGoogle: async () => {},
      signInWithEmail: async () => ({ ok: false, error: "Auth não disponível." }),
      signOut: async () => {},
    };
  }
  return ctx;
}
