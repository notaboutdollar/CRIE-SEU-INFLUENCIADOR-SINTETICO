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
  /** "horizontal" (mobile/tablet, scroll horizontal) ou "vertical" (sidebar). */
  orientation?: "horizontal" | "vertical";
}

export function StepTabs({ current, character, onPick, orientation = "horizontal" }: Props) {
  const completion = stepCompletion(character);
  const vertical = orientation === "vertical";
  return (
    <nav
      aria-label="Etapas"
      className={cn(
        vertical
          ? "flex flex-col gap-1.5"
          : "flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 scroll-smooth"
      )}
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
              "flex items-center gap-3 rounded-xl border text-left transition",
              vertical ? "w-full px-3 py-2.5" : "shrink-0 px-3.5 py-2.5",
              active
                ? "border-accent bg-accent/5 shadow-glow"
                : "border-line bg-panel hover:border-line-strong"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full font-semibold shrink-0",
                vertical ? "h-8 w-8" : "h-9 w-9",
                active ? "bg-accent text-bg" : "bg-card text-ink-mute"
              )}
            >
              <Icon className={cn(vertical ? "w-3.5 h-3.5" : "w-4 h-4")} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="eyebrow block">
                Etapa {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "block font-semibold text-ink",
                  vertical ? "text-[13px] truncate" : "text-sm whitespace-nowrap"
                )}
              >
                {step.title}
              </span>
              <span
                className={cn(
                  "block text-[11.5px] text-ink-mute",
                  vertical ? "truncate" : "whitespace-nowrap"
                )}
              >
                {step.subtitle}
              </span>
            </span>
            <span
              className={cn(
                "text-[11px] mono tabular-nums shrink-0",
                active ? "text-accent" : "text-ink-dim",
                !vertical && "ml-2"
              )}
            >
              {pct}%
            </span>
          </button>
        );
      })}
    </nav>
  );
}
