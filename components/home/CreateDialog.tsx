"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardPaste, Copy, ExternalLink, Sparkles, UserPlus, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { useCharacters } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { AI_ENABLED } from "@/lib/ai/flag";
import { buildPromptClaude, parseRespostaClaude } from "@/lib/prompts/gerar-no-claude";
import { copyToClipboard } from "@/lib/export";

type Mode = "pick" | "claude" | "expand" | "loading";

const LOADING_STEPS = [
  "Lendo o contexto",
  "Construindo identidade",
  "Escolhendo gostos e repertório",
  "Afinando a voz",
  "Montando pilares de conteúdo",
  "Fechando a ficha",
];

const PLACEHOLDER =
  "Ex.: Influenciadora de finanças pra jovens de 20 a 25 anos, tom debochado, mora em São Paulo, atua no Instagram e TikTok, referência em Nathalia Arcuri mas mais ácida. Odeia conselho genérico de 'guarde 10% do salário'. Fala do dia a dia dela com freelas e boletos.";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pick");
  const [contexto, setContexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [ideia, setIdeia] = useState("");
  const [resposta, setResposta] = useState("");
  const [erroImport, setErroImport] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const create = useCharacters((s) => s.createCharacter);
  const applySuggestions = useCharacters((s) => s.applySuggestions);
  const updateChar = useCharacters((s) => s.update);

  const prompt = useMemo(() => buildPromptClaude(ideia), [ideia]);

  useEffect(() => {
    if (!open) return;
    setMode("pick");
    setContexto("");
    setErro(null);
    setLoadingStep(0);
    setIdeia("");
    setResposta("");
    setErroImport(null);
    setCopiado(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (mode !== "loading") return;
    const t = setInterval(() => {
      setLoadingStep((i) => (i < LOADING_STEPS.length - 1 ? i + 1 : i));
    }, 1800);
    return () => clearInterval(t);
  }, [mode]);

  if (!open) return null;

  function onCriarDoZero() {
    const id = create();
    onClose();
    router.push(`/personagem/${id}`);
  }

  async function onCopiarPrompt() {
    const ok = await copyToClipboard(prompt);
    if (!ok) {
      setErroImport("Não deu para copiar automaticamente. Abra “Ver o prompt” e copie à mão.");
      return;
    }
    setErroImport(null);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function onImportar() {
    const r = parseRespostaClaude(resposta);
    if (!r.ok) {
      setErroImport(r.error);
      return;
    }
    const id = create();
    applySuggestions(id, r.suggestions, "Importado do Claude");
    if (r.pontosEmAberto.length) {
      updateChar(id, (c) => {
        c.pontosEmAberto = r.pontosEmAberto;
      });
    }
    onClose();
    router.push(`/personagem/${id}`);
  }

  async function onGerar() {
    const ctx = contexto.trim();
    if (ctx.length < 10) {
      setErro("Escreva pelo menos uma frase sobre o personagem.");
      return;
    }
    setErro(null);
    setMode("loading");
    setLoadingStep(0);
    try {
      const res = await fetch("/api/expandir-ficha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexto: ctx }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMode("expand");
        setErro(data?.error ?? "Falha ao expandir. Tente de novo.");
        return;
      }
      const id = create();
      applySuggestions(id, data.suggestions ?? [], "Expansão inicial");
      if (data.pontosEmAberto?.length) {
        updateChar(id, (c) => {
          c.pontosEmAberto = data.pontosEmAberto;
        });
      }
      onClose();
      router.push(`/personagem/${id}`);
    } catch (e) {
      setMode("expand");
      setErro((e as Error)?.message ?? "Falha de rede. Tente de novo.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && mode !== "loading") onClose();
      }}
    >
      <div className="card max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {mode !== "loading" && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 inline-flex items-center justify-center rounded-full border border-line hover:border-ink text-ink-mute hover:text-ink"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {mode === "pick" && (
          <div>
            <div className="eyebrow-accent mb-2">Como você quer começar?</div>
            <h2 className="display text-2xl sm:text-3xl text-ink uppercase leading-tight">
              Vamos criar seu personagem.
            </h2>
            <p className="text-ink-mute mt-3 leading-relaxed">
              Preencha campo a campo, ou, se ainda não tem a ideia fechada, pegue um prompt pronto
              para o Claude montar a ficha por você.
            </p>

            <div
              className={cn(
                "grid gap-3 mt-6",
                AI_ENABLED ? "sm:grid-cols-3" : "sm:grid-cols-2"
              )}
            >
              <Option
                icon={<UserPlus className="w-5 h-5" />}
                title="Criar manualmente"
                description="Vai direto ao wizard em branco. Você preenche cada campo no seu ritmo."
                onClick={onCriarDoZero}
              />
              <Option
                icon={<ClipboardPaste className="w-5 h-5" />}
                title="Gerar no Claude"
                description="Copie um prompt pronto, rode no seu Claude e cole a resposta aqui para preencher a ficha."
                onClick={() => setMode("claude")}
                accent
              />
              {AI_ENABLED ? (
                <Option
                  icon={<Wand2 className="w-5 h-5" />}
                  title="Expandir com IA do site"
                  description="Escreva um contexto curto e a IA do site preenche a ficha."
                  onClick={() => setMode("expand")}
                />
              ) : null}
            </div>
          </div>
        )}

        {mode === "claude" && (
          <div>
            <div className="eyebrow-accent mb-2 inline-flex items-center gap-2">
              <ClipboardPaste className="w-3.5 h-3.5" />
              Gerar no Claude
            </div>
            <h2 className="display text-2xl sm:text-3xl text-ink uppercase leading-tight">
              Pegue o prompt, rode no Claude e traga a resposta.
            </h2>

            <div className="mt-6 grid gap-6">
              <Step n={1} titulo="Conte sua ideia (opcional)">
                <Field
                  label="Ideia do personagem"
                  counter={{ value: ideia.length, max: 1500 }}
                  hint="Se deixar vazio, o Claude vai te fazer algumas perguntas antes de montar a ficha."
                >
                  <Textarea
                    rows={4}
                    maxLength={1500}
                    placeholder={PLACEHOLDER}
                    value={ideia}
                    onChange={(e) => setIdeia(e.target.value)}
                  />
                </Field>
              </Step>

              <Step n={2} titulo="Copie o prompt e cole no Claude">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="accent" onClick={onCopiarPrompt}>
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiado ? "Copiado!" : "Copiar prompt"}
                  </Button>
                  <a
                    href="https://claude.ai/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold rounded-full h-10 px-5 text-sm bg-transparent text-ink border border-line-strong hover:bg-panel transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir o Claude
                  </a>
                </div>
                <details className="mt-3 group">
                  <summary className="text-[13px] text-ink-mute hover:text-ink cursor-pointer font-semibold">
                    Ver o prompt
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-xl border border-line bg-bg p-3.5 text-[12px] mono whitespace-pre-wrap leading-relaxed text-ink/90">
                    {prompt}
                  </pre>
                </details>
              </Step>

              <Step n={3} titulo="Cole a resposta do Claude">
                <Field
                  label="Resposta do Claude"
                  hint="Pode colar a mensagem inteira, o site acha o JSON sozinho."
                >
                  <Textarea
                    rows={6}
                    placeholder={'{ "identidade": { "nome": "..." }, ... }'}
                    value={resposta}
                    onChange={(e) => {
                      setResposta(e.target.value);
                      setErroImport(null);
                    }}
                    className="mono text-[12px]"
                  />
                </Field>
                {erroImport ? (
                  <div className="mt-3 rounded-xl border border-pink/40 bg-pink/10 px-3.5 py-2.5 text-sm text-pink">
                    {erroImport}
                  </div>
                ) : null}
              </Step>
            </div>

            <div className="flex justify-between items-center mt-6 gap-3 flex-wrap">
              <Button variant="ghost" onClick={() => setMode("pick")}>
                Voltar
              </Button>
              <Button variant="accent" onClick={onImportar} disabled={!resposta.trim()}>
                <Sparkles className="w-4 h-4" />
                Criar personagem
              </Button>
            </div>
          </div>
        )}

        {mode === "expand" && (
          <div>
            <div className="eyebrow-accent mb-2 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Expandir com IA
            </div>
            <h2 className="display text-2xl sm:text-3xl text-ink uppercase leading-tight">
              Escreva um contexto curto.
            </h2>
            <p className="text-ink-mute mt-3 leading-relaxed">
              Nome, nicho, público, tom, referências — o que vier à cabeça. Depois você edita tudo.
            </p>

            <div className="mt-5">
              <Field
                label="Contexto do personagem"
                counter={{ value: contexto.length, max: 2000 }}
                hint="Entre 10 e 2000 caracteres. Quanto mais específico, menos clichê."
              >
                <Textarea
                  rows={8}
                  maxLength={2000}
                  placeholder={PLACEHOLDER}
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                />
              </Field>

              {erro ? (
                <div className="mt-3 rounded-xl border border-pink/40 bg-pink/10 px-3.5 py-2.5 text-sm text-pink">
                  {erro}
                </div>
              ) : null}

              <div className="flex justify-between items-center mt-5 gap-3 flex-wrap">
                <Button variant="ghost" onClick={() => setMode("pick")}>
                  Voltar
                </Button>
                <Button variant="accent" onClick={onGerar} disabled={contexto.trim().length < 10}>
                  <Sparkles className="w-4 h-4" />
                  Gerar ficha
                </Button>
              </div>
            </div>
          </div>
        )}

        {mode === "loading" && (
          <div className="text-center py-6">
            <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/15 border border-accent/50 mb-5">
              <Sparkles className="w-7 h-7 text-accent animate-pulse" />
            </div>
            <h2 className="display text-2xl text-ink uppercase">Montando o personagem…</h2>
            <p className="text-ink-mute mt-3">Isso leva uns 10–20 segundos.</p>

            <ul className="mt-6 text-left max-w-md mx-auto grid gap-2">
              {LOADING_STEPS.map((label, i) => {
                const done = i < loadingStep;
                const active = i === loadingStep;
                return (
                  <li
                    key={label}
                    className={cn(
                      "flex items-center gap-3 text-sm px-3.5 py-2 rounded-xl border",
                      active
                        ? "border-accent bg-accent/5 text-ink font-semibold"
                        : done
                        ? "border-line bg-panel text-ink-dim line-through"
                        : "border-line bg-panel text-ink-mute"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 inline-flex items-center justify-center rounded-full text-[10px] mono font-bold",
                        active
                          ? "bg-accent text-bg"
                          : done
                          ? "bg-ok/20 text-ok"
                          : "bg-card text-ink-dim"
                      )}
                    >
                      {done ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    {label}…
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-6 w-6 inline-flex items-center justify-center rounded-full bg-accent/15 text-accent mono text-[12px] font-bold">
          {n}
        </span>
        <h3 className="font-semibold text-ink">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

function Option({
  icon,
  title,
  description,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border p-5 transition group",
        accent
          ? "border-accent bg-accent/5 hover:bg-accent/10 shadow-glow"
          : "border-line bg-panel hover:border-line-strong hover:bg-card"
      )}
    >
      <div
        className={cn(
          "inline-flex items-center justify-center h-10 w-10 rounded-full mb-3",
          accent ? "bg-accent text-bg" : "bg-card text-ink"
        )}
      >
        {icon}
      </div>
      <div className="display text-base uppercase text-ink tracking-tight">{title}</div>
      <div className="text-[13px] text-ink-mute mt-1.5 leading-relaxed">{description}</div>
    </button>
  );
}
