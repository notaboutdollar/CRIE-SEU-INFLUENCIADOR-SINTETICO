"use client";

import { forwardRef } from "react";
import type { Character } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  character: Character;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export const FichaPoster = forwardRef<HTMLDivElement, Props>(function FichaPoster(
  { character: c, orientation = "vertical", className },
  ref
) {
  const vertical = orientation === "vertical";
  return (
    <div
      ref={ref}
      className={cn(
        "bg-bg text-ink p-12",
        vertical ? "w-[720px] min-h-[1020px]" : "w-[1180px] min-h-[720px]",
        className
      )}
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header className="mb-10 flex items-start gap-6">
        <div className="h-28 w-28 rounded-2xl overflow-hidden bg-paper border border-line shrink-0 shadow-card">
          {c.visual.referencias[0]?.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.visual.referencias[0].dataUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">✨</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase mono text-accent-strong" style={{ letterSpacing: "0.14em" }}>
            Ficha do Influenciador Sintético
          </div>
          <h1
            className="text-5xl font-bold mt-1 leading-[1.05] tracking-tight text-ink"
            style={{ fontFamily: "Fraunces, Georgia, serif", letterSpacing: "-0.02em" }}
          >
            {c.identidade.nome || "Sem nome"}
          </h1>
          {c.identidade.bio ? (
            <p className="text-[16px] text-[#3a3a3a] mt-3 leading-relaxed italic">
              “{c.identidade.bio}”
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
            {c.identidade.genero && <Tag>{c.identidade.genero}</Tag>}
            {c.identidade.forma && <Tag>{c.identidade.forma}</Tag>}
            {c.identidade.idadeAparente && <Tag>{c.identidade.idadeAparente}</Tag>}
            {c.identidade.cidade && <Tag>{c.identidade.cidade}</Tag>}
            {c.identidade.idioma && <Tag>{c.identidade.idioma}</Tag>}
          </div>
        </div>
      </header>

      <div className={cn("grid gap-5", vertical ? "grid-cols-2" : "grid-cols-3")}>
        <Block title="Visual">
          <KV label="Traço" value={c.visual.traco} />
          <KV label="Cabelo" value={c.visual.cabelo} />
          <KV label="Pele" value={c.visual.pele} />
          <KV label="Olhos" value={c.visual.olhos} />
          <KV label="Roupa" value={c.visual.roupa} />
          <KV label="Acessórios" value={c.visual.acessorios} />
          <KV label="Paleta" value={c.visual.paleta} />
          <KV label="Nunca mostrar" value={c.visual.negativos} />
        </Block>

        <Block title="Personalidade">
          <KV label="Arquétipo" value={c.soul.arquetipo} />
          {c.soul.adjetivos.length ? (
            <KV label="Adjetivos" value={c.soul.adjetivos.join(" · ")} />
          ) : null}
          <KV label="Defende" value={c.soul.valoresDefende} />
          <KV label="Combate" value={c.soul.valoresCombate} />
          <KV label="Medos" value={c.soul.medos} />
          <KV label="Defeitos" value={c.soul.defeitos} />
          <KV label="Origem" value={c.soul.origem} />
        </Block>

        <Block title="Nicho e Estratégia">
          <KV label="Nicho" value={joined(c.nicho.principal, c.nicho.subnicho)} />
          <KV label="Público" value={c.nicho.publico} />
          <KV label="Promessa" value={c.nicho.promessa} />
          <KV label="Diferencial" value={c.nicho.diferencial} />
          {c.nicho.plataformas.length ? (
            <KV label="Plataformas" value={c.nicho.plataformas.join(" · ")} />
          ) : null}
          {c.nicho.pilares.length ? (
            <KV
              label="Pilares"
              value={c.nicho.pilares.map((p) => `${p.nome || "—"} ${p.pct}%`).join(" · ")}
            />
          ) : null}
        </Block>

        <Block title="Voz">
          <KV label="Tom" value={`Formal ${c.voz.tomFormalidade} · Humor ${c.voz.tomHumor} · Complexidade ${c.voz.tomComplexidade}`} />
          {c.voz.girias.length ? <KV label="Gírias" value={c.voz.girias.join(" · ")} /> : null}
          {c.voz.bordoes.length ? <KV label="Bordões" value={c.voz.bordoes.join(" · ")} /> : null}
          {c.voz.proibidas.length ? <KV label="Proibidas" value={c.voz.proibidas.join(" · ")} /> : null}
          <KV label="Abertura" value={c.voz.abertura} />
          <KV label="Fechamento" value={c.voz.fechamento} />
        </Block>

        <Block title="Monetização">
          {c.monetizacao.modelos.length ? (
            <KV label="Modelos" value={c.monetizacao.modelos.join(" · ")} />
          ) : null}
          {c.monetizacao.marcasOk.length ? (
            <KV label="Marcas OK" value={c.monetizacao.marcasOk.join(" · ")} />
          ) : null}
          {c.monetizacao.marcasNao.length ? (
            <KV label="Marcas NÃO" value={c.monetizacao.marcasNao.join(" · ")} />
          ) : null}
          <KV label="Limites" value={c.monetizacao.limites} />
          <KV label="Transparência" value={c.monetizacao.transparencia} />
        </Block>

        <Block title="Reações">
          <KV label="Elogio" value={c.soul.reacoes.elogio} />
          <KV label="Crítica" value={c.soul.reacoes.critica} />
          <KV label="Polêmica" value={c.soul.reacoes.polemica} />
          <KV label="Hater" value={c.soul.reacoes.hater} />
        </Block>
      </div>

      <footer
        className="mt-12 pt-6 border-t border-line text-[10px] font-bold text-muted uppercase mono"
        style={{ letterSpacing: "0.14em" }}
      >
        Ficha gerada por Crie seu Influenciador Sintético
      </footer>
    </div>
  );
});

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-line bg-paper text-muted capitalize font-medium">
      {children}
    </span>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-5 shadow-card">
      <h3
        className="text-[11px] font-bold text-accent-strong mb-3 uppercase mono"
        style={{ letterSpacing: "0.14em" }}
      >
        {title}
      </h3>
      <div className="space-y-2.5 text-[14px] leading-relaxed">{children}</div>
    </section>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  if (!value || !String(value).trim()) return null;
  return (
    <div>
      <div
        className="text-[10px] uppercase mono text-muted font-semibold"
        style={{ letterSpacing: "0.12em" }}
      >
        {label}
      </div>
      <div className="text-ink mt-0.5">{value}</div>
    </div>
  );
}

function joined(a?: string, b?: string) {
  if (a && b) return `${a} · ${b}`;
  return a || b;
}
