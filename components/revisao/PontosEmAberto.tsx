"use client";

import { HelpCircle, Trash2 } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import type { Character } from "@/lib/types";
import { useCharacters } from "@/lib/store";

export function PontosEmAberto({ character }: { character: Character }) {
  const update = useCharacters((s) => s.update);

  if (character.pontosEmAberto.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="label-cap">
          Pontos em aberto — {character.pontosEmAberto.length}{" "}
          {character.pontosEmAberto.length === 1 ? "decisão" : "decisões"}
        </h3>
      </div>
      <p className="text-[13px] text-muted mb-3 leading-relaxed">
        A IA marcou essas decisões como importantes mas pulou pra você. Responder cada uma
        define melhor o personagem.
      </p>
      <ul className="grid gap-3">
        {character.pontosEmAberto.map((p, i) => (
          <li
            key={i}
            className="rounded-xl border border-line bg-paper p-4 relative"
          >
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-accent-strong mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink">{p.decisao}</div>
                <div className="text-[13px] text-muted mt-0.5 leading-relaxed">
                  {p.porQueImporta}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  update(character.id, (c) => {
                    c.pontosEmAberto = c.pontosEmAberto.filter((_, j) => j !== i);
                  })
                }
                className="h-7 w-7 inline-flex items-center justify-center rounded-full text-muted hover:text-warn transition"
                aria-label="Remover ponto"
                title="Remover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Field label="Sua resposta" optional>
              <Textarea
                rows={2}
                placeholder="Como você responde a isso?"
                value={p.resposta ?? ""}
                onChange={(e) =>
                  update(character.id, (c) => {
                    c.pontosEmAberto[i].resposta = e.target.value;
                  })
                }
              />
            </Field>
          </li>
        ))}
      </ul>
    </section>
  );
}
