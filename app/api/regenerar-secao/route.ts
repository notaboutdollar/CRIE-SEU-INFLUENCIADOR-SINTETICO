import { NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigError, AIParseError, AIProviderError } from "@/lib/ai/anthropic";
import { askJson } from "@/lib/ai/parse";
import { regenerarSecaoPrompt } from "@/lib/ai/prompts";
import { expandirRespostaSchema } from "@/lib/ai/schema";
import { toSuggestions } from "@/lib/ai/flatten";
import { allow, readIp } from "@/lib/ai/rate-limit";
import { stripMetadata } from "@/lib/ai/strip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  character: z.unknown(),
  stepId: z.enum(["identidade", "visual", "soul", "nicho", "voz", "monetizacao"]),
  stepTitulo: z.string(),
  campos: z.array(z.string()).min(1),
  instrucao: z.string().optional(),
  travados: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const ip = readIp(req);
  const gate = allow(ip);
  if (!gate.ok) {
    return NextResponse.json(
      { error: `Muitas chamadas seguidas. Tente de novo em ${gate.retryAfter}s.`, code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof z.ZodError ? e.issues[0].message : "Corpo inválido.", code: "BAD_INPUT" },
      { status: 400 }
    );
  }

  try {
    const ficha = JSON.stringify(stripMetadata(body.character), null, 2);
    const user = await regenerarSecaoPrompt({
      ficha,
      stepId: body.stepId,
      stepTitulo: body.stepTitulo,
      campos: body.campos.join(", "),
      instrucao: body.instrucao,
      travados: body.travados.join(", "),
    });
    const data = await askJson({
      system:
        "Regenere APENAS a seção pedida. Responda com JSON válido no mesmo esquema do fluxo de expansão, mas somente para essa seção. Sem Markdown.",
      user,
      schema: expandirRespostaSchema,
      maxTokens: 4096,
      temperature: 0.9,
    });
    // filtra só sugestões da seção pedida
    const prefix = `${body.stepId}.`;
    const suggestions = toSuggestions(data).filter(
      (s) => s.fieldId === body.stepId || s.fieldId.startsWith(prefix)
    );
    return NextResponse.json({ suggestions });
  } catch (e) {
    if (e instanceof AIConfigError)
      return NextResponse.json({ error: "Chave da Anthropic não configurada.", code: "CONFIG_MISSING" }, { status: 500 });
    if (e instanceof AIProviderError)
      return NextResponse.json({ error: e.message, code: "PROVIDER_ERROR" }, { status: 502 });
    if (e instanceof AIParseError)
      return NextResponse.json({ error: e.message, code: "PARSE_ERROR" }, { status: 502 });
    return NextResponse.json({ error: (e as Error).message, code: "UNKNOWN" }, { status: 500 });
  }
}
