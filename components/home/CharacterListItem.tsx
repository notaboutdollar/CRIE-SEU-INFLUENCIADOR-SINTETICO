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
    <div className="group relative rounded-2xl overflow-hidden border border-line bg-panel hover:border-line-strong transition">
      <Link href={`/app/personagem/${c.id}`} className="block">
        <div className="relative aspect-[4/3] bg-bg border-b border-line flex items-center justify-center overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          ) : (
            <span className="text-6xl opacity-40">{emoji}</span>
          )}
          <div className="absolute top-3 left-3">
            <StatusBadge status={status(c)} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="display text-base uppercase truncate text-ink">{nome}</h3>
          <p className="text-[13px] text-ink-mute line-clamp-2 mt-1 leading-relaxed">
            {c.identidade.bio || c.nicho.promessa || "Sem bio ainda."}
          </p>
          <div className="eyebrow mt-3">
            Atualizado {relativo(c.updatedAt)}
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
        <button
          type="button"
          onClick={() => duplicate(c.id)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-bg/80 backdrop-blur border border-line text-ink-mute hover:text-ink hover:border-ink transition"
          aria-label="Duplicar"
          title="Duplicar"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) del(c.id);
          }}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-bg/80 backdrop-blur border border-line text-ink-mute hover:text-pink hover:border-pink transition"
          aria-label="Excluir"
          title="Excluir"
        >
          <Trash2 className="w-3.5 h-3.5" />
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
