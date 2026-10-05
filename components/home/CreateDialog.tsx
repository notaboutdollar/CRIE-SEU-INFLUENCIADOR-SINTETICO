"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardPaste, Copy, ExternalLink, ImageIcon, ImagePlus, Sparkles, User, UserPlus, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { useCharacters } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { AI_ENABLED } from "@/lib/ai/flag";
import { buildPromptClaude, parseRespostaClaude } from "@/lib/prompts/gerar-no-claude";
import { copyToClipboard } from "@/lib/export";
import { GerarImagem } from "@/components/revisao/GerarImagem";
import type { TipoImagem } from "@/lib/prompts/gerar-imagem";
import { nanoid } from "nanoid";

type Mode = "pick" | "claude" | "imagem" | "expand" | "loading";

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
  const [imagemTipo, setImagemTipo] = useState<TipoImagem>("retrato");
  const [imagemCharId, setImagemCharId] = useState<string | null>(null);

  const imagemInputRef = useRef<HTMLInputElement>(null);

  const create = useCharacters((s) => s.createCharacter);
  const deleteChar = useCharacters((s) => s.deleteCharacter);
  const applySuggestions = useCharacters((s) => s.applySuggestions);
  const updateChar = useCharacters((s) => s.update);

  const imagemChar = useCharacters((s) =>
    imagemCharId ? s.characters.find((c) => c.id === imagemCharId) : undefined
  );

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
    setImagemTipo("retrato");
    setImagemCharId((prev) => {
      if (prev) deleteChar(prev);
      return null;
    });
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

  function handleClose() {
    if (imagemCharId) {
      deleteChar(imagemCharId);
      setImagemCharId(null);
    }
    onClose();
  }

  function onCriarDoZero() {
    const id = create();
    handleClose();
    router.push(`/personagem/${id}`);
  }

  function onComecarPelaImagem() {
    const id = create();
    setImagemCharId(id);
    setMode("imagem");
  }

  function onCriarDoImagem() {
    const id = imagemCharId;
    setImagemCharId(null);
    onClose();
    if (id) router.push(`/personagem/${id}`);
  }

  function onVoltarDoImagem() {
    if (imagemCharId) {
      deleteChar(imagemCharId);
      setImagemCharId(null);
    }
    setMode("pick");
  }

  async function onImagemFiles(files: FileList | null) {
    if (!files || !imagemCharId) return;
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 4 * 1024 * 1024) {
        alert(`${f.name}: maior que 4 MB.`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(f);
      });
      updateChar(imagemCharId, (c) => {
        c.visual.referencias.push({ id: nanoid(8), name: f.name, dataUrl, size: f.size });
      });
    }
  }

  function removerImagemRef(refId: string) {
    if (!imagemCharId) return;
    updateChar(imagemCharId, (c) => {
      c.visual.referencias = c.visual.referencias.filter((r) => r.id !== refId);
    });
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
    applySuggestions(id, r.suggestions, "Importado da IA");
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
        if (e.target === e.currentTarget && mode !== "loading") handleClose();
      }}
    >
      <div className="card max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {mode !== "loading" && (
          <button
            type="button"
            onClick={handleClose}
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
              Três caminhos. Preencha campo a campo, pegue um prompt pronto para uma IA montar a ficha,
              ou comece pela imagem do personagem e depois volte para a identidade.
            </p>

            <div className="grid gap-3 mt-6 sm:grid-cols-3">
              <Option
                icon={<UserPlus className="w-5 h-5" />}
                title="Criar manualmente"
                description="Vai direto ao wizard em branco. Você preenche cada campo no seu ritmo."
                onClick={onCriarDoZero}
              />
              <Option
                icon={<ClipboardPaste className="w-5 h-5" />}
                title="Gerar com IA"
                description="Copie um prompt pronto, rode na IA que você preferir (ChatGPT, Claude, Gemini...) e cole a resposta aqui."
                onClick={() => setMode("claude")}
                accent
              />
              <Option
                icon={<ImageIcon className="w-5 h-5" />}
                title="Começar pela imagem"
                description="Gere o prompt de imagem aqui mesmo, adicione a imagem e vá direto para a ficha."
                onClick={onComecarPelaImagem}
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
              Gerar com IA
            </div>
            <h2 className="display text-2xl sm:text-3xl text-ink uppercase leading-tight">
              Pegue o prompt, rode na IA e traga a resposta.
            </h2>

            <div className="mt-6 grid gap-6">
              <Step n={1} titulo="Conte sua ideia (opcional)">
                <Field
                  label="Ideia do personagem"
                  counter={{ value: ideia.length, max: 1500 }}
                  hint="Se deixar vazio, a IA vai te fazer algumas perguntas antes de montar a ficha."
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

              <Step n={2} titulo="Copie o prompt e cole na sua IA">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="accent" onClick={onCopiarPrompt}>
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiado ? "Copiado!" : "Copiar prompt"}
                  </Button>
                  <IaLink href="https://chat.openai.com/" label="ChatGPT" />
                  <IaLink href="https://claude.ai/new" label="Claude" />
                  <IaLink href="https://gemini.google.com/" label="Gemini" />
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

              <Step n={3} titulo="Cole a resposta da IA">
                <Field
                  label="Resposta da IA"
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

        {mode === "imagem" && imagemChar && (
          <div>
            <div className="eyebrow-accent mb-2 inline-flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />
              Começar pela imagem
            </div>
            <h2 className="display text-2xl sm:text-3xl text-ink uppercase leading-tight">
              Gere a imagem do seu personagem.
            </h2>
            <p className="text-ink-mute mt-3 leading-relaxed">
              Descreva a aparência, copie o prompt e cole no gerador. Depois crie o personagem e complete a ficha.
            </p>

            <div className="mt-6 grid gap-5">
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setImagemTipo("retrato")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full h-10 px-5 text-sm font-bold transition active:translate-y-px",
                    imagemTipo === "retrato"
                      ? "bg-accent text-bg shadow-glow"
                      : "bg-panel border border-line text-ink-mute hover:text-ink hover:border-line-strong"
                  )}
                >
                  <User className="w-4 h-4" strokeWidth={2.5} />
                  Imagem de frente
                </button>
                <button
                  type="button"
                  onClick={() => setImagemTipo("referencia")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full h-10 px-5 text-sm font-bold transition active:translate-y-px",
                    imagemTipo === "referencia"
                      ? "bg-accent text-bg shadow-glow"
                      : "bg-panel border border-line text-ink-mute hover:text-ink hover:border-line-strong"
                  )}
                >
                  <ImageIcon className="w-4 h-4" strokeWidth={2.5} />
                  Card de referência
                </button>
              </div>

              <GerarImagem character={imagemChar} tipo={imagemTipo} />
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <div className="label-cap mb-2 inline-flex items-center gap-2">
                <ImagePlus className="w-3.5 h-3.5" />
                Adicionar imagem gerada
              </div>
              <p className="text-[13px] text-ink-mute mb-3 leading-relaxed">
                Gerou a imagem na IA? Adicione aqui para salvar no personagem.
              </p>
              <input
                ref={imagemInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  onImagemFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="flex gap-3 items-center flex-wrap">
                {imagemChar.visual.referencias.map((r) => (
                  <div
                    key={r.id}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-line bg-bg group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.dataUrl} alt={r.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removerImagemRef(r.id)}
                      className="absolute top-1 right-1 h-6 w-6 inline-flex items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                      aria-label={`Remover ${r.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => imagemInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-line-strong hover:border-accent hover:bg-accent/5 transition flex flex-col items-center justify-center text-ink-dim hover:text-accent gap-1"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px]">Adicionar</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 gap-3 flex-wrap">
              <Button variant="ghost" onClick={onVoltarDoImagem}>
                Voltar
              </Button>
              <Button variant="accent" onClick={onCriarDoImagem}>
                <Sparkles className="w-4 h-4" />
                Ir para o Step 1
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

function IaLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 font-semibold rounded-full h-9 px-3.5 text-[12px] bg-transparent text-ink-mute border border-line hover:border-line-strong hover:text-ink transition"
    >
      <ExternalLink className="w-3 h-3" />
      {label}
    </a>
  );
}
