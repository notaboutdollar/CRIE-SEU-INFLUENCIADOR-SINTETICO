import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Callback do OAuth / magic link.
 * Supabase redireciona pra cá com `?code=...`; a gente troca por uma sessão
 * via cookies e manda a pessoa pra home.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const supabase = await getServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/", url.origin));
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, url.origin)
      );
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
