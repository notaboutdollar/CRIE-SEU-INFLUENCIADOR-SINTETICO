"use client";

import { createBrowserClient } from "@supabase/ssr";
import { AUTH_ENABLED, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!AUTH_ENABLED) return null;
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}
