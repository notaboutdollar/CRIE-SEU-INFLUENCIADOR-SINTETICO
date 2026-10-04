export type Genero = "feminino" | "masculino" | "nao-binario";
export type Forma = "humano" | "humanoide" | "animal" | "criatura" | "objeto" | "abstrato";
export type Traco =
  | "automatico"
  | "realista"
  | "editorial"
  | "anime"
  | "manhwa"
  | "concept"
  | "3d"
  | "proprio";

export type EmojiUso = "nenhum" | "pouco" | "muito";

export interface ReferenciaImagem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
}

export interface Identidade {
  nome: string;
  nomeExtenso?: string;
  handles?: string[];
  ocupacao?: string;
  genero?: Genero;
  forma?: Forma;
  idadeAparente?: string;
  cidade?: string;
  idioma?: string;
  sotaque?: string;
  bio?: string;
}

export interface Visual {
  traco?: Traco;
  referencias: ReferenciaImagem[];
  cabelo?: string;
  pele?: string;
  olhos?: string;
  roupa?: string;
  acessorios?: string;
  tracosMarcantes?: string;
  paleta?: string;
  cenarios?: string;
  negativos?: string;
  /** Ideia visual em texto livre; vai pro topo do prompt de imagem, antes dos campos. */
  ideiaLivre?: string;
}

export interface Soul {
  arquetipo?: string;
  adjetivos: string[];
  gostos: {
    comidas: string[];
    musicas: string[];
    hobbies: string[];
    marcas: string[];
    lugares: string[];
    series: string[];
  };
  odeia: {
    manias: string[];
    conteudos: string[];
    comportamentos: string[];
    assuntos: string[];
  };
  valoresDefende?: string;
  valoresCombate?: string;
  medos?: string;
  manias?: string;
  defeitos?: string;
  origem?: string;
  reacoes: {
    elogio?: string;
    critica?: string;
    polemica?: string;
    hater?: string;
  };
  regrasConsistencia: string[];
}

export interface Pilar {
  nome: string;
  pct: number;
}

export interface IdeiaConteudo {
  formato: string;
  titulo: string;
  descricao?: string;
}

export interface Nicho {
  principal?: string;
  subnicho?: string;
  publico?: string;
  promessa?: string;
  performaFormatos: string[];
  performaTemas?: string;
  performaGanchos?: string;
  performaDuracao?: string;
  performaFrequencia?: string;
  performaHorarios?: string;
  concorrentes: string[];
  diferencial?: string;
  plataformas: string[];
  pilares: Pilar[];
  ideiasConteudo: IdeiaConteudo[];
}

export interface Voz {
  tomFormalidade: number;
  tomHumor: number;
  tomComplexidade: number;
  girias: string[];
  bordoes: string[];
  proibidas: string[];
  abertura?: string;
  fechamento?: string;
  emoji: EmojiUso;
  tamanhoFrase: "curtas" | "medias" | "longas";
  exemplos: string[];
  vozGenero?: string;
  vozTimbre?: string;
  vozRitmo?: string;
  vozReferencia?: string;
}

export interface Monetizacao {
  modelos: string[];
  marcasOk: string[];
  marcasNao: string[];
  limites?: string;
  transparencia?: string;
}

export interface PontoEmAberto {
  decisao: string;
  porQueImporta: string;
  resposta?: string;
}

export interface HistoryEntry {
  at: number;
  label: string;
  snapshot: SerializableCharacter;
}

/** Snapshot sem metadados de IA — usado em _history pra evitar recursão. */
export type SerializableCharacter = Omit<Character, "_history">;

export interface Character {
  id: string;
  createdAt: number;
  updatedAt: number;
  identidade: Identidade;
  visual: Visual;
  soul: Soul;
  nicho: Nicho;
  voz: Voz;
  monetizacao: Monetizacao;
  pontosEmAberto: PontoEmAberto[];
  /** fieldId → "contexto"|"suposicao". Enquanto estiver aqui, o campo mostra badge. */
  _suggestions: Record<string, "contexto" | "suposicao">;
  /** fieldIds travados: nunca sobrescritos por regeneração. */
  _locks: string[];
  /** Snapshots das últimas gerações, pra Desfazer. */
  _history: HistoryEntry[];
}

export const STEP_IDS = [
  "identidade",
  "visual",
  "soul",
  "nicho",
  "voz",
  "monetizacao",
  "revisao",
] as const;

export type StepId = (typeof STEP_IDS)[number];
