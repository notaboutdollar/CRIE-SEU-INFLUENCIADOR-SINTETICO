"use client";

import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent-soft border border-accent/25 text-accent-strong mb-5">
        <Sparkles className="w-6 h-6" />
      </div>
      <h2 className="serif text-2xl text-ink">Comece seu primeiro personagem</h2>
      <p className="text-muted mt-2 max-w-md mx-auto leading-relaxed">
        Um bom influenciador sintético começa com decisões claras. Vamos passar por 7 etapas, no seu ritmo. Você pode voltar, duplicar e exportar quando quiser.
      </p>
      <div className="mt-6">
        <Button variant="accent" size="lg" onClick={onCreate}>
          <Plus className="w-4 h-4" /> Criar personagem
        </Button>
      </div>
    </div>
  );
}
