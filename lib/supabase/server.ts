import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cliente Supabase para Route Handlers / Server Components (lê e escreve
 * cookies via next/headers). Retorna null se o deploy não estiver com
 * credenciais Supabase (modo anônimo).
 */
export async function getServerClient() {
  if (!AUTH_ENABLED) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(entries) {
        try {
          for (const { name, value, options } of entries) {
            store.set(name, value, options);
          }
        } catch {
          // chamadas em contextos readonly (Server Components) são ignoradas
        }
      },
    },
  });
}
