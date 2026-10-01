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
                ? "border-brand bg-brand/10 shadow-glow"
                : "border-line bg-bg-card hover:border-brand/50"
            )}
          >
            <span
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-semibold",
                active ? "bg-brand text-white" : "bg-bg-elev text-ink-mute"
              )}
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.65rem] uppercase tracking-wider text-ink-dim">
                Etapa {i + 1}
              </span>
              <span className="block text-sm font-medium text-ink whitespace-nowrap">
                {step.title}
              </span>
              <span className="block text-[0.7rem] text-ink-mute whitespace-nowrap">
                {step.subtitle}
              </span>
            </span>
            <span className="ml-2 text-[0.7rem] tabular-nums text-ink-dim">{pct}%</span>
          </button>
        );
      })}
    </nav>
  );
}
