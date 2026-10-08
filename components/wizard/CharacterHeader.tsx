"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Character } from "@/lib/types";
import { status } from "@/lib/completion";
import { StatusBadge } from "./StatusBadge";
import { SyncBadge } from "@/components/sync/SyncBadge";

export function CharacterHeader({ character: c }: { character: Character }) {
  const nome = c.identidade.nome || "Sem nome";
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/app"
          className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-line-strong bg-panel hover:bg-card text-ink shrink-0 transition"
          aria-label="Voltar para a lista"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="display text-2xl sm:text-3xl truncate text-ink uppercase">{nome}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge status={status(c)} />
            <SyncBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
