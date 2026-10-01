"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  optional?: boolean;
  htmlFor?: string;
  counter?: { value: number; max: number };
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  optional,
  htmlFor,
  counter,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="label-cap">
          {label}
          {optional ? (
            <span className="text-muted/80 normal-case font-normal tracking-normal"> (opcional)</span>
          ) : null}
        </label>
        {counter ? (
          <span
            className={cn(
              "text-[11px] tabular-nums mono",
              counter.value > counter.max ? "text-warn" : "text-muted/80"
            )}
          >
            {counter.value}/{counter.max}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="text-[13px] text-muted leading-relaxed">{hint}</p> : null}
    </div>
  );
}
