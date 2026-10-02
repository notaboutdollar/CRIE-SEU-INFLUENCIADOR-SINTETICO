"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, UserPlus, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { useCharacters } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { AI_ENABLED } from "@/lib/ai/flag";

type Mode = "pick" | "scratch" | "expand" | "loading";

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
  const create = useCharacters((s) => s.createCharacter);
  const applySuggestions = useCharacters((s) => s.applySuggestions);
  const updateChar = useCharacters((s) => s.update);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setContexto("");
    setErro(null);
    setLoadingStep(0);
    // Com a IA desligada, não faz sentido mostrar a tela de escolha —
    // cria direto o personagem em branco e vai pro wizard.
    if (!AI_ENABLED) {
      const id = create();
      onClose();
      router.push(`/personagem/${id}`);
      return;
    }
    setMode("pick");
  }, [open, create, onClose, router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // "Carregamento progressivo" — anima as mensagens enquanto a request roda
  useEffect(() => {
    if (mode !== "loading") return;
    const t = setInterval(() => {
      setLoadingStep((i) => (i < LOADING_STEPS.length - 1 ? i + 1 : i));
    }, 1800);
    return () => clearInterval(t);
  }, [mode]);

  if (!open) return null;

  async function onCriarDoZero() {
    const id = create();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && mode !== "loading") onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="card max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
      >
        {mode !== "loading" && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 inline-flex items-center justify-center rounded-full border border-line hover:border-ink text-muted hover:text-ink"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {mode === "pick" && (
          <div>
            <div className="eyebrow-accent mb-2">Como você quer começar?</div>
            <h2 className="serif text-2xl sm:text-3xl text-ink leading-tight">
              Vamos criar seu personagem.
            </h2>
            <p className="text-muted mt-2 leading-relaxed">
              Dois caminhos: montar manualmente, campo a campo, ou escrever um contexto curto e deixar a IA preencher pra você revisar.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <Option
                icon={<UserPlus className="w-5 h-5" />}
                title="Começar do zero"
                description="Vai direto ao wizard em branco. Você preenche cada campo no seu ritmo."
                onClick={onCriarDoZero}
              />
              <Option
                icon={<Wand2 className="w-5 h-5" />}
                title="Expandir a partir de uma ideia"
                description="Escreve um contexto curto. A IA preenche a ficha; você revisa as sugestões."
                onClick={() => setMode("expand")}
                accent
              />
            </div>
          </div>
        )}

        {mode === "expand" && (
          <div>
            <div className="eyebrow-accent mb-2 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Expandir com IA
            </div>
            <h2 className="serif text-2xl sm:text-3xl text-ink leading-tight">
              Escreva um contexto curto.
            </h2>
            <p className="text-muted mt-2 leading-relaxed">
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
                <div className="mt-3 rounded-xl border border-warn/40 bg-warn-soft px-3.5 py-2.5 text-sm text-warn">
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
            <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent-soft border border-accent/30 mb-5">
              <Sparkles className="w-7 h-7 text-accent-strong animate-pulse" />
            </div>
            <h2 className="serif text-2xl text-ink">Montando o personagem…</h2>
            <p className="text-muted mt-2">Isso leva uns 10–20 segundos.</p>

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
                        ? "border-accent bg-accent-soft/40 text-ink font-semibold"
                        : done
                        ? "border-line bg-paper text-muted line-through"
                        : "border-line bg-paper text-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 inline-flex items-center justify-center rounded-full text-[10px] mono font-bold",
                        active
                          ? "bg-accent text-white"
                          : done
                          ? "bg-ok-soft text-ok"
                          : "bg-bg text-muted"
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
          ? "border-accent bg-accent-soft/40 hover:bg-accent-soft/70"
          : "border-line bg-paper hover:border-ink/40"
      )}
    >
      <div
        className={cn(
          "inline-flex items-center justify-center h-10 w-10 rounded-full mb-3",
          accent ? "bg-accent text-white" : "bg-bg text-ink"
        )}
      >
        {icon}
      </div>
      <div className="serif text-lg text-ink">{title}</div>
      <div className="text-[14px] text-muted mt-1 leading-relaxed">{description}</div>
    </button>
  );
}
