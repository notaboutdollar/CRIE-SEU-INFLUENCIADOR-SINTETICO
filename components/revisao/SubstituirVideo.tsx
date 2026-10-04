"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Film } from "lucide-react";
import type { Character } from "@/lib/types";
import { promptSubstituirVideo } from "@/lib/prompts/substituir-video";
import { copyToClipboard } from "@/lib/export";
import { cn } from "@/lib/cn";

interface Props {
  character: Character;
}

const QUICK_LINKS = [
  { label: "Runway", href: "https://runwayml.com/" },
  { label: "Kling", href: "https://kling.kuaishou.com/" },
  { label: "Veo", href: "https://labs.google/fx/tools/flow" },
  { label: "Pika", href: "https://pika.art/" },
];

export function SubstituirVideo({ character }: Props) {
  const prompt = useMemo(() => promptSubstituirVideo(character), [character]);
  const [copiado, setCopiado] = useState(false);

  async function onCopy() {
    const ok = await copyToClipboard(prompt);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="label-cap inline-flex items-center gap-2">
          <Film className="w-3.5 h-3.5" />
          Substituir pessoa em vídeo (sombra)
        </h3>
        <span className="text-[11px] text-ink-dim">
          Mantém movimento, gestual, ritmo e enquadramento
        </span>
      </div>

      <p className="text-[13px] text-ink-mute mb-4 leading-relaxed">
        Prompt pronto para trocar uma pessoa de um vídeo existente pelo seu personagem, mantendo
        exatamente o mesmo movimento. Anexe o vídeo original + a imagem de referência do
        personagem numa IA de vídeo-para-vídeo (Runway, Kling, Veo, Pika) e cole este prompt.
      </p>

      <div className="rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-line flex-wrap">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-ink">Runway · Kling · Veo · Pika</div>
            <div className="text-[11px] text-ink-dim">
              Precisa anexar vídeo de origem + imagem do personagem.
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full h-7 px-3 border border-line text-ink-mute hover:text-ink hover:border-line-strong transition"
              >
                <ExternalLink className="w-3 h-3" />
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={onCopy}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full h-7 px-3 text-[11px] font-bold uppercase tracking-wider transition",
                copiado
                  ? "bg-ok text-bg"
                  : "bg-accent text-bg hover:bg-accent-strong"
              )}
            >
              {copiado ? <Check className="w-3 h-3" strokeWidth={3} /> : <Copy className="w-3 h-3" />}
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
        <pre className="p-3.5 text-[12px] mono text-ink/85 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[420px] bg-bg rounded-b-xl">
          {prompt}
        </pre>
      </div>
    </section>
  );
}
