import { describe, expect, it } from "vitest";
import { emptyCharacter } from "@/lib/defaults";
import { promptSubstituirVideo } from "./substituir-video";

describe("promptSubstituirVideo", () => {
  it("usa 'o personagem' quando a ficha ainda não tem nome", () => {
    const c = emptyCharacter();
    const p = promptSubstituirVideo(c);
    expect(p).toContain("Substitua a pessoa do vídeo pelo personagem o personagem");
  });

  it("sempre mantém a instrução de 100% de consistência com o vídeo de referência", () => {
    const c = emptyCharacter();
    const p = promptSubstituirVideo(c);
    expect(p).toContain("Mantenha 100% de consistência com o vídeo de referência");
    expect(p).toContain("movimentos, gestual, ritmo, enquadramento, câmera, iluminação e cenário");
  });

  it("sempre proíbe mudar qualquer característica do personagem", () => {
    const c = emptyCharacter();
    const p = promptSubstituirVideo(c);
    expect(p).toContain(
      "Não altere nenhuma característica do personagem: rosto, cabelo, pele, olhos, roupa, acessórios e paleta devem ficar idênticos em todos os frames, sem variação nem reinterpretação."
    );
  });

  it("sempre proíbe o personagem de falar sem que seja pedido", () => {
    const c = emptyCharacter();
    const p = promptSubstituirVideo(c);
    expect(p).toContain(
      "Não adicione fala, texto, legenda, voz ou narração. O personagem não deve dizer nada além do que já existir no áudio original do vídeo, a menos que seja pedido explicitamente."
    );
  });

  it("inclui nome, idade, gênero, cabelo, pele e traços marcantes do personagem", () => {
    const c = emptyCharacter();
    c.identidade.nome = "Arnaldo";
    c.identidade.genero = "masculino";
    c.identidade.idadeAparente = "67 anos";
    c.visual.cabelo = "Branco ondulado";
    c.visual.pele = "Pele clara com rugas fundas";
    c.visual.tracosMarcantes = "Bigode prateado grosso e sobrancelhas brancas";
    const p = promptSubstituirVideo(c);
    expect(p).toContain("Arnaldo");
    expect(p).toContain("um homem de 67 anos");
    expect(p).toContain("cabelo branco ondulado");
    expect(p).toContain("bigode prateado grosso");
    expect(p).toContain("rugas e textura de pele real");
    expect(p).toContain("sem emenda de máscara visível");
  });

  it("inclui roupa, acessórios e paleta no bloco de 'Roupa fixa'", () => {
    const c = emptyCharacter();
    c.visual.roupa = "Terno de veludo verde-garrafa de três peças";
    c.visual.acessorios = "Corrente dourada, lenço vermelho no bolso";
    const p = promptSubstituirVideo(c);
    expect(p).toContain("Roupa fixa em todo o vídeo:");
    expect(p).toContain("Terno de veludo verde-garrafa de três peças");
    expect(p).toContain("Corrente dourada");
  });

  it("usa o cenário recorrente da ficha no bloco de estilo", () => {
    const c = emptyCharacter();
    c.visual.cenarios = "rua urbana com parede de concreto";
    const p = promptSubstituirVideo(c);
    expect(p).toContain("cenário rua urbana com parede de concreto");
  });

  it("sempre afirma estilo realista com luz natural e textura real", () => {
    const c = emptyCharacter();
    const p = promptSubstituirVideo(c);
    expect(p).toContain("Estilo:");
    expect(p).toContain("fotografia realista");
    expect(p).toContain("luz natural");
    expect(p).toContain("pele e tecido com textura real");
  });
});
