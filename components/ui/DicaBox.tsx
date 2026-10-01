"use client";

import { ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function DicaBox({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-tip/30 bg-tip-bg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left"
        aria-expanded={open}
      >
        <Lightbulb className="w-4 h-4 text-tip" />
        <span className="label-cap !text-tip">Dica</span>
        <ChevronDown
          className={cn("w-4 h-4 ml-auto text-tip-soft transition", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="px-3.5 pb-3.5 pt-0 text-sm text-ink leading-relaxed">{children}</div>
      ) : null}
    </div>
  );
}
