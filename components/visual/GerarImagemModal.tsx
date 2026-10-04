"use client";

import { useEffect } from "react";
import { Image as ImageIcon, Sparkles, X } from "lucide-react";
import type { Character } from "@/lib/types";
import { GerarImagem } from "@/components/revisao/GerarImagem";

interface Props {
  open: boolean;
  onClose: () => void;
  character: Character;
}

export function GerarImagemModal({ open, onClose, character }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card w-full max-w-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 inline-flex items-center justify-center rounded-full border border-line hover:border-ink text-ink-mute hover:text-ink"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="mb-4 flex items-center gap-2.5">
          <span className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-accent text-bg">
            <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <div>
            <div className="eyebrow-accent inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Gerar imagem
            </div>
            <h2 className="display text-xl sm:text-2xl text-ink uppercase leading-tight">
              Prompt pronto para qualquer IA
            </h2>
          </div>
        </div>
        <GerarImagem character={character} />
      </div>
    </div>
  );
}
