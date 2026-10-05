"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AUTH_ENABLED } from "@/lib/supabase/env";
import { cn } from "@/lib/cn";

export function AccountMenu() {
  const { user, disabled, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!AUTH_ENABLED || disabled) return null;

  // user === null → ainda carregando (não mostra nada pra não piscar)
  if (user === null) return null;

  if (user === undefined) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-full h-9 px-3.5 text-[12px] bg-transparent text-ink border border-line-strong hover:bg-panel transition"
      >
        Entrar
      </Link>
    );
  }

  const email = user.email ?? "sem email";
  const name = (user.user_metadata?.full_name as string) || email.split("@")[0];
  const avatar = (user.user_metadata?.avatar_url as string) || null;
  const inicial = (name[0] ?? "?").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-line hover:border-line-strong bg-panel transition"
      >
        <span className="h-7 w-7 rounded-full overflow-hidden bg-accent/15 text-accent font-bold text-sm inline-flex items-center justify-center">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            inicial
          )}
        </span>
        <span className="text-[12px] font-semibold text-ink max-w-[160px] truncate">
          {name}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-ink-mute transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-line bg-panel shadow-card overflow-hidden z-30">
          <div className="px-3.5 py-3 border-b border-line">
            <div className="text-[11px] mono uppercase tracking-wider text-ink-dim">Entrou como</div>
            <div className="text-sm font-semibold text-ink truncate">{name}</div>
            <div className="text-[12px] text-ink-mute truncate">{email}</div>
          </div>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push("/");
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-ink-mute hover:text-pink hover:bg-pink/10 transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
