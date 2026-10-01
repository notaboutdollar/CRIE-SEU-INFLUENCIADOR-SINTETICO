"use client";

import { cn } from "@/lib/cn";
import type { Status } from "@/lib/completion";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border",
        status === "completo"
          ? "border-tip/40 bg-tip/10 text-tip-soft"
          : "border-warn/40 bg-warn/10 text-warn"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "completo" ? "bg-tip" : "bg-warn"
        )}
      />
      {status === "completo" ? "Completo" : "Rascunho"}
    </span>
  );
}
