/**
 * Rate limit em memória por IP: janela deslizante de 1 minuto.
 * Reinicia a cada deploy — v2 pragmático; fase 3 pode trocar por Upstash.
 */

const PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 10);

const buckets = new Map<string, number[]>();

export function allow(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const windowStart = now - 60_000;
  const prev = (buckets.get(ip) ?? []).filter((t) => t > windowStart);
  if (prev.length >= PER_MINUTE) {
    const retryAfter = Math.ceil((prev[0] + 60_000 - now) / 1000);
    buckets.set(ip, prev);
    return { ok: false, retryAfter };
  }
  prev.push(now);
  buckets.set(ip, prev);
  return { ok: true };
}

export function readIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "unknown"
  );
}
