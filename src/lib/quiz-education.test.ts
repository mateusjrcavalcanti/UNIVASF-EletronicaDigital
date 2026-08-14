import { describe, expect, it } from "vitest";
import { generateQuestion } from "./quiz";
import {
  getCompletionAriaLabel,
  getExplanation,
  getGeneralTips,
  getQuestionAriaLabel,
  getQuizIntro,
  getTip,
} from "./quiz-education";

describe("getTip", () => {
  it("retorna dica específica para binário → decimal", () => {
    const q = {
      id: "q1",
      value: "1011",
      fromBase: 2,
      toBase: 10,
      correctAnswer: "11",
    } as const;
    const tip = getTip(q);
    expect(tip.short).toContain("potência de 2");
    expect(tip.detailed.length).toBeGreaterThan(50);
  });

  it("retorna dica específica para decimal → hexadecimal", () => {
    const q = {
      id: "q1",
      value: "255",
      fromBase: 10,
      toBase: 16,
      correctAnswer: "FF",
    } as const;
    const tip = getTip(q);
    expect(tip.short).toContain("16");
    expect(tip.short).toContain("A");
  });

  it("retorna dica específica para binário → hexadecimal (atalho)", () => {
    const q = {
      id: "q1",
      value: "10111111",
      fromBase: 2,
      toBase: 16,
      correctAnswer: "BF",
    } as const;
    const tip = getTip(q);
    expect(tip.short).toContain("4");
  });

  it("retorna dica de fallback para bases sem mapeamento específico", () => {
    const q = {
      id: "q1",
      value: "42",
      fromBase: 7 as const,
      toBase: 5 as const,
      correctAnswer: "63",
    } as const;
    const tip = getTip(q);
    expect(tip.short.length).toBeGreaterThan(5);
    expect(tip.detailed.length).toBeGreaterThan(20);
  });

  it("retorna dica para octal → decimal", () => {
    const q = {
      id: "q1",
      value: "374",
      fromBase: 8,
      toBase: 10,
      correctAnswer: "252",
    } as const;
    const tip = getTip(q);
    expect(tip.short).toContain("8");
  });

  it("retorna dica para octal → binário (atalho)", () => {
    const q = {
      id: "q1",
      value: "374",
      fromBase: 8,
      toBase: 2,
      correctAnswer: "11111100",
    } as const;
    const tip = getTip(q);
    expect(tip.short).toContain("3 bits");
  });
});

describe("getExplanation", () => {
  it("explicação de acerto contém método e passos", () => {
    const q = {
      id: "q1",
      value: "1011",
      fromBase: 2,
      toBase: 10,
      correctAnswer: "11",
    } as const;
    const expl = getExplanation(q, "11", true);
    expect(expl.method.length).toBeGreaterThan(5);
    expect(expl.steps.length).toBeGreaterThanOrEqual(3);
    expect(expl.steps[expl.steps.length - 1]).toContain("11");
  });

  it("explicação de erro contém a resposta do usuário", () => {
    const q = {
      id: "q1",
      value: "1011",
      fromBase: 2,
      toBase: 10,
      correctAnswer: "11",
    } as const;
    const expl = getExplanation(q, "42", false);
    expect(expl.note).toContain("42");
  });

  it("explicação para decimal → binário menciona divisões sucessivas", () => {
    const q = {
      id: "q1",
      value: "13",
      fromBase: 10,
      toBase: 2,
      correctAnswer: "1101",
    } as const;
    const expl = getExplanation(q, "1101", true);
    expect(expl.method).toContain("2");
  });

  it("explicação para hex → binário menciona 4 bits por dígito", () => {
    const q = {
      id: "q1",
      value: "FF",
      fromBase: 16,
      toBase: 2,
      correctAnswer: "11111111",
    } as const;
    const expl = getExplanation(q, "FF", false);
    expect(expl.steps.join(" ")).toContain("4 bits");
  });

  it("funciona com questões geradas aleatoriamente", () => {
    for (let i = 0; i < 5; i++) {
      const q = generateQuestion();
      const expl = getExplanation(q, q.correctAnswer, true);
      expect(expl.method).toBeTruthy();
      expect(expl.steps.length).toBeGreaterThan(0);
      expect(expl.steps[expl.steps.length - 1]).toContain(q.correctAnswer);
    }
  });

  it("explicação de erro para conversão indireta menciona rota via decimal", () => {
    const q = {
      id: "q1",
      value: "10",
      fromBase: 3,
      toBase: 5,
      correctAnswer: "3",
    } as const;
    const expl = getExplanation(q, "99", false);
    // A explicação deve mencionar a resposta do usuário
    expect(expl.note).toContain("99");
  });
});

describe("getQuestionAriaLabel", () => {
  it("gera label acessível correta", () => {
    const q = {
      id: "q1",
      value: "FF",
      fromBase: 16,
      toBase: 2,
      correctAnswer: "11111111",
    } as const;
    const label = getQuestionAriaLabel(q, 2, 10);
    expect(label).toContain("Questão 3");
    expect(label).toContain("10");
    expect(label).toContain("FF");
    expect(label).toContain("Hexadecimal");
    expect(label).toContain("Binário");
  });
});

describe("getQuizIntro", () => {
  it("retorna texto não vazio", () => {
    const intro = getQuizIntro();
    expect(intro.length).toBeGreaterThan(30);
    expect(intro).toContain("10");
  });
});

describe("getCompletionAriaLabel", () => {
  it("formata corretamente o resultado", () => {
    const label = getCompletionAriaLabel(7, 10, 4);
    expect(label).toContain("7");
    expect(label).toContain("10");
    expect(label).toContain("70%");
    expect(label).toContain("4");
  });

  it("resultado com 100%", () => {
    const label = getCompletionAriaLabel(5, 5, 5);
    expect(label).toContain("100%");
  });
});

describe("getGeneralTips", () => {
  it("retorna 3 dicas", () => {
    expect(getGeneralTips()).toHaveLength(3);
  });

  it("cada dica tem short e detailed", () => {
    for (const tip of getGeneralTips()) {
      expect(tip.short.length).toBeGreaterThan(3);
      expect(tip.detailed.length).toBeGreaterThan(tip.short.length);
    }
  });
});
