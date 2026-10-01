"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Download, FileJson, FileText, Image as ImageIcon, Info } from "lucide-react";
import { useCharacter } from "@/lib/useCharacter";
import { Button } from "@/components/ui/Button";
import { assembleMasterPrompt, fullMasterPrompt } from "@/lib/prompts";
import { checarConsistencia, status } from "@/lib/completion";
import { copyToClipboard, downloadJson, downloadPdf, downloadPng, downloadText, toMarkdown } from "@/lib/export";
import { FichaPoster } from "@/components/export/FichaPoster";
import { cn } from "@/lib/cn";

type Orient = "vertical" | "horizontal";

export function RevisaoStep({ id }: { id: string }) {
  const { character } = useCharacter(id);
  const [orient, setOrient] = useState<Orient>("vertical");
  const [feedback, setFeedback] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  if (!character) return null;
  const c = character;
  const prompts = assembleMasterPrompt(c);
  const check = checarConsistencia(c);
  const st = status(c);
  const slug = (c.identidade.nome || "personagem").toLowerCase().replace(/\s+/g, "-");

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  }

  async function onCopyMaster() {
    const ok = await copyToClipboard(fullMasterPrompt(c));
    flash(ok ? "Prompt Mestre copiado." : "Não deu para copiar — selecione manualmente.");
  }
  async function onCopyBloco(nome: string, texto: string) {
    const ok = await copyToClipboard(texto);
    flash(ok ? `Prompt de ${nome} copiado.` : "Não deu para copiar.");
  }

  function onExportMd() {
    downloadText(`${slug}.md`, toMarkdown(c), "text/markdown;charset=utf-8");
  }
  function onExportJson() {
    downloadJson(`${slug}.json`, c);
  }
  async function onExportPng() {
    if (!posterRef.current) return;
    await downloadPng(posterRef.current, `${slug}-ficha.png`);
  }
  async function onExportPdf() {
    if (!posterRef.current) return;
    await downloadPdf(posterRef.current, `${slug}-ficha.pdf`);
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-xl border border-line bg-bg-elev p-4 flex items-start gap-3">
        {st === "completo" ? (
          <CheckCircle2 className="w-5 h-5 text-tip-soft mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-warn mt-0.5" />
        )}
        <div className="flex-1">
          <div className="font-medium text-ink">
            {st === "completo"
              ? "Personagem completo. Hora de usar."
              : "Ainda está em rascunho."}
          </div>
          <div className="text-sm text-ink-mute mt-0.5">
            {st === "completo"
              ? "Nome preenchido e pelo menos uma imagem de referência: critérios mínimos cumpridos."
              : "Faltam os obrigatórios: nome do personagem + pelo menos 1 imagem de referência."}
          </div>
        </div>
      </div>

      <section>
        <h3 className="label-cap mb-2">Checklist de consistência</h3>
        {check.length === 0 ? (
          <div className="rounded-xl border border-tip/30 bg-tip-bg p-4 text-sm text-ink">
            Nenhuma inconsistência detectada. Bom trabalho.
          </div>
        ) : (
          <ul className="grid gap-2">
            {check.map((item, i) => (
              <li
                key={i}
                className={cn(
                  "rounded-xl border p-3 text-sm flex gap-3",
                  item.tipo === "contradicao"
                    ? "border-err/40 bg-err/5"
                    : item.tipo === "vazio"
                    ? "border-warn/40 bg-warn/5"
                    : "border-line bg-bg-elev"
                )}
              >
                {item.tipo === "contradicao" ? (
                  <AlertTriangle className="w-4 h-4 text-err mt-0.5 shrink-0" />
                ) : item.tipo === "vazio" ? (
                  <AlertTriangle className="w-4 h-4 text-warn mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-ink-mute mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="text-ink">{item.mensagem}</div>
                  <div className="text-xs text-ink-dim mt-0.5">Campo: {item.campo}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-cap">Ficha do Influenciador</h3>
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setOrient("vertical")}
              className={cn(
                "px-3 h-8 rounded-lg border",
                orient === "vertical"
                  ? "border-brand text-ink bg-brand/10"
                  : "border-line text-ink-mute bg-bg-elev hover:text-ink"
              )}
            >
              Vertical
            </button>
            <button
              type="button"
              onClick={() => setOrient("horizontal")}
              className={cn(
                "px-3 h-8 rounded-lg border",
                orient === "horizontal"
                  ? "border-brand text-ink bg-brand/10"
                  : "border-line text-ink-mute bg-bg-elev hover:text-ink"
              )}
            >
              Horizontal
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-bg-elev p-4 overflow-auto">
          <div
            className="origin-top-left mx-auto"
            style={{
              transform: "scale(0.55)",
              transformOrigin: "top left",
              width: orient === "vertical" ? 720 * 0.55 : 1180 * 0.55,
              height: orient === "vertical" ? 1020 * 0.55 : 720 * 0.55,
            }}
          >
            <div style={{ width: orient === "vertical" ? 720 : 1180 }}>
              <FichaPoster character={c} orientation={orient} />
            </div>
          </div>
        </div>

        {/* Cópia em tamanho real, fora do fluxo, usada para exportar PNG/PDF */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            pointerEvents: "none",
          }}
        >
          <FichaPoster ref={posterRef} character={c} orientation={orient} />
        </div>
      </section>

      <section>
        <h3 className="label-cap mb-3">Prompt Mestre</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <PromptBlock
            title="Imagem"
            text={prompts.imagem}
            onCopy={() => onCopyBloco("imagem", prompts.imagem)}
          />
          <PromptBlock
            title="Roteiro / Texto"
            text={prompts.roteiro}
            onCopy={() => onCopyBloco("roteiro", prompts.roteiro)}
          />
          <PromptBlock
            title="Vídeo"
            text={prompts.video}
            onCopy={() => onCopyBloco("vídeo", prompts.video)}
          />
        </div>
      </section>

      <section className="flex flex-wrap gap-2 items-center">
        <Button onClick={onCopyMaster}>
          <Copy className="w-4 h-4" /> Copiar Prompt Mestre
        </Button>
        <Button variant="secondary" onClick={onExportMd}>
          <FileText className="w-4 h-4" /> Markdown
        </Button>
        <Button variant="secondary" onClick={onExportJson}>
          <FileJson className="w-4 h-4" /> JSON
        </Button>
        <Button variant="secondary" onClick={onExportPng}>
          <ImageIcon className="w-4 h-4" /> PNG da ficha
        </Button>
        <Button variant="secondary" onClick={onExportPdf}>
          <Download className="w-4 h-4" /> PDF da ficha
        </Button>
        {feedback ? (
          <span className="text-xs text-tip-soft ml-2" role="status">
            {feedback}
          </span>
        ) : null}
      </section>
    </div>
  );
}

function PromptBlock({
  title,
  text,
  onCopy,
}: {
  title: string;
  text: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-bg-elev flex flex-col min-h-[180px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-line">
        <span className="label-cap">{title}</span>
        <button
          type="button"
          onClick={onCopy}
          className="text-xs text-ink-mute hover:text-ink inline-flex items-center gap-1"
        >
          <Copy className="w-3.5 h-3.5" /> Copiar
        </button>
      </div>
      <pre className="p-3 text-xs text-ink whitespace-pre-wrap leading-relaxed overflow-auto max-h-80">
        {text}
      </pre>
    </div>
  );
}
