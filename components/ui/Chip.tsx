"use client";

import { cn } from "@/lib/cn";

interface Props {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Chip({ selected, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!selected}
      className={cn(
        "px-3 h-8 rounded-full text-sm border transition inline-flex items-center",
        selected
          ? "border-brand bg-brand/15 text-ink"
          : "border-line bg-bg-elev text-ink-mute hover:text-ink hover:border-brand/50",
        className
      )}
    >
      {children}
    </button>
  );
}
