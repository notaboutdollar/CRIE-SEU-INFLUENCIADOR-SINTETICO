"use client";

import { useEffect, useState, use } from "react";
import { Wizard } from "@/components/wizard/Wizard";

export default function PersonagemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="card p-8 text-center text-ink-dim">Carregando…</div>
      </main>
    );
  }
  return <Wizard id={id} />;
}
