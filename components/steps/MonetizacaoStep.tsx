"use client";

import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Chip } from "@/components/ui/Chip";
import { modelosNegocio } from "@/data/choices";

export function MonetizacaoStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  if (!character) return null;
  const m = character.monetizacao;

  function toggle(list: string[], v: string) {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <Field label="Modelo de negócio" hint="Selecione um ou mais.">
        <div className="flex flex-wrap gap-2">
          {modelosNegocio.map((p) => (
            <Chip
              key={p}
              selected={m.modelos.includes(p)}
              onClick={() => set((c) => (c.monetizacao.modelos = toggle(c.monetizacao.modelos, p)))}
            >
              {p}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tipos de marca que combinam">
          <TagInput
            value={m.marcasOk}
            onChange={(v) => set((c) => (c.monetizacao.marcasOk = v))}
            placeholder="Ex.: papelaria independente, café, saúde mental"
          />
        </Field>
        <Field label="Tipos de marca que NÃO combinam">
          <TagInput
            value={m.marcasNao}
            onChange={(v) => set((c) => (c.monetizacao.marcasNao = v))}
            placeholder="Ex.: fast fashion, apostas, dietas restritivas"
          />
        </Field>
      </div>

      <Field
        label="Limites éticos"
        hint="O que ele jamais divulgaria — mesmo com um cheque bom na mesa."
      >
        <Textarea
          rows={3}
          value={m.limites ?? ""}
          onChange={(e) => set((c) => (c.monetizacao.limites = e.target.value))}
          placeholder="Ex.: nunca anuncia produto que promete emagrecer; não trabalha com marca que testa em animais."
        />
      </Field>

      <Field
        label="Transparência: como e onde ele avisa que é um personagem sintético"
        hint="A primeira linha da bio? Pin no perfil? Em cada vídeo? Decida."
      >
        <Textarea
          rows={3}
          value={m.transparencia ?? ""}
          onChange={(e) => set((c) => (c.monetizacao.transparencia = e.target.value))}
          placeholder="Ex.: bio diz ‘personagem sintético criado por ___’; vídeos têm marca-d'água #sintético."
        />
      </Field>
    </div>
  );
}
