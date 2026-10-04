/**
 * Flag global: a autenticação está configurada neste deploy?
 *
 * Sem SUPABASE_URL/ANON_KEY, o app continua rodando no modo anônimo
 * (localStorage apenas) e o botão "Entrar" na nav fica escondido.
 * Com elas, aparece login Google + magic link e a conta tem seus
 * próprios personagens no banco.
 */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
export const AUTH_ENABLED = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
