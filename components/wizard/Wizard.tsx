"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCharacters } from "@/lib/store";
import { STEPS, stepIndex } from "@/data/steps";
import { STEP_IDS, type StepId } from "@/lib/types";
import { CharacterHeader } from "./CharacterHeader";
import { StepTabs } from "./StepTabs";
import { StepFooter } from "./StepFooter";
import { SuggestionCounter } from "./SuggestionCounter";
import { WizardProvider } from "./WizardContext";
import { RegenerateSection } from "./RegenerateSection";
import { AI_ENABLED } from "@/lib/ai/flag";
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
  const params = useSearchParams();
  const character = useCharacters((s) => s.characters.find((c) => c.id === id));
  const initialStep = useMemo<StepId>(() => {
    const raw = params?.get("step");
    return (STEP_IDS as readonly string[]).includes(raw ?? "")
      ? (raw as StepId)
      : "identidade";
  }, [params]);
  const [currentId, setCurrentId] = useState<StepId>(initialStep);

  const current = useMemo(() => STEPS[stepIndex(currentId)] ?? STEPS[0], [currentId]);

  if (!character) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="card p-8 text-center">
          <h2 className="display text-xl uppercase">Personagem não encontrado</h2>
          <p className="text-ink-mute text-sm mt-2">
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
    <WizardProvider characterId={character.id}>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <CharacterHeader character={character} />
        <SuggestionCounter character={character} />
        <div className="mb-6">
          <StepTabs current={currentId} character={character} onPick={setCurrentId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0">
            <section className="card p-5 sm:p-7">
              <div className="mb-5">
                <div className="eyebrow-accent mb-1.5">Etapa</div>
                <h2 className="display text-2xl sm:text-3xl text-ink uppercase">{current.title}</h2>
                <p className="text-ink-mute text-[15px] mt-1">{current.subtitle}</p>
              </div>

              <div className="mb-6">
                <DicaBox>{current.dica}</DicaBox>
              </div>

              {renderStep(currentId, character.id)}

              {AI_ENABLED && currentId !== "revisao" ? (
                <div className="mt-6">
                  <RegenerateSection
                    characterId={character.id}
                    stepId={currentId}
                    stepTitulo={current.title}
                  />
                </div>
              ) : null}

              <StepFooter current={currentId} onChange={setCurrentId} />
            </section>
          </div>

          <aside className="min-w-0">
            <CharacterCard character={character} />
          </aside>
        </div>
      </main>
    </WizardProvider>
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
