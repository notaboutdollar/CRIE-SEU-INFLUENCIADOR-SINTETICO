"use client";

import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand/15 border border-brand/30 text-brand-soft mb-5">
        <Sparkles className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-semibold">Comece seu primeiro personagem</h2>
      <p className="text-ink-mute mt-2 max-w-md mx-auto leading-relaxed">
        Um bom influenciador sintético começa com decisões claras. Vamos passar por 7 etapas, no seu ritmo. Você pode voltar, duplicar e exportar quando quiser.
      </p>
      <div className="mt-6">
        <Button size="lg" onClick={onCreate}>
          <Plus className="w-4 h-4" /> Criar personagem
        </Button>
      </div>
    </div>
  );
}
