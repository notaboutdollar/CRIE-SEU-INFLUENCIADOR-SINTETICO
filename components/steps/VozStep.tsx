"use client";

import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Chip } from "@/components/ui/Chip";
import { Slider } from "@/components/ui/Slider";
import { emojiOpcoes, tamanhoFraseOpcoes } from "@/data/choices";

export function VozStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  if (!character) return null;
  const v = character.voz;

  return (
    <div className="grid grid-cols-1 gap-5">
      <section>
        <div className="label-cap mb-2">Tom de voz</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Formalidade">
            <Slider
              value={v.tomFormalidade}
              onChange={(x) => set((c) => (c.voz.tomFormalidade = x))}
              leftLabel="Formal"
              rightLabel="Informal"
            />
          </Field>
          <Field label="Humor">
            <Slider
              value={v.tomHumor}
              onChange={(x) => set((c) => (c.voz.tomHumor = x))}
              leftLabel="Sério"
              rightLabel="Engraçado"
            />
          </Field>
          <Field label="Complexidade">
            <Slider
              value={v.tomComplexidade}
              onChange={(x) => set((c) => (c.voz.tomComplexidade = x))}
              leftLabel="Técnico"
              rightLabel="Simples"
            />
          </Field>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Gírias">
          <TagInput value={v.girias} onChange={(x) => set((c) => (c.voz.girias = x))} />
        </Field>
        <Field label="Bordões">
          <TagInput value={v.bordoes} onChange={(x) => set((c) => (c.voz.bordoes = x))} />
        </Field>
        <Field label="Palavras proibidas">
          <TagInput value={v.proibidas} onChange={(x) => set((c) => (c.voz.proibidas = x))} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Como começa os conteúdos" optional>
          <Textarea
            rows={2}
            value={v.abertura ?? ""}
            onChange={(e) => set((c) => (c.voz.abertura = e.target.value))}
            placeholder="Ex.: ‘Bora pra um papo rápido…’"
          />
        </Field>
        <Field label="Como termina" optional>
          <Textarea
            rows={2}
            value={v.fechamento ?? ""}
            onChange={(e) => set((c) => (c.voz.fechamento = e.target.value))}
            placeholder="Ex.: ‘Comenta aí se faz sentido.’"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Uso de emoji">
          <div className="flex gap-2">
            {emojiOpcoes.map((o) => (
              <Chip
                key={o.value}
                selected={v.emoji === o.value}
                onClick={() => set((c) => (c.voz.emoji = o.value))}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="Tamanho médio das frases">
          <div className="flex gap-2">
            {tamanhoFraseOpcoes.map((o) => (
              <Chip
                key={o.value}
                selected={v.tamanhoFrase === o.value}
                onClick={() => set((c) => (c.voz.tamanhoFrase = o.value))}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Exemplos de 3 falas dele" hint="Escreva do jeito que ele falaria. Serve pra calibrar o estilo.">
        <div className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <Textarea
              key={i}
              rows={2}
              value={v.exemplos[i] ?? ""}
              onChange={(e) =>
                set((c) => {
                  const arr = [...c.voz.exemplos];
                  arr[i] = e.target.value;
                  c.voz.exemplos = arr;
                })
              }
              placeholder={`Fala ${i + 1}`}
            />
          ))}
        </div>
      </Field>

      <section>
        <div className="label-cap mb-2">Voz (áudio)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Gênero da voz" optional>
            <Input
              value={v.vozGenero ?? ""}
              onChange={(e) => set((c) => (c.voz.vozGenero = e.target.value))}
              placeholder="Ex.: feminina"
            />
          </Field>
          <Field label="Timbre" optional>
            <Input
              value={v.vozTimbre ?? ""}
              onChange={(e) => set((c) => (c.voz.vozTimbre = e.target.value))}
              placeholder="Ex.: grave, arrastada"
            />
          </Field>
          <Field label="Ritmo" optional>
            <Input
              value={v.vozRitmo ?? ""}
              onChange={(e) => set((c) => (c.voz.vozRitmo = e.target.value))}
              placeholder="Ex.: pausado, confiante"
            />
          </Field>
          <Field label="Referência de voz" optional>
            <Input
              value={v.vozReferencia ?? ""}
              onChange={(e) => set((c) => (c.voz.vozReferencia = e.target.value))}
              placeholder="Ex.: parecida com ___"
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
