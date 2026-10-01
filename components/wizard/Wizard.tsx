"use client";

import { useMemo, useState } from "react";
import { useCharacters } from "@/lib/store";
import { STEPS, stepIndex } from "@/data/steps";
import type { StepId } from "@/lib/types";
import { CharacterHeader } from "./CharacterHeader";
import { StepTabs } from "./StepTabs";
import { StepFooter } from "./StepFooter";
import { DicaBox } from "@/components/ui/DicaBox";
import { CharacterCard } from "@/components/preview/CharacterCard";
import { IdentidadeStep } from "@/components/steps/IdentidadeStep";
import { VisualStep } from "@/components/steps/VisualStep";
import { SoulStep } from "@/components/steps/SoulStep";
import { NichoStep } from "@/components/steps/NichoStep";
import { VozStep } from "@/components/steps/VozStep";
import { MonetizacaoStep } from "@/components/steps/MonetizacaoStep";
import { RevisaoStep } from "@/components/steps/RevisaoStep";
import { useRouter } from "next/navigation";

export function Wizard({ id }: { id: string }) {
  const router = useRouter();
  const character = useCharacters((s) => s.characters.find((c) => c.id === id));
  const [currentId, setCurrentId] = useState<StepId>("identidade");

  const current = useMemo(() => STEPS[stepIndex(currentId)] ?? STEPS[0], [currentId]);

  if (!character) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="card p-8 text-center">
          <h2 className="serif text-xl">Personagem não encontrado</h2>
          <p className="text-muted text-sm mt-2">
            Pode ter sido excluído em outra aba.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-accent hover:underline font-semibold"
          >
            Voltar para a lista
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
      <CharacterHeader character={character} />
      <div className="mb-6">
        <StepTabs current={currentId} character={character} onPick={setCurrentId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="min-w-0">
          <section className="card p-5 sm:p-7">
            <div className="mb-5">
              <div className="eyebrow-accent mb-1">Etapa</div>
              <h2 className="serif text-2xl sm:text-3xl text-ink">{current.title}</h2>
              <p className="text-muted text-[15px] mt-1">{current.subtitle}</p>
            </div>

            <div className="mb-6">
              <DicaBox>{current.dica}</DicaBox>
            </div>

            {renderStep(currentId, character.id)}

            <StepFooter current={currentId} onChange={setCurrentId} />
          </section>
        </div>

        <aside className="min-w-0">
          <CharacterCard character={character} />
        </aside>
      </div>
    </main>
  );
}

function renderStep(id: StepId, charId: string) {
  switch (id) {
    case "identidade":
      return <IdentidadeStep id={charId} />;
    case "visual":
      return <VisualStep id={charId} />;
    case "soul":
      return <SoulStep id={charId} />;
    case "nicho":
      return <NichoStep id={charId} />;
    case "voz":
      return <VozStep id={charId} />;
    case "monetizacao":
      return <MonetizacaoStep id={charId} />;
    case "revisao":
      return <RevisaoStep id={charId} />;
  }
}
