"use client";

import { useCharacters } from "@/lib/store";
import { status } from "@/lib/completion";
import type { Character } from "@/lib/types";
import { Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/wizard/StatusBadge";

interface Props {
  character: Character;
}

const formasEmoji: Record<string, string> = {
  humano: "🧑",
  humanoide: "🤖",
  animal: "🐾",
  criatura: "🐉",
  objeto: "📦",
  abstrato: "◆",
};

export function CharacterListItem({ character: c }: Props) {
  const duplicate = useCharacters((s) => s.duplicate);
  const del = useCharacters((s) => s.deleteCharacter);
  const nome = c.identidade.nome || "Sem nome";
  const avatar = c.visual.referencias[0]?.dataUrl;
  const emoji = c.identidade.forma ? formasEmoji[c.identidade.forma] : "✨";

  return (
    <div className="card card-hover p-4 group relative">
      <Link href={`/personagem/${c.id}`} className="block">
        <div className="flex gap-3 items-start">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-bg border border-line flex items-center justify-center shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{emoji}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="serif text-lg truncate text-ink">{nome}</h3>
              <StatusBadge status={status(c)} />
            </div>
            <p className="text-[14px] text-muted line-clamp-2 mt-0.5 leading-relaxed">
              {c.identidade.bio || c.nicho.promessa || "Sem bio ainda."}
            </p>
            <div className="eyebrow mt-2">
              Atualizado {relativo(c.updatedAt)}
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
        <button
          type="button"
          onClick={() => duplicate(c.id)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-paper border border-line text-muted hover:text-ink hover:border-ink"
          aria-label="Duplicar"
          title="Duplicar"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) del(c.id);
          }}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-paper border border-line text-muted hover:text-warn hover:border-warn/60"
          aria-label="Excluir"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function relativo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}
