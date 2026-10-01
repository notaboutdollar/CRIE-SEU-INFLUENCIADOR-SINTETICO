"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useCharacters } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/home/EmptyState";
import { CharacterListItem } from "@/components/home/CharacterListItem";
import { CreateDialog } from "@/components/home/CreateDialog";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const characters = useCharacters((s) => s.characters);

  useEffect(() => setMounted(true), []);

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <header className="mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="eyebrow-accent">Curadoria de personagens</span>
        </div>
        <h1 className="serif text-[44px] sm:text-[68px] leading-[1.02] tracking-tight text-ink">
          Defina quem é seu<br />
          <span className="text-accent">influenciador sintético</span>, campo a campo.
        </h1>
        <p className="text-[18px] text-[#3a3a3a] mt-6 max-w-[640px] leading-relaxed">
          Um wizard em 7 etapas que leva você da ideia solta até uma ficha completa, com um Prompt Mestre pronto para gerar imagem, vídeo e roteiro. Escreva um contexto curto e deixe a IA preencher — você revisa.
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="serif text-2xl text-ink">Seus Personagens</h2>
          {mounted && characters.length > 0 ? (
            <Button variant="accent" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Novo personagem
            </Button>
          ) : null}
        </div>

        {!mounted ? (
          <div className="card p-10 text-center text-muted">Carregando…</div>
        ) : characters.length === 0 ? (
          <EmptyState onCreate={() => setOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((c) => (
              <CharacterListItem key={c.id} character={c} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-20 pt-8 border-t border-line text-[13px] text-muted">
        <span className="eyebrow">v2</span>
        <span className="ml-3">
          Expansão por IA + persistência local. v3 vem com login, link público e geração de imagem.
        </span>
      </footer>

      <CreateDialog open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
