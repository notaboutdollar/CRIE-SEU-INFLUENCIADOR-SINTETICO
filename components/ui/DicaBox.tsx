"use client";

import { ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function DicaBox({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-accent/25 bg-accent/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left"
        aria-expanded={open}
      >
        <Lightbulb className="w-4 h-4 text-accent" />
        <span className="label-cap !text-accent">Dica</span>
        <ChevronDown
          className={cn("w-4 h-4 ml-auto text-accent transition", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="px-3.5 pb-3.5 pt-0 text-[14px] text-ink/90 leading-relaxed">{children}</div>
      ) : null}
    </div>
  );
}
