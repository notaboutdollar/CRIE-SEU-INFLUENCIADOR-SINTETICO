"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, ImageIcon } from "lucide-react";
import type { Character } from "@/lib/types";
import {
  buildAllImagePrompts,
  type FormatoImagem,
  type PromptImagem,
  type TipoImagem,
} from "@/lib/prompts/gerar-imagem";
import { copyToClipboard } from "@/lib/export";
import { cn } from "@/lib/cn";
import { useCharacters } from "@/lib/store";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";

interface Props {
  character: Character;
  /** "imagem" (padrão, modal da Visual) | "card" (card de posicionamentos na Revisão). */
  variant?: "imagem" | "card";
  /** Tipo de imagem a gerar. "retrato" = frente só. "referencia" = card 5 views + closes. */
  tipo?: TipoImagem;
}

const PLACEHOLDER_IDEIA =
  "Ex.: Homem de bigode gigante em espiral tipo Dalí, cabelo prateado afro alto como torre, blazer de veludo marrom-escuro, calça xadrez verde-musgo e pink, bota de bico fino. Vibe editorial surreal, Comme des Garçons meets Loewe.";

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

export function GerarImagem({ character, variant = "imagem", tipo = "referencia" }: Props) {
  const update = useCharacters((s) => s.update);
  const prompts = useMemo(() => buildAllImagePrompts(character, tipo), [character, tipo]);
  const [atual, setAtual] = useState<FormatoImagem>("neutro");
  const [copiado, setCopiado] = useState(false);
  const [open, setOpen] = useState(false);

  const ideia = character.visual.ideiaLivre ?? "";
  const isCard = variant === "card";

  const sel = prompts.find((p) => p.formato === atual) ?? prompts[0];

  async function onCopy() {
    const ok = await copyToClipboard(sel.prompt);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    }
  }

  const title = isCard
    ? "Gerar card com posicionamentos"
    : tipo === "retrato"
    ? "Gerar imagem de frente"
    : "Gerar card de referência";

  const subtitle = tipo === "retrato"
    ? "Retrato frontal · corpo inteiro"
    : "Character reference sheet · 5 views + closes";

  const description = isCard
    ? "Card de posicionamentos do personagem: 5 views do corpo (frente, ¾, perfil, ¾ costas, costas) + 3-4 closes de rosto, no estilo editorial surreal (Loewe por Juergen Teller, Comme des Garçons, Diane Arbus). Cole em qualquer gerador de imagem."
    : tipo === "retrato"
    ? "Prompt para gerar um retrato de frente do personagem no estilo editorial surreal (think Loewe por Juergen Teller, Comme des Garçons, Diane Arbus): corpo inteiro, vista frontal, fundo cinza de estúdio, pose neutra, traço marcante exagerado. Cole em qualquer gerador de imagem."
    : "Prompt para gerar uma folha de referência do personagem no estilo editorial surreal (think Loewe por Juergen Teller, Comme des Garçons, Diane Arbus): 5 views do corpo em cima, closes de rosto embaixo, fundo cinza de estúdio, pose neutra, traço marcante exagerado. Cole em qualquer gerador de imagem.";

  const content = (
    <>
      <p className="text-[13px] text-ink-mute mb-4 leading-relaxed">{description}</p>

      <div className="mb-4">
        <Field
          label="Ideia visual (opcional)"
          hint="Descreva a aparência do personagem em texto livre. Já é suficiente — não precisa preencher os campos abaixo. Se tiver as duas coisas, essa ideia vem primeiro e os campos entram como complemento."
          counter={{ value: ideia.length, max: 1500 }}
        >
          <Textarea
            rows={3}
            maxLength={1500}
            placeholder={PLACEHOLDER_IDEIA}
            value={ideia}
            onChange={(e) =>
              update(character.id, (c) => {
                c.visual.ideiaLivre = e.target.value;
              })
            }
          />
        </Field>
      </div>

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
    </>
  );

  if (isCard) {
    return (
      <section className="rounded-xl border border-accent/25 bg-accent/5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-start gap-3 p-4 text-left"
          aria-expanded={open}
        >
          <div className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-accent/15 text-accent shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="label-cap !text-accent">{title}</span>
            <p className="text-[13px] text-ink-mute mt-1 leading-relaxed">{subtitle}</p>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-ink-mute shrink-0 mt-2 transition",
              open && "rotate-180"
            )}
          />
        </button>
        {open && <div className="px-4 pb-4">{content}</div>}
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="label-cap inline-flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          {title}
        </h3>
        <span className="text-[11px] text-ink-dim">{subtitle}</span>
      </div>
      {content}
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
