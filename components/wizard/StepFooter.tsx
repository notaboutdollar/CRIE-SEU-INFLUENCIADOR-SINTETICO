"use client";

import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STEPS, stepIndex } from "@/data/steps";
import type { StepId } from "@/lib/types";

interface Props {
  current: StepId;
  onChange: (id: StepId) => void;
  onFinish?: () => void;
}

export function StepFooter({ current, onChange, onFinish }: Props) {
  const i = stepIndex(current);
  const prev = i > 0 ? STEPS[i - 1] : null;
  const next = i < STEPS.length - 1 ? STEPS[i + 1] : null;
  const isLast = !next;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-line">
      <Button
        variant="ghost"
        onClick={() => prev && onChange(prev.id)}
        disabled={!prev}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>
      <div className="eyebrow">
        Etapa {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
      </div>
      <Button
        variant="accent"
        onClick={() => (isLast ? onFinish?.() : onChange(next.id))}
      >
        {isLast ? (
          <>
            Salvar personagem
            <Save className="w-4 h-4" />
          </>
        ) : (
          <>
            Avançar
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
