"use client";

import { AlertTriangle, Check, HardDrive, Loader2 } from "lucide-react";
import { useSyncStatus } from "@/lib/sync/status";
import { cn } from "@/lib/cn";

const LABELS = {
  local: "Salvo neste navegador",
  loading: "Carregando da conta…",
  saving: "Salvando na conta…",
  saved: "Salvo na conta",
  error: "Erro ao salvar — tentando de novo",
} as const;

export function SyncBadge({ className }: { className?: string }) {
  const status = useSyncStatus((s) => s.status);
  const error = useSyncStatus((s) => s.error);

  const Icon =
    status === "saved"
      ? Check
      : status === "error"
      ? AlertTriangle
      : status === "local"
      ? HardDrive
      : Loader2;

  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-1.5",
        status === "saved" && "!text-ok",
        status === "error" && "!text-pink",
        className
      )}
      title={error ?? undefined}
      aria-live="polite"
    >
      <Icon className={cn("w-3 h-3", (status === "saving" || status === "loading") && "animate-spin")} />
      {LABELS[status]}
    </span>
  );
}
