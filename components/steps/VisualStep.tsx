"use client";

import { useRef } from "react";
import { nanoid } from "nanoid";
import { ImagePlus, X } from "lucide-react";
import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { CardChoice } from "@/components/ui/CardChoice";
import { tracos } from "@/data/choices";
import type { ReferenciaImagem } from "@/lib/types";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export function VisualStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  const inputRef = useRef<HTMLInputElement>(null);
  if (!character) return null;
  const v = character.visual;

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const novos: ReferenciaImagem[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_SIZE) {
        alert(`${f.name}: imagem maior que 4 MB — reduza antes.`);
        continue;
      }
      const dataUrl = await readAsDataUrl(f);
      novos.push({ id: nanoid(8), name: f.name, dataUrl, size: f.size });
    }
    if (novos.length) {
      set((c) => {
        c.visual.referencias = [...c.visual.referencias, ...novos];
      });
    }
  }

  function removerRef(refId: string) {
    set((c) => {
      c.visual.referencias = c.visual.referencias.filter((r) => r.id !== refId);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <Field label="Traço / estilo" hint="Cards são placeholders — na v2 vem pré-visualização com arte real.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tracos.map((t) => (
            <CardChoice
              key={t.value}
              title={t.label}
              description={t.descricao}
              selected={v.traco === t.value}
              onClick={() => set((c) => (c.visual.traco = t.value))}
            />
          ))}
        </div>
      </Field>

      <Field
        label="Imagens de referência"
        hint="Mínimo 1 para marcar o personagem como completo. Até 4 MB por imagem."
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {v.referencias.map((r) => (
            <div
              key={r.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-line bg-bg group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.dataUrl} alt={r.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removerRef(r.id)}
                className="absolute top-1.5 right-1.5 h-7 w-7 inline-flex items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                aria-label={`Remover ${r.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-line-strong hover:border-accent hover:bg-accent-soft/40 transition flex flex-col items-center justify-center text-muted hover:text-accent-strong gap-2"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs">Adicionar</span>
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Cabelo" optional>
          <Input
            placeholder="Ex.: Cacheado, cor cobre, altura dos ombros"
            value={v.cabelo ?? ""}
            onChange={(e) => set((c) => (c.visual.cabelo = e.target.value))}
          />
        </Field>
        <Field label="Pele" optional>
          <Input
            placeholder="Ex.: Pele quente, sardas no nariz"
            value={v.pele ?? ""}
            onChange={(e) => set((c) => (c.visual.pele = e.target.value))}
          />
        </Field>
        <Field label="Olhos" optional>
          <Input
            placeholder="Ex.: Castanhos, levemente puxados"
            value={v.olhos ?? ""}
            onChange={(e) => set((c) => (c.visual.olhos = e.target.value))}
          />
        </Field>
        <Field label="Estilo de roupa" optional>
          <Input
            placeholder="Ex.: Oversize vintage com peças coloridas"
            value={v.roupa ?? ""}
            onChange={(e) => set((c) => (c.visual.roupa = e.target.value))}
          />
        </Field>
        <Field label="Acessórios" optional>
          <Input
            placeholder="Ex.: Óculos redondo, anéis grandes"
            value={v.acessorios ?? ""}
            onChange={(e) => set((c) => (c.visual.acessorios = e.target.value))}
          />
        </Field>
        <Field label="Traços marcantes" optional>
          <Input
            placeholder="Ex.: Tatuagem no antebraço, piercing no septo"
            value={v.tracosMarcantes ?? ""}
            onChange={(e) => set((c) => (c.visual.tracosMarcantes = e.target.value))}
          />
        </Field>
      </div>

      <Field label="Paleta de cores" optional hint="Use nomes, hex ou descrição livre.">
        <Input
          placeholder="Ex.: Terracota, bege, verde-oliva e um toque de azul petróleo"
          value={v.paleta ?? ""}
          onChange={(e) => set((c) => (c.visual.paleta = e.target.value))}
        />
      </Field>

      <Field
        label="O que NUNCA deve aparecer na imagem"
        hint="Negative prompt. Entre com elementos a evitar."
      >
        <Textarea
          rows={3}
          placeholder="Ex.: logotipos, marcas d'água, texto, mãos extras, cenários corporativos"
          value={v.negativos ?? ""}
          onChange={(e) => set((c) => (c.visual.negativos = e.target.value))}
        />
      </Field>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
