"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useCharacters } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/home/EmptyState";
import { CharacterListItem } from "@/components/home/CharacterListItem";
import { CreateDialog } from "@/components/home/CreateDialog";
import { AI_ENABLED } from "@/lib/ai/flag";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const characters = useCharacters((s) => s.characters);

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <TopNav onCreate={() => setOpen(true)} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-accent/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-center gap-2 mb-5 justify-center">
            <span className="chip-new">NEW</span>
            <span className="eyebrow-accent">Crie seu Influenciador Sintético</span>
          </div>
          <h1 className="display text-[40px] sm:text-[64px] text-center uppercase leading-[0.95] tracking-tighter">
            Monte seu influenciador<br />
            <span className="text-accent">campo a campo.</span>
          </h1>
          <p className="text-ink-mute text-[17px] text-center mt-6 max-w-[640px] mx-auto leading-relaxed">
            Um wizard em 7 etapas que leva você da ideia solta até uma ficha completa com Prompt
            Mestre pronto para gerar imagem, vídeo e roteiro. Sem ideia fechada? Pegue um prompt
            pronto e deixe o Claude montar a ficha.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <Button variant="accent" size="lg" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={3} />
              Criar personagem
            </Button>
            <a
              href="#personagens"
              className="eyebrow hover:text-ink transition"
            >
              Ou veja os seus
            </a>
          </div>
        </div>
      </section>

      <section id="personagens" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="eyebrow-accent mb-2">Biblioteca</div>
            <h2 className="display text-3xl uppercase">Seus Personagens</h2>
          </div>
          {mounted && characters.length > 0 ? (
            <Button variant="accent" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={3} />
              Novo
            </Button>
          ) : null}
        </div>

        {!mounted ? (
          <div className="card p-16 text-center text-ink-dim">Carregando…</div>
        ) : characters.length === 0 ? (
          <EmptyState onCreate={() => setOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {characters.map((c) => (
              <CharacterListItem key={c.id} character={c} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-line mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-[12px] text-ink-dim flex flex-wrap items-center gap-3">
          <span className="eyebrow">v2</span>
          <span>
            {AI_ENABLED
              ? "Expansão por IA + persistência local."
              : "Persistência local no navegador. Expansão por IA chega em uma versão futura."}
          </span>
        </div>
      </footer>

      <CreateDialog open={open} onClose={() => setOpen(false)} />
      <MountGate onMount={() => setMounted(true)} />
    </main>
  );
}

function MountGate({ onMount }: { onMount: () => void }) {
  useEffect(() => onMount(), [onMount]);
  return null;
}

function TopNav({ onCreate }: { onCreate: () => void }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-accent flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-bg" strokeWidth={3} />
          </div>
          <span className="font-bold text-sm uppercase tracking-wider">
            Influenciador Sintético
          </span>
        </div>
        <Button variant="accent" size="sm" onClick={onCreate}>
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          Novo
        </Button>
      </div>
    </nav>
  );
}
