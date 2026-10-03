"use client";

import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useCharacters } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { StepId } from "@/lib/types";

const CAMPOS_POR_STEP: Record<Exclude<StepId, "revisao">, string[]> = {
  identidade: ["nome", "handles", "ocupacao", "genero", "forma", "idadeAparente", "cidade", "idioma", "sotaque", "bio"],
  visual: ["traco", "cabelo", "pele", "olhos", "roupa", "acessorios", "tracosMarcantes", "paleta", "cenarios", "negativos"],
  soul: ["arquetipo", "adjetivos", "gostos", "odeia", "valoresDefende", "valoresCombate", "medos", "manias", "defeitos", "origem", "reacoes", "regrasConsistencia"],
  nicho: ["principal", "subnicho", "publico", "promessa", "performaFormatos", "diferencial", "plataformas", "pilares", "ideiasConteudo"],
  voz: ["tomFormalidade", "tomHumor", "tomComplexidade", "girias", "bordoes", "proibidas", "abertura", "fechamento", "emoji", "tamanhoFrase", "exemplos"],
  monetizacao: ["modelos", "marcasOk", "marcasNao", "limites", "transparencia"],
};

interface Props {
  characterId: string;
  stepId: StepId;
  stepTitulo: string;
}

export function RegenerateSection({ characterId, stepId, stepTitulo }: Props) {
  const [open, setOpen] = useState(false);
  const [instrucao, setInstrucao] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const character = useCharacters((s) => s.characters.find((c) => c.id === characterId));
  const applySuggestions = useCharacters((s) => s.applySuggestions);

  if (!character || stepId === "revisao") return null;

  const campos = CAMPOS_POR_STEP[stepId as Exclude<StepId, "revisao">];

  async function onRegerar() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/regenerar-secao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          stepId,
          stepTitulo,
          campos,
          instrucao: instrucao.trim() || undefined,
          travados: character!._locks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "Falha ao regenerar.");
        return;
      }
      applySuggestions(characterId, data.suggestions ?? [], `Regenerar: ${stepTitulo}`);
      setOpen(false);
      setInstrucao("");
    } catch (e) {
      setErr((e as Error).message ?? "Falha de rede.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] mono uppercase tracking-wider text-ink-mute hover:text-accent font-bold inline-flex items-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Regenerar esta seção com IA
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="label-cap !text-accent">Regenerar: {stepTitulo}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-6 w-6 inline-flex items-center justify-center rounded-full text-ink-mute hover:text-ink"
          aria-label="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[13px] text-ink-mute mb-2 leading-relaxed">
        Campos travados ({character._locks.length}) não serão alterados. Instrução é opcional.
      </p>
      <Input
        placeholder="O que mudar? Ex.: 'mais sério', 'menos clichê', 'tom mais técnico'"
        value={instrucao}
        onChange={(e) => setInstrucao(e.target.value)}
        disabled={loading}
      />
      {err ? (
        <div className="mt-2 text-[13px] text-pink">{err}</div>
      ) : null}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="text-[13px] text-ink-mute hover:text-ink font-semibold px-3 py-1.5"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onRegerar}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-1.5 bg-accent hover:bg-accent-strong text-bg font-bold text-[13px] px-4 py-1.5 rounded-full transition disabled:opacity-50"
          )}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          {loading ? "Regenerando…" : "Regenerar"}
        </button>
      </div>
    </div>
  );
}
