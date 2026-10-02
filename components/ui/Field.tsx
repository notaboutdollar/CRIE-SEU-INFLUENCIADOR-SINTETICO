"use client";

import { cn } from "@/lib/cn";
import { Check, Lock, LockOpen, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useCharacters } from "@/lib/store";
import { useWizardCharacterId } from "@/components/wizard/WizardContext";
import { SuggestFieldButton } from "@/components/wizard/SuggestFieldButton";
import { AI_ENABLED } from "@/lib/ai/flag";

interface FieldProps {
  label: string;
  hint?: string;
  optional?: boolean;
  htmlFor?: string;
  counter?: { value: number; max: number };
  /** Caminho dot-notation (ex.: "identidade.bio"). Habilita badge "Sugestão da IA" e cadeado. */
  fieldId?: string;
  /** Descrição curta para a IA quando o usuário clica em "Sugerir com IA". */
  aiDescricao?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  optional,
  htmlFor,
  counter,
  fieldId,
  aiDescricao,
  children,
  className,
}: FieldProps) {
  const characterId = useWizardCharacterId();
  const suggestion = useCharacters((s) =>
    characterId && fieldId
      ? s.characters.find((c) => c.id === characterId)?._suggestions[fieldId]
      : undefined
  );
  const locked = useCharacters((s) =>
    characterId && fieldId
      ? s.characters.find((c) => c.id === characterId)?._locks.includes(fieldId) ?? false
      : false
  );
  const confirmSuggestion = useCharacters((s) => s.confirmSuggestion);
  const toggleLock = useCharacters((s) => s.toggleLock);

  const showBadge = !!suggestion && !!characterId && !!fieldId;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="label-cap inline-flex items-center gap-2">
          {label}
          {optional ? (
            <span className="text-muted/80 normal-case font-normal tracking-normal">
              (opcional)
            </span>
          ) : null}
          {showBadge ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] mono font-bold normal-case tracking-normal",
                suggestion === "contexto"
                  ? "bg-ok-soft text-ok border border-ok/30"
                  : "bg-accent-soft text-accent-strong border border-accent/30"
              )}
              title={
                suggestion === "contexto"
                  ? "A IA inferiu do seu contexto"
                  : "A IA inventou — revise"
              }
            >
              <Sparkles className="w-2.5 h-2.5" />
              {suggestion === "contexto" ? "do contexto" : "sugestão"}
            </span>
          ) : null}
        </label>
        <div className="flex items-center gap-2">
          {characterId && fieldId ? (
            <button
              type="button"
              onClick={() => toggleLock(characterId, fieldId)}
              className={cn(
                "h-5 w-5 inline-flex items-center justify-center rounded-md transition",
                locked ? "text-ink" : "text-muted hover:text-ink"
              )}
              aria-pressed={locked}
              title={locked ? "Travado — regeneração não altera" : "Travar campo"}
            >
              {locked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
            </button>
          ) : null}
          {counter ? (
            <span
              className={cn(
                "text-[11px] tabular-nums mono",
                counter.value > counter.max ? "text-warn" : "text-muted/80"
              )}
            >
              {counter.value}/{counter.max}
            </span>
          ) : null}
        </div>
      </div>
      <div
        className={cn(
          showBadge && "rounded-xl ring-1 ring-dashed ring-accent/50 p-0.5 -m-0.5"
        )}
      >
        {children}
      </div>
      <div className="flex items-center justify-between gap-3 min-h-[16px]">
        {hint ? (
          <p className="text-[13px] text-muted leading-relaxed">{hint}</p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {AI_ENABLED && !showBadge && characterId && fieldId && aiDescricao ? (
            <SuggestFieldButton
              characterId={characterId}
              fieldId={fieldId}
              descricao={aiDescricao}
            />
          ) : null}
          {showBadge && characterId && fieldId ? (
            <button
              type="button"
              onClick={() => confirmSuggestion(characterId, fieldId)}
              className="text-[11px] mono text-accent-strong hover:text-ink inline-flex items-center gap-1 font-bold uppercase"
            >
              <Check className="w-3 h-3" />
              Confirmar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
