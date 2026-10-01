"use client";

import { cn } from "@/lib/cn";
import { STEPS } from "@/data/steps";
import type { StepId } from "@/lib/types";
import type { Character } from "@/lib/types";
import { stepCompletion } from "@/lib/completion";

interface Props {
  current: StepId;
  character: Character;
  onPick: (id: StepId) => void;
}

export function StepTabs({ current, character, onPick }: Props) {
  const completion = stepCompletion(character);
  return (
    <nav
      aria-label="Etapas"
      className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 scroll-smooth"
    >
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const active = step.id === current;
        const pct = completion[step.id];
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onPick(step.id)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "shrink-0 flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition",
              active
                ? "border-accent bg-paper shadow-focus"
                : "border-line bg-paper hover:border-ink/40"
            )}
          >
            <span
              className={cn(
                "h-9 w-9 inline-flex items-center justify-center rounded-full text-xs font-semibold shrink-0",
                active ? "bg-accent text-white" : "bg-bg text-muted"
              )}
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="eyebrow block">
                Etapa {String(i + 1).padStart(2, "0")}
              </span>
              <span className="block text-sm font-semibold text-ink whitespace-nowrap">
                {step.title}
              </span>
              <span className="block text-[12px] text-muted whitespace-nowrap">
                {step.subtitle}
              </span>
            </span>
            <span className="ml-2 text-[11px] mono tabular-nums text-muted">{pct}%</span>
          </button>
        );
      })}
    </nav>
  );
}
