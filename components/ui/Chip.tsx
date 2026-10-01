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
        "px-3.5 h-8 rounded-full text-[13px] font-medium border transition inline-flex items-center",
        selected
          ? "border-accent bg-accent text-white"
          : "border-line bg-paper text-ink hover:border-ink/40",
        className
      )}
    >
      {children}
    </button>
  );
}
