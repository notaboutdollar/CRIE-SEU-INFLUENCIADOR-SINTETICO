"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, ImageIcon } from "lucide-react";
import type { Character } from "@/lib/types";
import {
  buildAllImagePrompts,
  type FormatoImagem,
  type PromptImagem,
} from "@/lib/prompts/gerar-imagem";
import { copyToClipboard } from "@/lib/export";
import { cn } from "@/lib/cn";

interface Props {
  character: Character;
}

const QUICK_LINKS: Record<FormatoImagem, Array<{ label: string; href: string }>> = {
  neutro: [
    { label: "ChatGPT", href: "https://chat.openai.com/" },
    { label: "Gemini", href: "https://gemini.google.com/" },
  ],
  midjourney: [{ label: "Midjourney", href: "https://www.midjourney.com/" }],
  flux: [
    { label: "Flux Playground", href: "https://playground.bfl.ai/" },
    { label: "Stable Diffusion", href: "https://stablediffusionweb.com/" },
  ],
};

export function GerarImagem({ character }: Props) {
  const prompts = useMemo(() => buildAllImagePrompts(character), [character]);
  const [atual, setAtual] = useState<FormatoImagem>("neutro");
  const [copiado, setCopiado] = useState(false);

  const sel = prompts.find((p) => p.formato === atual) ?? prompts[0];

  async function onCopy() {
    const ok = await copyToClipboard(sel.prompt);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="label-cap inline-flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Gerar imagem com IA
        </h3>
        <span className="text-[11px] text-ink-dim">
          Character reference sheet · 5 views + closes
        </span>
      </div>

      <p className="text-[13px] text-ink-mute mb-3 leading-relaxed">
        Prompt pronto para gerar uma folha de referência do personagem — 5 views do corpo em cima
        e closes de rosto embaixo, estilo fotorreal com polimento 3D, fundo cinza de estúdio. Cole
        em qualquer gerador de imagem.
      </p>

      {/* Abas */}
      <div className="flex gap-1 border border-line rounded-full p-1 bg-panel w-fit mb-3">
        {prompts.map((p) => (
          <button
            key={p.formato}
            type="button"
            onClick={() => setAtual(p.formato)}
            className={cn(
              "px-3.5 h-8 rounded-full text-[12px] font-bold uppercase tracking-wider mono transition",
              atual === p.formato
                ? "bg-accent text-bg"
                : "text-ink-mute hover:text-ink"
            )}
          >
            {p.nome}
          </button>
        ))}
      </div>

      <PromptPanel sel={sel} copiado={copiado} onCopy={onCopy} />
    </section>
  );
}

function PromptPanel({
  sel,
  copiado,
  onCopy,
}: {
  sel: PromptImagem;
  copiado: boolean;
  onCopy: () => void;
}) {
  const links = QUICK_LINKS[sel.formato];
  return (
    <div className="rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-line flex-wrap">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-ink">{sel.gerador}</div>
          <div className="text-[11px] text-ink-dim">{sel.descricaoCurta}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {links.map((l) => (
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
        {sel.prompt}
      </pre>
    </div>
  );
}
