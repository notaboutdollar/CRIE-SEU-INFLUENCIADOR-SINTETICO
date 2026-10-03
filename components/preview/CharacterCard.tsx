"use client";

import type { Character } from "@/lib/types";
import { status } from "@/lib/completion";
import { StatusBadge } from "@/components/wizard/StatusBadge";
import { Sparkles } from "lucide-react";

const formasEmoji: Record<string, string> = {
  humano: "🧑",
  humanoide: "🤖",
  animal: "🐾",
  criatura: "🐉",
  objeto: "📦",
  abstrato: "◆",
};

export function CharacterCard({ character: c }: { character: Character }) {
  const nome = c.identidade.nome || "Sem nome";
  const avatar = c.visual.referencias[0]?.dataUrl;
  const emoji = c.identidade.forma ? formasEmoji[c.identidade.forma] : "✨";

  return (
    <div className="card p-5 sticky top-6">
      <div className="eyebrow mb-3">Pré-visualização</div>

      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-bg border border-line mb-4 flex items-center justify-center">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={`Referência de ${nome}`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl opacity-50">{emoji}</div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status(c)} />
        </div>
      </div>

      <h2 className="display text-lg uppercase truncate text-ink">{nome}</h2>
      <div className="flex flex-wrap gap-1.5 mt-2 text-[11px]">
        {c.identidade.genero ? <Tag>{labelGenero(c.identidade.genero)}</Tag> : null}
        {c.identidade.forma ? <Tag>{labelForma(c.identidade.forma)}</Tag> : null}
        {c.identidade.idadeAparente ? <Tag>{c.identidade.idadeAparente}</Tag> : null}
        {c.identidade.cidade ? <Tag>{c.identidade.cidade}</Tag> : null}
      </div>

      {c.identidade.bio ? (
        <p className="mt-3 text-[14px] text-ink/80 leading-relaxed line-clamp-3 italic">
          “{c.identidade.bio}”
        </p>
      ) : (
        <p className="mt-3 text-[13px] text-ink-dim italic">
          A bio de 1 linha aparece aqui.
        </p>
      )}

      {c.soul.adjetivos.length ? (
        <div className="mt-4">
          <div className="eyebrow mb-1.5">Vibe</div>
          <div className="flex flex-wrap gap-1.5">
            {c.soul.adjetivos.slice(0, 6).map((a) => (
              <span
                key={a}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-accent"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {c.nicho.principal ? (
        <div className="mt-4 flex items-start gap-2 pt-4 border-t border-line">
          <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <div className="font-semibold text-ink">{c.nicho.principal}</div>
            {c.nicho.promessa ? (
              <div className="text-[13px] text-ink-mute mt-0.5">{c.nicho.promessa}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-line bg-panel text-ink-mute font-medium">
      {children}
    </span>
  );
}

function labelGenero(g: string) {
  if (g === "feminino") return "Feminino";
  if (g === "masculino") return "Masculino";
  return "Não-binário";
}
function labelForma(f: string) {
  return f.charAt(0).toUpperCase() + f.slice(1);
}
