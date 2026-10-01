"use client";

import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { CardChoice } from "@/components/ui/CardChoice";
import { formas, generos } from "@/data/choices";

export function IdentidadeStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  if (!character) return null;
  const d = character.identidade;

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome / apelido" counter={{ value: d.nome.length, max: 50 }}>
          <Input
            maxLength={50}
            placeholder="Ex.: Lila, Jr., Noa, Vulpes…"
            value={d.nome}
            onChange={(e) => set((c) => (c.identidade.nome = e.target.value))}
          />
        </Field>
        <Field label="Nome por extenso" optional>
          <Input
            placeholder="Ex.: Lila Serafina Costa"
            value={d.nomeExtenso ?? ""}
            onChange={(e) => set((c) => (c.identidade.nomeExtenso = e.target.value))}
          />
        </Field>
      </div>

      <Field label="Gênero">
        <div className="grid grid-cols-3 gap-3">
          {generos.map((g) => (
            <CardChoice
              key={g.value}
              title={g.label}
              icon={<span className="text-lg">{g.emoji}</span>}
              selected={d.genero === g.value}
              onClick={() => set((c) => (c.identidade.genero = g.value))}
            />
          ))}
        </div>
      </Field>

      <Field label="Forma" hint="A natureza do personagem define o resto da imagem.">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {formas.map((f) => (
            <CardChoice
              key={f.value}
              title={f.label}
              description={f.descricao}
              selected={d.forma === f.value}
              onClick={() => set((c) => (c.identidade.forma = f.value))}
            />
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Idade aparente" optional>
          <Input
            placeholder="Ex.: 28 anos, atemporal, infantil…"
            value={d.idadeAparente ?? ""}
            onChange={(e) => set((c) => (c.identidade.idadeAparente = e.target.value))}
          />
        </Field>
        <Field label="Cidade / País" optional>
          <Input
            placeholder="Ex.: São Paulo, BR"
            value={d.cidade ?? ""}
            onChange={(e) => set((c) => (c.identidade.cidade = e.target.value))}
          />
        </Field>
        <Field label="Idioma" optional>
          <Input
            placeholder="Ex.: Português do Brasil"
            value={d.idioma ?? ""}
            onChange={(e) => set((c) => (c.identidade.idioma = e.target.value))}
          />
        </Field>
        <Field label="Sotaque" optional>
          <Input
            placeholder="Ex.: Paulistano suave, neutro, interior do nordeste"
            value={d.sotaque ?? ""}
            onChange={(e) => set((c) => (c.identidade.sotaque = e.target.value))}
          />
        </Field>
      </div>

      <Field
        label="Bio em 1 linha"
        hint="O resumo do personagem. Pense em algo que você diria em uma reunião: ‘ele é o ___ que ___’."
        counter={{ value: (d.bio ?? "").length, max: 140 }}
      >
        <Textarea
          maxLength={140}
          rows={2}
          placeholder="Ex.: Arquiteta de interiores que detesta minimalismo frio e defende cores saturadas."
          value={d.bio ?? ""}
          onChange={(e) => set((c) => (c.identidade.bio = e.target.value))}
        />
      </Field>
    </div>
  );
}
