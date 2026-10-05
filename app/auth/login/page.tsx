"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { AUTH_ENABLED } from "@/lib/supabase/env";

function LoginInner() {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [err, setErr] = useState<string | null>(params?.get("error") ?? null);
  const [enviado, setEnviado] = useState(false);

  async function onGoogle() {
    setLoading("google");
    setErr(null);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(null);
    }
  }

  async function onEmail() {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setErr("Digite um email válido.");
      return;
    }
    setLoading("email");
    setErr(null);
    try {
      const r = await signInWithEmail(trimmed);
      if (r.ok) {
        setEnviado(true);
      } else {
        setErr(r.error ?? "Falha ao enviar o link.");
      }
    } finally {
      setLoading(null);
    }
  }

  if (!AUTH_ENABLED) {
    return (
      <div className="card p-8 text-center">
        <h1 className="display text-xl uppercase">Login não configurado</h1>
        <p className="text-ink-mute text-sm mt-2 leading-relaxed">
          Este deploy ainda não tem Supabase ativo. Pede pro admin preencher
          <code className="mono text-accent mx-1">NEXT_PUBLIC_SUPABASE_URL</code>
          e
          <code className="mono text-accent ml-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
        <Link
          href="/app"
          className="mt-5 inline-flex items-center gap-1.5 text-accent font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8 sm:p-10 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="relative">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-ink-mute hover:text-ink text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="eyebrow-accent mb-2 inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Entrar
        </div>
        <h1 className="display text-2xl sm:text-3xl text-ink uppercase leading-tight">
          Seus personagens, na sua conta.
        </h1>
        <p className="text-ink-mute text-[15px] mt-3 leading-relaxed">
          Com login, cada personagem fica salvo na sua conta e pode ser aberto
          de qualquer dispositivo. Sem login, o app continua funcionando — os
          personagens ficam só neste navegador.
        </p>

        <div className="mt-7 grid gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onGoogle}
            disabled={!!loading}
            className="w-full"
          >
            <GoogleIcon />
            {loading === "google" ? "Abrindo…" : "Entrar com Google"}
          </Button>

          <div className="flex items-center gap-3 text-[11px] mono uppercase tracking-wider text-ink-dim">
            <div className="flex-1 h-px bg-line" />
            ou
            <div className="flex-1 h-px bg-line" />
          </div>

          {enviado ? (
            <div className="rounded-xl border border-ok/30 bg-ok/10 p-4 text-sm text-ok flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Link enviado. Abra seu email ({email}) e clique no link mágico
                pra entrar.
              </div>
            </div>
          ) : (
            <>
              <Field
                label="Email"
                hint="A gente manda um link. Clica nele e tá dentro — sem senha."
              >
                <Input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading === "email"}
                />
              </Field>
              <Button
                variant="accent"
                size="lg"
                onClick={onEmail}
                disabled={!email.trim() || !!loading}
              >
                <Mail className="w-4 h-4" />
                {loading === "email" ? "Enviando…" : "Enviar link mágico"}
              </Button>
            </>
          )}

          {err ? (
            <div className="rounded-xl border border-pink/40 bg-pink/10 px-3.5 py-2.5 text-sm text-pink">
              {err}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-lg px-4 sm:px-6 py-10 sm:py-20">
      <Suspense fallback={null}>
        <LoginInner />
      </Suspense>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
