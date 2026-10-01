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
  negativos?: string;
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
}

export interface Pilar {
  nome: string;
  pct: number;
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
