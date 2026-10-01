"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { formatos, plataformas } from "@/data/choices";

export function NichoStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  if (!character) return null;
  const n = character.nicho;

  function toggleList(list: string[], v: string) {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  const somaPilares = n.pilares.reduce((a, p) => a + (Number(p.pct) || 0), 0);

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nicho principal">
          <Input
            value={n.principal ?? ""}
            onChange={(e) => set((c) => (c.nicho.principal = e.target.value))}
            placeholder="Ex.: Produtividade pra criativos"
          />
        </Field>
        <Field label="Subnicho" optional>
          <Input
            value={n.subnicho ?? ""}
            onChange={(e) => set((c) => (c.nicho.subnicho = e.target.value))}
            placeholder="Ex.: Freelancers que vivem com burnout"
          />
        </Field>
      </div>

      <Field label="Público-alvo" hint="Idade, dores, desejos — descreva como uma pessoa real.">
        <Textarea
          rows={3}
          value={n.publico ?? ""}
          onChange={(e) => set((c) => (c.nicho.publico = e.target.value))}
          placeholder="Ex.: Criativas de 25–38 anos, autônomas, cansadas de métodos genéricos, querem rotina que caiba na vida real."
        />
      </Field>

      <Field label="Promessa do perfil em 1 frase" hint="‘Quem me segue ganha X.’">
        <Input
          value={n.promessa ?? ""}
          onChange={(e) => set((c) => (c.nicho.promessa = e.target.value))}
          placeholder="Ex.: Quem me segue aprende a terminar o dia sem culpa."
        />
      </Field>

      <section>
        <div className="label-cap mb-2">O que mais performa no nicho</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Formatos">
            <div className="flex flex-wrap gap-2">
              {formatos.map((f) => (
                <Chip
                  key={f}
                  selected={n.performaFormatos.includes(f)}
                  onClick={() => set((c) => (c.nicho.performaFormatos = toggleList(c.nicho.performaFormatos, f)))}
                >
                  {f}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Temas que performam" optional>
            <Textarea
              rows={2}
              value={n.performaTemas ?? ""}
              onChange={(e) => set((c) => (c.nicho.performaTemas = e.target.value))}
              placeholder="Ex.: rotinas, antes-e-depois, erros honestos"
            />
          </Field>
          <Field label="Ganchos que funcionam" optional>
            <Textarea
              rows={2}
              value={n.performaGanchos ?? ""}
              onChange={(e) => set((c) => (c.nicho.performaGanchos = e.target.value))}
              placeholder="Ex.: ‘Pare de X e comece a Y’, listas de 3, perguntas diretas"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Duração" optional>
              <Input
                value={n.performaDuracao ?? ""}
                onChange={(e) => set((c) => (c.nicho.performaDuracao = e.target.value))}
                placeholder="30–60s"
              />
            </Field>
            <Field label="Frequência" optional>
              <Input
                value={n.performaFrequencia ?? ""}
                onChange={(e) => set((c) => (c.nicho.performaFrequencia = e.target.value))}
                placeholder="4x/sem"
              />
            </Field>
            <Field label="Horários" optional>
              <Input
                value={n.performaHorarios ?? ""}
                onChange={(e) => set((c) => (c.nicho.performaHorarios = e.target.value))}
                placeholder="19h–21h"
              />
            </Field>
          </div>
        </div>
      </section>

      <Field label="Concorrentes / referências (3 a 5)" hint="Separados por vírgula ou Enter.">
        <TagInput
          value={n.concorrentes}
          onChange={(v) => set((c) => (c.nicho.concorrentes = v))}
          placeholder="Ex.: @perfil1, @perfil2"
          max={10}
        />
      </Field>

      <Field label="O que o seu influenciador faz de diferente">
        <Textarea
          rows={3}
          value={n.diferencial ?? ""}
          onChange={(e) => set((c) => (c.nicho.diferencial = e.target.value))}
          placeholder="Ex.: usa humor amargo onde o nicho é motivacional; mostra o processo real, não só o resultado."
        />
      </Field>

      <Field label="Plataformas prioritárias">
        <div className="flex flex-wrap gap-2">
          {plataformas.map((p) => (
            <Chip
              key={p}
              selected={n.plataformas.includes(p)}
              onClick={() => set((c) => (c.nicho.plataformas = toggleList(c.nicho.plataformas, p)))}
            >
              {p}
            </Chip>
          ))}
        </div>
      </Field>

      <Field
        label="Pilares de conteúdo"
        hint={`Entre 3 e 5 pilares, com % somando 100. Soma atual: ${somaPilares}%`}
      >
        <div className="grid gap-2">
          {n.pilares.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="Ex.: Rotina"
                value={p.nome}
                onChange={(e) => set((c) => (c.nicho.pilares[i].nome = e.target.value))}
              />
              <Input
                type="number"
                min={0}
                max={100}
                className="w-24"
                placeholder="%"
                value={p.pct || ""}
                onChange={(e) => set((c) => (c.nicho.pilares[i].pct = Number(e.target.value) || 0))}
              />
              <button
                type="button"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-line bg-bg-elev text-ink-mute hover:text-err"
                onClick={() => set((c) => { c.nicho.pilares.splice(i, 1); })}
                aria-label="Remover pilar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {n.pilares.length < 5 ? (
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => set((c) => { c.nicho.pilares.push({ nome: "", pct: 0 }); })}
            >
              <Plus className="w-4 h-4" /> Adicionar pilar
            </Button>
          ) : null}
        </div>
      </Field>
    </div>
  );
}
