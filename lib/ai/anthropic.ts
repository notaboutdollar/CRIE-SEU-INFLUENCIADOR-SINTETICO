import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

export function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AIConfigError("Nenhuma chave da Anthropic configurada no servidor.");
  }
  return new Anthropic({ apiKey });
}

export class AIConfigError extends Error {
  code = "ANTHROPIC_KEY_MISSING" as const;
}
export class AIProviderError extends Error {
  code = "ANTHROPIC_PROVIDER" as const;
  constructor(public upstream: unknown, message: string) {
    super(message);
  }
}
export class AIParseError extends Error {
  code = "ANTHROPIC_PARSE" as const;
}

interface AskOptions {
  system: string;
  user: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

/**
 * Chama o modelo e devolve só o texto principal da resposta.
 */
export async function askClaude({
  system,
  user,
  maxTokens = 4096,
  model = DEFAULT_MODEL,
  temperature = 0.9,
}: AskOptions): Promise<string> {
  const client = getClient();
  const t0 = Date.now();
  let res;
  try {
    res = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      temperature,
      messages: [{ role: "user", content: user }],
    });
  } catch (err) {
    throw new AIProviderError(err, "Falha ao chamar a Anthropic. Tente de novo em instantes.");
  }
  const dur = Date.now() - t0;
  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  if (!text) {
    throw new AIParseError("A IA voltou vazia. Tente de novo.");
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`[anthropic] ${model} · ${dur}ms · ${text.length} chars`);
  }
  return text;
}
