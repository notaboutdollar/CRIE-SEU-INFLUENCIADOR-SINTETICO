import { z } from "zod";

/**
 * Envelope padrão de um campo gerado pela IA: `{ valor, origem }`.
 * `origem` diz se o conteúdo veio do contexto curto do usuário ou é suposição
 * da IA — a UI usa isso para marcar o campo como "Sugestão da IA".
 */
export const origemSchema = z.enum(["contexto", "suposicao"]);

export function envelope<T extends z.ZodTypeAny>(valor: T) {
  return z
    .object({
      valor,
      origem: origemSchema.optional().default("suposicao"),
    })
    .passthrough();
}

const str = envelope(z.string());
const strArr = envelope(z.array(z.string()));
const num = envelope(z.number());

const generoSchema = z.enum(["feminino", "masculino", "nao-binario"]);
const formaSchema = z.enum([
  "humano",
  "humanoide",
  "animal",
  "criatura",
  "objeto",
  "abstrato",
]);
const tracoSchema = z.enum([
  "automatico",
  "realista",
  "editorial",
  "anime",
  "manhwa",
  "concept",
  "3d",
  "proprio",
]);

const identidadeSchema = z
  .object({
    nome: str.optional(),
    nomeExtenso: str.optional(),
    handles: strArr.optional(),
    ocupacao: str.optional(),
    idadeAparente: str.optional(),
    cidade: str.optional(),
    idioma: str.optional(),
    sotaque: str.optional(),
    genero: envelope(generoSchema).optional(),
    forma: envelope(formaSchema).optional(),
    bio: str.optional(),
  })
  .partial()
  .passthrough();

const visualSchema = z
  .object({
    traco: envelope(tracoSchema).optional(),
    cabelo: str.optional(),
    pele: str.optional(),
    olhos: str.optional(),
    roupa: str.optional(),
    acessorios: str.optional(),
    tracosMarcantes: str.optional(),
    paleta: str.optional(),
    cenarios: str.optional(),
    negativos: str.optional(),
  })
  .partial()
  .passthrough();

const gostosSchema = z
  .object({
    comidas: strArr.optional(),
    musicas: strArr.optional(),
    hobbies: strArr.optional(),
    marcas: strArr.optional(),
    lugares: strArr.optional(),
    series: strArr.optional(),
  })
  .partial();
const odeiaSchema = z
  .object({
    manias: strArr.optional(),
    conteudos: strArr.optional(),
    comportamentos: strArr.optional(),
    assuntos: strArr.optional(),
  })
  .partial();
const reacoesSchema = z
  .object({
    elogio: str.optional(),
    critica: str.optional(),
    polemica: str.optional(),
    hater: str.optional(),
  })
  .partial();

const soulSchema = z
  .object({
    arquetipo: str.optional(),
    adjetivos: strArr.optional(),
    gostos: gostosSchema.optional(),
    odeia: odeiaSchema.optional(),
    valoresDefende: str.optional(),
    valoresCombate: str.optional(),
    medos: str.optional(),
    manias: str.optional(),
    defeitos: str.optional(),
    origem: str.optional(),
    reacoes: reacoesSchema.optional(),
    regrasConsistencia: strArr.optional(),
  })
  .partial()
  .passthrough();

const pilarSchema = z.object({ nome: z.string(), pct: z.number() });
const ideiaSchema = z.object({
  formato: z.string(),
  titulo: z.string(),
  descricao: z.string().optional().default(""),
});

const nichoSchema = z
  .object({
    principal: str.optional(),
    subnicho: str.optional(),
    publico: str.optional(),
    promessa: str.optional(),
    performaFormatos: strArr.optional(),
    performaTemas: str.optional(),
    performaGanchos: str.optional(),
    performaDuracao: str.optional(),
    performaFrequencia: str.optional(),
    performaHorarios: str.optional(),
    concorrentes: strArr.optional(),
    diferencial: str.optional(),
    plataformas: strArr.optional(),
    pilares: envelope(z.array(pilarSchema)).optional(),
    ideiasConteudo: envelope(z.array(ideiaSchema)).optional(),
  })
  .partial()
  .passthrough();

const vozSchema = z
  .object({
    tomFormalidade: num.optional(),
    tomHumor: num.optional(),
    tomComplexidade: num.optional(),
    girias: strArr.optional(),
    bordoes: strArr.optional(),
    proibidas: strArr.optional(),
    abertura: str.optional(),
    fechamento: str.optional(),
    emoji: envelope(z.enum(["nenhum", "pouco", "muito"])).optional(),
    tamanhoFrase: envelope(z.enum(["curtas", "medias", "longas"])).optional(),
    exemplos: strArr.optional(),
    vozGenero: str.optional(),
    vozTimbre: str.optional(),
    vozRitmo: str.optional(),
  })
  .partial()
  .passthrough();

const monetizacaoSchema = z
  .object({
    modelos: strArr.optional(),
    marcasOk: strArr.optional(),
    marcasNao: strArr.optional(),
    limites: str.optional(),
    transparencia: str.optional(),
  })
  .partial()
  .passthrough();

const pontoAbertoSchema = z.object({
  decisao: z.string(),
  porQueImporta: z.string(),
});

export const expandirRespostaSchema = z
  .object({
    identidade: identidadeSchema.optional(),
    visual: visualSchema.optional(),
    soul: soulSchema.optional(),
    nicho: nichoSchema.optional(),
    voz: vozSchema.optional(),
    monetizacao: monetizacaoSchema.optional(),
    pontosEmAberto: z.array(pontoAbertoSchema).optional(),
  })
  .passthrough();

export type ExpandirResposta = z.infer<typeof expandirRespostaSchema>;

export const alertaIASchema = z.object({
  tipo: z.enum(["contradicao", "cliche", "generico", "vazio"]),
  campo: z.string(),
  mensagem: z.string(),
  correcaoSugerida: z.string().optional(),
});
export const checarRespostaSchema = z.object({
  alertas: z.array(alertaIASchema),
});
export type AlertaIA = z.infer<typeof alertaIASchema>;

export const sugerirCampoRespostaSchema = z.object({ valor: z.unknown() });

export { extractJson } from "@/lib/extract-json";
