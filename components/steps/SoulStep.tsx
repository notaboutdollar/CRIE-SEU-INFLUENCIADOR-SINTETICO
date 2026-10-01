"use client";

import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Chip } from "@/components/ui/Chip";
import { arquetipos } from "@/data/choices";

export function SoulStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  if (!character) return null;
  const s = character.soul;

  return (
    <div className="grid grid-cols-1 gap-5">
      <Field label="Arquétipo" fieldId="soul.arquetipo" hint="Comece por um atalho — depois mexa nos adjetivos pra afinar.">
        <div className="flex flex-wrap gap-2">
          {arquetipos.map((a) => (
            <Chip
              key={a}
              selected={s.arquetipo === a}
              onClick={() =>
                set((c) => (c.soul.arquetipo = c.soul.arquetipo === a ? undefined : a))
              }
            >
              {a}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="5 adjetivos que definem o jeito dele" fieldId="soul.adjetivos" hint="Enter para adicionar. Mínimo recomendado: 3.">
        <TagInput
          value={s.adjetivos}
          onChange={(v) => set((c) => (c.soul.adjetivos = v))}
          placeholder="Ex.: curioso, bem-humorado, teimoso…"
          max={10}
        />
      </Field>

      <section>
        <div className="label-cap mb-2">Gostos</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Comidas" fieldId="soul.gostos.comidas">
            <TagInput value={s.gostos.comidas} onChange={(v) => set((c) => (c.soul.gostos.comidas = v))} />
          </Field>
          <Field label="Músicas" fieldId="soul.gostos.musicas">
            <TagInput value={s.gostos.musicas} onChange={(v) => set((c) => (c.soul.gostos.musicas = v))} />
          </Field>
          <Field label="Hobbies" fieldId="soul.gostos.hobbies">
            <TagInput value={s.gostos.hobbies} onChange={(v) => set((c) => (c.soul.gostos.hobbies = v))} />
          </Field>
          <Field label="Marcas" fieldId="soul.gostos.marcas">
            <TagInput value={s.gostos.marcas} onChange={(v) => set((c) => (c.soul.gostos.marcas = v))} />
          </Field>
          <Field label="Lugares" fieldId="soul.gostos.lugares">
            <TagInput value={s.gostos.lugares} onChange={(v) => set((c) => (c.soul.gostos.lugares = v))} />
          </Field>
          <Field label="Séries / filmes" fieldId="soul.gostos.series">
            <TagInput value={s.gostos.series} onChange={(v) => set((c) => (c.soul.gostos.series = v))} />
          </Field>
        </div>
      </section>

      <section>
        <div className="label-cap mb-2">O que ele odeia</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Manias" fieldId="soul.odeia.manias">
            <TagInput value={s.odeia.manias} onChange={(v) => set((c) => (c.soul.odeia.manias = v))} />
          </Field>
          <Field label="Tipos de conteúdo" fieldId="soul.odeia.conteudos">
            <TagInput value={s.odeia.conteudos} onChange={(v) => set((c) => (c.soul.odeia.conteudos = v))} />
          </Field>
          <Field label="Comportamentos" fieldId="soul.odeia.comportamentos">
            <TagInput value={s.odeia.comportamentos} onChange={(v) => set((c) => (c.soul.odeia.comportamentos = v))} />
          </Field>
          <Field label="Assuntos" fieldId="soul.odeia.assuntos">
            <TagInput value={s.odeia.assuntos} onChange={(v) => set((c) => (c.soul.odeia.assuntos = v))} />
          </Field>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="O que defende" fieldId="soul.valoresDefende">
          <Textarea
            rows={2}
            value={s.valoresDefende ?? ""}
            onChange={(e) => set((c) => (c.soul.valoresDefende = e.target.value))}
            placeholder="Valores inegociáveis…"
          />
        </Field>
        <Field label="O que combate" fieldId="soul.valoresCombate">
          <Textarea
            rows={2}
            value={s.valoresCombate ?? ""}
            onChange={(e) => set((c) => (c.soul.valoresCombate = e.target.value))}
            placeholder="Comportamentos que ele não suporta…"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Medos" fieldId="soul.medos">
          <Input
            value={s.medos ?? ""}
            onChange={(e) => set((c) => (c.soul.medos = e.target.value))}
            placeholder="Ex.: ser esquecido"
          />
        </Field>
        <Field label="Manias" fieldId="soul.manias">
          <Input
            value={s.manias ?? ""}
            onChange={(e) => set((c) => (c.soul.manias = e.target.value))}
            placeholder="Ex.: morder a caneta"
          />
        </Field>
        <Field label="Defeitos" fieldId="soul.defeitos">
          <Input
            value={s.defeitos ?? ""}
            onChange={(e) => set((c) => (c.soul.defeitos = e.target.value))}
            placeholder="Ex.: impaciência"
          />
        </Field>
      </div>

      <Field
        label="História de origem"
        fieldId="soul.origem"
        hint="De onde veio, o que viveu, por que fala sobre esse nicho. 3–5 linhas."
      >
        <Textarea
          rows={4}
          value={s.origem ?? ""}
          onChange={(e) => set((c) => (c.soul.origem = e.target.value))}
          placeholder="Ex.: cresceu numa família de músicos e virou pesquisadora de áudio depois de descobrir…"
        />
      </Field>

      <section>
        <div className="label-cap mb-2">Como reagiria a…</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Elogio" fieldId="soul.reacoes.elogio">
            <Input
              value={s.reacoes.elogio ?? ""}
              onChange={(e) => set((c) => (c.soul.reacoes.elogio = e.target.value))}
              placeholder="Ex.: agradece e muda de assunto"
            />
          </Field>
          <Field label="Crítica" fieldId="soul.reacoes.critica">
            <Input
              value={s.reacoes.critica ?? ""}
              onChange={(e) => set((c) => (c.soul.reacoes.critica = e.target.value))}
              placeholder="Ex.: pergunta o porquê antes de reagir"
            />
          </Field>
          <Field label="Polêmica" fieldId="soul.reacoes.polemica">
            <Input
              value={s.reacoes.polemica ?? ""}
              onChange={(e) => set((c) => (c.soul.reacoes.polemica = e.target.value))}
              placeholder="Ex.: evita até ter certeza; depois é claro"
            />
          </Field>
          <Field label="Hater" fieldId="soul.reacoes.hater">
            <Input
              value={s.reacoes.hater ?? ""}
              onChange={(e) => set((c) => (c.soul.reacoes.hater = e.target.value))}
              placeholder="Ex.: ignora; se repetir, bloqueia com humor"
            />
          </Field>
        </div>
      </section>

      <Field
        label="Regras de consistência (até 5)"
        fieldId="soul.regrasConsistencia"
        hint="Linhas inegociáveis do personagem — vão viram parte do Prompt de sistema."
      >
        <TagInput
          value={s.regrasConsistencia}
          onChange={(v) => set((c) => (c.soul.regrasConsistencia = v))}
          placeholder="Ex.: nunca fala sobre política partidária"
          max={5}
        />
      </Field>
    </div>
  );
}
