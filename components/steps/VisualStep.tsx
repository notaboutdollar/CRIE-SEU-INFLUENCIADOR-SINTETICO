"use client";

import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Image as ImageIcon, ImagePlus, User, X } from "lucide-react";
import { useCharacter } from "@/lib/useCharacter";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import type { ReferenciaImagem } from "@/lib/types";
import { GerarImagem } from "@/components/revisao/GerarImagem";
import { cn } from "@/lib/cn";
import type { TipoImagem } from "@/lib/prompts/gerar-imagem";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export function VisualStep({ id }: { id: string }) {
  const { character, set } = useCharacter(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipoImagem, setTipoImagem] = useState<TipoImagem>("retrato");
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
      {/* Seletor de modo: Retrato de frente / Card de referência */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTipoImagem("retrato")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full h-10 px-5 text-sm font-bold transition active:translate-y-px",
            tipoImagem === "retrato"
              ? "bg-accent text-bg shadow-glow"
              : "bg-panel border border-line text-ink-mute hover:text-ink hover:border-line-strong"
          )}
        >
          <User className="w-4 h-4" strokeWidth={2.5} />
          Imagem de frente
        </button>
        <button
          type="button"
          onClick={() => setTipoImagem("referencia")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full h-10 px-5 text-sm font-bold transition active:translate-y-px",
            tipoImagem === "referencia"
              ? "bg-accent text-bg shadow-glow"
              : "bg-panel border border-line text-ink-mute hover:text-ink hover:border-line-strong"
          )}
        >
          <ImageIcon className="w-4 h-4" strokeWidth={2.5} />
          Card de referência
        </button>
      </div>

      {/* Prompt inline */}
      <GerarImagem character={character} tipo={tipoImagem} />

      <div className="border-t border-line" />

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
            className="aspect-square rounded-xl border-2 border-dashed border-line-strong hover:border-accent hover:bg-accent/5 transition flex flex-col items-center justify-center text-ink-dim hover:text-accent gap-2"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs">Adicionar</span>
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Cabelo" fieldId="visual.cabelo" optional>
          <Input
            placeholder="Ex.: Cacheado, cor cobre, altura dos ombros"
            value={v.cabelo ?? ""}
            onChange={(e) => set((c) => (c.visual.cabelo = e.target.value))}
          />
        </Field>
        <Field label="Pele" fieldId="visual.pele" optional>
          <Input
            placeholder="Ex.: Pele quente, sardas no nariz"
            value={v.pele ?? ""}
            onChange={(e) => set((c) => (c.visual.pele = e.target.value))}
          />
        </Field>
        <Field label="Olhos" fieldId="visual.olhos" optional>
          <Input
            placeholder="Ex.: Castanhos, levemente puxados"
            value={v.olhos ?? ""}
            onChange={(e) => set((c) => (c.visual.olhos = e.target.value))}
          />
        </Field>
        <Field label="Estilo de roupa" fieldId="visual.roupa" optional>
          <Input
            placeholder="Ex.: Oversize vintage com peças coloridas"
            value={v.roupa ?? ""}
            onChange={(e) => set((c) => (c.visual.roupa = e.target.value))}
          />
        </Field>
        <Field label="Acessórios" fieldId="visual.acessorios" optional>
          <Input
            placeholder="Ex.: Óculos redondo, anéis grandes"
            value={v.acessorios ?? ""}
            onChange={(e) => set((c) => (c.visual.acessorios = e.target.value))}
          />
        </Field>
        <Field label="Traços marcantes" fieldId="visual.tracosMarcantes" optional>
          <Input
            placeholder="Ex.: Tatuagem no antebraço, piercing no septo"
            value={v.tracosMarcantes ?? ""}
            onChange={(e) => set((c) => (c.visual.tracosMarcantes = e.target.value))}
          />
        </Field>
      </div>

      <Field label="Paleta de cores" fieldId="visual.paleta" optional hint="Use nomes, hex ou descrição livre.">
        <Input
          placeholder="Ex.: Terracota, bege, verde-oliva e um toque de azul petróleo"
          value={v.paleta ?? ""}
          onChange={(e) => set((c) => (c.visual.paleta = e.target.value))}
        />
      </Field>

      <Field
        label="Cenários recorrentes"
        fieldId="visual.cenarios"
        optional
        hint="Onde você costuma vê-lo? Ex.: cozinha com luz amarela, café de bairro, estúdio minimalista."
      >
        <Textarea
          rows={2}
          placeholder="Ex.: cozinha com janela grande ao fundo, café no bairro vila buarque, estúdio com cortina preta"
          value={v.cenarios ?? ""}
          onChange={(e) => set((c) => (c.visual.cenarios = e.target.value))}
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
