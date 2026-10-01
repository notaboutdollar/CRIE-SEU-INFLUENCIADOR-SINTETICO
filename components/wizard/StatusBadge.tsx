"use client";

import { cn } from "@/lib/cn";
import type { Status } from "@/lib/completion";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mono",
        status === "completo"
          ? "border-ok/30 bg-ok-soft text-ok"
          : "border-line-strong bg-[#EEE7DB] text-[#7a6b52]"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "completo" ? "bg-ok" : "bg-[#7a6b52]"
        )}
      />
      {status === "completo" ? "Completo" : "Rascunho"}
    </span>
  );
}
