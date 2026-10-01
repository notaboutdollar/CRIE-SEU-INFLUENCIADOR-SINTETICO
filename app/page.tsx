"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useCharacters } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/home/EmptyState";
import { CharacterListItem } from "@/components/home/CharacterListItem";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const characters = useCharacters((s) => s.characters);
  const create = useCharacters((s) => s.createCharacter);

  useEffect(() => setMounted(true), []);

  function onCreate() {
    const id = create();
    router.push(`/personagem/${id}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-14">
      <header className="mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 text-brand-soft text-sm mb-3">
          <Sparkles className="w-4 h-4" />
          <span className="label-cap !text-brand-soft">Crie seu Influenciador Sintético</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
          Defina quem é seu <span className="text-brand-soft">influenciador</span>, campo a campo.
        </h1>
        <p className="text-ink-mute mt-4 max-w-2xl leading-relaxed">
          Um wizard em 7 etapas que leva você da ideia solta até uma ficha completa, com um Prompt Mestre pronto para gerar imagem, vídeo e roteiro. Tudo salvo no seu navegador — nada vai para servidor.
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium">Seus Personagens</h2>
          {mounted && characters.length > 0 ? (
            <Button onClick={onCreate}>
              <Plus className="w-4 h-4" /> Novo personagem
            </Button>
          ) : null}
        </div>

        {!mounted ? (
          <div className="card p-10 text-center text-ink-dim">Carregando…</div>
        ) : characters.length === 0 ? (
          <EmptyState onCreate={onCreate} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((c) => (
              <CharacterListItem key={c.id} character={c} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-16 text-xs text-ink-dim">
        v1 — persistência local. v2 vem com login, link público e geração de imagem.
      </footer>
    </main>
  );
}
