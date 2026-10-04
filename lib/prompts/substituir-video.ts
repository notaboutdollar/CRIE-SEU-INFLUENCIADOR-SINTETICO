import type { Character } from "@/lib/types";

/**
 * Prompt "shadow" para substituir uma pessoa em um vídeo pelo personagem,
 * mantendo exatamente os movimentos, gestual, ritmo e enquadramento do
 * vídeo original. Usado pelo botão na Revisão; o usuário cola em uma IA
 * de vídeo-para-vídeo (Runway, Kling, Veo, Pika) junto com o vídeo e a
 * imagem do personagem.
 */
export function promptSubstituirVideo(c: Character): string {
  const nome = c.identidade.nome?.trim() || "o personagem";
  const linhas: string[] = [];

  // 1. Instrução central
  linhas.push(
    `Substitua a pessoa do vídeo pelo personagem ${nome}, ${descricaoCorpo(c)}.`
  );
  linhas.push(
    "Mantenha exatamente os movimentos, o gestual, o ritmo e o enquadramento do vídeo original."
  );
  linhas.push("");

  // 2. Referência de imagem
  linhas.push(`Imagem: ${nome} ${gestoReferencia(c)}. Referência de rosto e roupa.`);
  linhas.push("");

  // 3. Roupa fixa
  const roupa = descricaoRoupa(c);
  if (roupa) {
    linhas.push(`Roupa fixa em todo o vídeo: ${roupa}.`);
    linhas.push("");
  }

  // 4. Estilo e cenário
  const estilo = montarEstilo(c);
  linhas.push(`Estilo: ${estilo}.`);

  // 5. Restrições específicas (não mudar X, não adicionar Y)
  const restricoes = montarRestricoes(c);
  if (restricoes) linhas.push(restricoes);

  return linhas.join("\n");
}

function descricaoCorpo(c: Character): string {
  const partes: string[] = [];
  const genero = c.identidade.genero;
  const idade = c.identidade.idadeAparente?.trim();

  const prefixoGen = genero === "feminino" ? "uma mulher" : genero === "masculino" ? "um homem" : "uma pessoa";
  partes.push(idade ? `${prefixoGen} de ${idade}` : prefixoGen);

  if (c.visual.cabelo) partes.push(`cabelo ${c.visual.cabelo.toLowerCase()}`);
  if (c.visual.pele) partes.push(c.visual.pele.toLowerCase());
  if (c.visual.olhos) partes.push(`olhos ${c.visual.olhos.toLowerCase()}`);
  if (c.visual.tracosMarcantes) partes.push(c.visual.tracosMarcantes.toLowerCase());

  partes.push("rugas e textura de pele real");
  partes.push("sem emenda de máscara visível");

  return partes.join(", ");
}

function gestoReferencia(c: Character): string {
  const first = c.voz.exemplos.filter((e) => e.trim())[0];
  if (first) return `de frente, com expressão coerente com a fala: "${first.trim().slice(0, 80)}"`;
  const adj = c.soul.adjetivos[0];
  if (adj) return `de frente, com expressão ${adj.toLowerCase()}, olhando direto para a câmera`;
  return "de frente, expressão neutra, olhando direto para a câmera";
}

function descricaoRoupa(c: Character): string {
  const partes: string[] = [];
  if (c.visual.roupa) partes.push(c.visual.roupa);
  if (c.visual.acessorios) partes.push(c.visual.acessorios);
  if (c.visual.paleta) partes.push(`paleta ${c.visual.paleta}`);
  return partes.join(", ");
}

function montarEstilo(c: Character): string {
  const partes = [
    "fotografia realista",
    "luz natural",
    "pele e tecido com textura real",
  ];
  if (c.visual.cenarios) {
    partes.push(`cenário ${c.visual.cenarios}`);
  }
  return partes.join(", ");
}

function montarRestricoes(c: Character): string {
  const nunca: string[] = [];
  // Pode ser enriquecido no futuro com um campo específico; por ora, baseia
  // em sinais da ficha.
  if (c.visual.paleta?.toLowerCase().match(/\b(preto|black|dark)\b/)) {
    nunca.push("não trocar a paleta por cores claras");
  }
  if (c.visual.roupa) {
    nunca.push("não mudar as peças da roupa descritas acima");
  }
  return nunca.length ? `Não ${nunca.join("; não ")}.` : "";
}
