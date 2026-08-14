import type { Base } from "./converter";
import { getBaseName } from "./converter";
import type { QuizQuestion } from "./quiz";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ConversionTip {
  /** Texto curto da dica (aparece durante a pergunta) */
  short: string;
  /** Texto detalhado da dica (para expandir/tooltip) */
  detailed: string;
}

export interface AnswerExplanation {
  /** Explicação do método de conversão */
  method: string;
  /** Passo a passo resumido */
  steps: string[];
  /** Observação adicional */
  note?: string;
}

// ─── Banco de Dicas por Par de Bases ─────────────────────────────────────────

/**
 * Dicas organizadas por (fromBase, toBase) ou categorias genéricas.
 * Chave: "from-to" (ex: "2-10") ou "X-Y" para dicas genéricas.
 */
const TIPS: Record<string, ConversionTip> = {
  // ── Para Decimal ────────────────────────────────────────────────────────
  "2-10": {
    short: "Cada posição do número binário é uma potência de 2. Da direita para a esquerda: 2⁰, 2¹, 2²...",
    detailed:
      "Para converter binário para decimal: multiplique cada dígito pela potência de 2 correspondente à sua posição (começando em 0 da direita para esquerda) e some os resultados. Ex: 1011₂ = 1×2³ + 0×2² + 1×2¹ + 1×2⁰ = 8+0+2+1 = 11₁₀.",
  },
  "8-10": {
    short: "Cada posição do número octal é uma potência de 8.",
    detailed:
      "Multiplique cada dígito octal pela potência de 8 da sua posição (8⁰, 8¹, 8²...) e some. Ex: 374₈ = 3×64 + 7×8 + 4×1 = 252₁₀.",
  },
  "16-10": {
    short: "Cada posição hexadecimal é uma potência de 16. A=10, B=11, …, F=15.",
    detailed:
      "Converta cada dígito hex para seu valor decimal (A=10, B=11, ..., F=15), multiplique pela potência de 16 da posição e some. Ex: 2F₁₆ = 2×16¹ + 15×16⁰ = 32+15 = 47₁₀.",
  },
  "3-10": {
    short: "Cada posição ternária vale uma potência de 3: 3⁰=1, 3¹=3, 3²=9, 3³=27...",
    detailed:
      "Multiplique cada dígito (0, 1 ou 2) pela potência de 3 da posição e some. Ex: 210₃ = 2×9 + 1×3 + 0×1 = 21₁₀.",
  },
  "5-10": {
    short: "Cada posição quinária vale uma potência de 5: 5⁰=1, 5¹=5, 5²=25...",
    detailed:
      "Multiplique cada dígito (0-4) pela potência de 5 da posição e some os resultados.",
  },
  "7-10": {
    short: "Cada posição setenária vale uma potência de 7: 7⁰=1, 7¹=7, 7²=49...",
    detailed:
      "Multiplique cada dígito (0-6) pela potência de 7 da posição e some os resultados.",
  },
  "12-10": {
    short: "Cada posição duodecimal vale uma potência de 12. A=10, B=11.",
    detailed:
      "Converta A=10 e B=11 para seus valores, multiplique pelas potências de 12 e some.",
  },
  "20-10": {
    short: "Cada posição vigesimal vale uma potência de 20. Dígitos vão de 0 a J (J=19).",
    detailed:
      "Converta cada dígito (0-9, A=10, B=11, ..., J=19) para decimal, multiplique pela potência de 20 e some.",
  },
  "36-10": {
    short: "Cada posição vale uma potência de 36. Dígitos: 0-9 e A-Z.",
    detailed:
      "Converta cada dígito (0-9 valem 0-9, A-Z valem 10-35) para decimal, multiplique pela potência de 36 e some.",
  },

  // ── De Decimal ───────────────────────────────────────────────────────────
  "10-2": {
    short: "Divisões sucessivas por 2. Leia os restos de baixo para cima.",
    detailed:
      "Divida o número decimal por 2 repetidamente, anotando o resto (0 ou 1) de cada divisão. Quando o quociente chegar a 0, leia os restos do último para o primeiro. Ex: 13₁₀ → 13÷2=6 resto 1, 6÷2=3 resto 0, 3÷2=1 resto 1, 1÷2=0 resto 1 → 1101₂.",
  },
  "10-8": {
    short: "Divisões sucessivas por 8. Restos de 0 a 7, lidos de baixo para cima.",
    detailed:
      "Divida por 8 repetidamente, anotando os restos (0-7). Leia do último para o primeiro. Ex: 95₁₀ → 95÷8=11 resto 7, 11÷8=1 resto 3, 1÷8=0 resto 1 → 137₈.",
  },
  "10-16": {
    short: "Divisões sucessivas por 16. Restos > 9 viram letras (10=A, 11=B, …, 15=F).",
    detailed:
      "Divida por 16 repetidamente. Restos 10-15 viram A-F. Leia de baixo para cima. Ex: 255₁₀ → 255÷16=15 resto 15(F), 15÷16=0 resto 15(F) → FF₁₆.",
  },
  "10-3": {
    short: "Divisões sucessivas por 3. Restos (0, 1, 2) lidos de baixo para cima.",
    detailed:
      "Divida por 3 repetidamente, anotando os restos (0-2) e lendo do último para o primeiro.",
  },
  "10-5": {
    short: "Divisões sucessivas por 5. Restos (0-4) lidos de baixo para cima.",
    detailed:
      "Divida por 5 repetidamente, anotando os restos (0-4) e lendo de baixo para cima.",
  },
  "10-7": {
    short: "Divisões sucessivas por 7. Restos (0-6) lidos de baixo para cima.",
    detailed:
      "Divida por 7 repetidamente, anotando os restos (0-6) e lendo de baixo para cima.",
  },
  "10-12": {
    short: "Divisões sucessivas por 12. Restos 10=A, 11=B. Leia de baixo para cima.",
    detailed:
      "Divida por 12 repetidamente. Restos 10 e 11 viram A e B. Leia de baixo para cima.",
  },
  "10-20": {
    short: "Divisões sucessivas por 20. Restos 10-19 viram A-J.",
    detailed:
      "Divida por 20 repetidamente. Restos ≥10 viram letras (10=A até 19=J). Leia de baixo para cima.",
  },
  "10-36": {
    short: "Divisões sucessivas por 36. Restos 10-35 viram A-Z.",
    detailed:
      "Divida por 36 repetidamente. Restos 10-35 viram letras correspondentes (10=A até 35=Z). Leia de baixo para cima.",
  },

  // ── Binário ↔ Hex (atalho direto) ──────────────────────────────────────
  "2-16": {
    short: "Agrupe os bits em blocos de 4 (da direita para esquerda) e converta cada bloco para hex.",
    detailed:
      "Cada 4 bits viram 1 dígito hexadecimal. Complete com zeros à esquerda se necessário. Tabela: 0000=0, 0001=1, ..., 1001=9, 1010=A, 1011=B, 1100=C, 1101=D, 1110=E, 1111=F.",
  },
  "16-2": {
    short: "Cada dígito hexadecimal vira 4 bits. Use a tabela de correspondência.",
    detailed:
      "Converta cada dígito hex individualmente para 4 bits: 0=0000, 1=0001, ..., 9=1001, A=1010, B=1011, C=1100, D=1101, E=1110, F=1111. Depois junte os blocos.",
  },

  // ── Binário ↔ Octal (atalho direto) ────────────────────────────────────
  "2-8": {
    short: "Agrupe os bits em blocos de 3 (da direita para esquerda) e converta cada bloco para octal.",
    detailed:
      "Cada 3 bits viram 1 dígito octal. Complete com zeros à esquerda se necessário. Tabela: 000=0, 001=1, 010=2, 011=3, 100=4, 101=5, 110=6, 111=7.",
  },
  "8-2": {
    short: "Cada dígito octal vira 3 bits. Use a tabela de correspondência.",
    detailed:
      "Converta cada dígito octal individualmente para 3 bits: 0=000, 1=001, 2=010, 3=011, 4=100, 5=101, 6=110, 7=111. Depois junte os blocos.",
  },
};

// ─── Dicas Genéricas (fallback) ──────────────────────────────────────────────

const baseCategory = (base: Base): "pot2" | "other" => {
  if (base === 2 || base === 8 || base === 16) return "pot2";
  return "other";
};

function getFallbackTip(fromBase: Base, toBase: Base): ConversionTip {
  const fromCat = baseCategory(fromBase);
  const toCat = baseCategory(toBase);

  // De base potência de 2 para decimal
  if (fromCat === "pot2" && toBase === 10) {
    return {
      short: `Cada posição vale uma potência de ${fromBase}. Multiplique e some.`,
      detailed: `Para converter de ${getBaseName(fromBase)} para decimal, multiplique cada dígito pela potência de ${fromBase} correspondente à sua posição e some os resultados.`,
    };
  }

  // De decimal para base potência de 2
  if (fromBase === 10 && toCat === "pot2") {
    return {
      short: `Divisões sucessivas por ${toBase}. Leia os restos de baixo para cima.`,
      detailed: `Divida o número decimal por ${toBase} repetidamente, anotando os restos. Leia do último para o primeiro.`,
    };
  }

  // Genérico: qualquer para decimal
  if (toBase === 10) {
    return {
      short: `Cada posição vale uma potência de ${fromBase}. Multiplique e some.`,
      detailed: `Multiplique cada dígito pela potência de ${fromBase} da sua posição (da direita para esquerda, começando em 0) e some os resultados.`,
    };
  }

  // Genérico: decimal para qualquer
  if (fromBase === 10) {
    return {
      short: `Divisões sucessivas por ${toBase}. Leia os restos de baixo para cima.`,
      detailed: `Divida o número por ${toBase} repetidamente, anotando os restos (0 a ${toBase - 1}). Restos ≥10 viram letras. Leia de baixo para cima.`,
    };
  }

  // Genérico: conversão indireta
  return {
    short: `Converta primeiro para decimal, depois para a base destino.`,
    detailed: `Não há atalho direto entre ${getBaseName(fromBase)} e ${getBaseName(toBase)}. Converta ${getBaseName(fromBase)} → decimal → ${getBaseName(toBase)}.`,
  };
}

// ─── API Pública ─────────────────────────────────────────────────────────────

/**
 * Retorna uma dica contextual para a conversão pedida na questão.
 */
export function getTip(question: QuizQuestion): ConversionTip {
  const key = `${question.fromBase}-${question.toBase}`;
  return TIPS[key] ?? getFallbackTip(question.fromBase, question.toBase);
}

/**
 * Gera uma explicação pós-resposta para reforço de aprendizado.
 * @param question A questão respondida
 * @param userAnswer Resposta do aluno (normalizada)
 * @param wasCorrect Se o aluno acertou
 */
export function getExplanation(
  question: QuizQuestion,
  userAnswer: string,
  wasCorrect: boolean
): AnswerExplanation {
  const fromName = getBaseName(question.fromBase);
  const toName = getBaseName(question.toBase);
  const fromKey = `${question.fromBase}-${question.toBase}`;

  // Explicações específicas para pares comuns
  if (fromKey === "2-10") {
    return {
      method: "Método da soma das potências de 2",
      steps: [
        `O número binário "${question.value}" tem ${question.value.length} dígito(s).`,
        `Da direita para esquerda: cada dígito é multiplicado por 2ᵖᵒˢⁱçᵃᵒ.`,
        `Some todos os resultados para obter o valor decimal.`,
        `Resposta correta: ${question.correctAnswer}₁₀`,
      ],
      note: wasCorrect
        ? "Ótimo! Você domina a conversão binário → decimal, essencial em Eletrônica Digital."
        : `Você respondeu "${userAnswer}". Revise: cada bit (0 ou 1) tem um peso que dobra a cada posição para a esquerda.`,
    };
  }

  if (fromKey === "10-2") {
    return {
      method: "Método das divisões sucessivas por 2",
      steps: [
        `Divida ${question.value} por 2 repetidamente, anotando os restos.`,
        `Os restos (0 ou 1) formam o número binário, lidos de baixo para cima.`,
        `Resposta correta: ${question.correctAnswer}₂`,
      ],
      note: wasCorrect
        ? "Perfeito! Divisões sucessivas são a base da conversão decimal → binário."
        : `Você respondeu "${userAnswer}". Lembre-se: leia os restos do ÚLTIMO para o PRIMEIRO.`,
    };
  }

  if (fromKey === "16-10") {
    return {
      method: "Método da soma das potências de 16",
      steps: [
        `Cada dígito hex do número "${question.value}" é multiplicado por 16ᵖᵒˢⁱçᵃᵒ.`,
        `Lembre-se: A=10, B=11, C=12, D=13, E=14, F=15.`,
        `Some todos os termos para obter o valor decimal.`,
        `Resposta correta: ${question.correctAnswer}₁₀`,
      ],
      note: wasCorrect
        ? "Excelente! Hex → decimal é muito usado em endereçamento de memória."
        : `Você respondeu "${userAnswer}". Verifique: A=10, B=11, ..., F=15. Cada posição à esquerda multiplica por 16.`,
    };
  }

  if (fromKey === "10-16") {
    return {
      method: "Método das divisões sucessivas por 16",
      steps: [
        `Divida ${question.value} por 16 repetidamente, anotando os restos.`,
        `Restos de 10 a 15 viram letras: 10=A, 11=B, 12=C, 13=D, 14=E, 15=F.`,
        `Leia os restos de baixo para cima.`,
        `Resposta correta: ${question.correctAnswer}₁₆`,
      ],
      note: wasCorrect
        ? "Muito bem! A conversão para hexadecimal é fundamental em programação de baixo nível."
        : `Você respondeu "${userAnswer}". Atenção aos restos ≥10: eles viram letras (A-F).`,
    };
  }

  if (fromKey === "2-16") {
    return {
      method: "Atalho: agrupamento de 4 bits",
      steps: [
        `Agrupe os bits de "${question.value}" em blocos de 4, da direita para esquerda.`,
        `Complete o último bloco com zeros à esquerda se necessário.`,
        `Converta cada bloco de 4 bits para um dígito hexadecimal (0000=0 … 1111=F).`,
        `Resposta correta: ${question.correctAnswer}₁₆`,
      ],
      note: wasCorrect
        ? "Ótimo! Este atalho evita a conversão intermediária para decimal."
        : `Você respondeu "${userAnswer}". Dica: cada 4 bits = 1 dígito hex. Agrupe da direita para esquerda.`,
    };
  }

  if (fromKey === "16-2") {
    return {
      method: "Atalho: expansão de cada dígito hex para 4 bits",
      steps: [
        `Converta cada dígito de "${question.value}" individualmente para 4 bits.`,
        `Use a tabela: 0=0000, 1=0001, …, 9=1001, A=1010, …, F=1111.`,
        `Junte todos os blocos de 4 bits na mesma ordem.`,
        `Resposta correta: ${question.correctAnswer}₂`,
      ],
      note: wasCorrect
        ? "Perfeito! Cada dígito hex vira exatamente 4 bits — sem exceção."
        : `Você respondeu "${userAnswer}". Cada dígito hex sempre gera 4 bits. Confira a tabela de correspondência.`,
    };
  }

  if (fromKey === "2-8") {
    return {
      method: "Atalho: agrupamento de 3 bits",
      steps: [
        `Agrupe os bits de "${question.value}" em blocos de 3, da direita para esquerda.`,
        `Complete o último bloco com zeros à esquerda se necessário.`,
        `Converta cada bloco de 3 bits para um dígito octal (000=0 … 111=7).`,
        `Resposta correta: ${question.correctAnswer}₈`,
      ],
      note: wasCorrect
        ? "Muito bem! Agrupar de 3 em 3 bits é o atalho para octal."
        : `Você respondeu "${userAnswer}". Lembre: octal = blocos de 3 bits, não de 4.`,
    };
  }

  if (fromKey === "8-2") {
    return {
      method: "Atalho: expansão de cada dígito octal para 3 bits",
      steps: [
        `Converta cada dígito de "${question.value}" individualmente para 3 bits.`,
        `Use a tabela: 0=000, 1=001, 2=010, 3=011, 4=100, 5=101, 6=110, 7=111.`,
        `Junte todos os blocos de 3 bits.`,
        `Resposta correta: ${question.correctAnswer}₂`,
      ],
      note: wasCorrect
        ? "Excelente! Cada dígito octal sempre ocupa 3 bits."
        : `Você respondeu "${userAnswer}". Cada dígito octal vira exatamente 3 bits — complete com zeros à esquerda se precisar.`,
    };
  }

  if (fromKey === "8-10") {
    return {
      method: "Método da soma das potências de 8",
      steps: [
        `Cada dígito de "${question.value}" é multiplicado pela potência de 8 da posição.`,
        `Da direita para esquerda: posição 0 = 8⁰ = 1, posição 1 = 8¹ = 8, posição 2 = 8² = 64...`,
        `Some todos os resultados.`,
        `Resposta correta: ${question.correctAnswer}₁₀`,
      ],
      note: wasCorrect
        ? "Bom! A base octal aparece em sistemas de permissão Unix (chmod)."
        : `Você respondeu "${userAnswer}". Multiplique cada dígito por 8ᵖᵒˢⁱçᵃᵒ e some.`,
    };
  }

  if (fromKey === "10-8") {
    return {
      method: "Método das divisões sucessivas por 8",
      steps: [
        `Divida ${question.value} por 8 repetidamente, anotando os restos (0-7).`,
        `Leia os restos de baixo para cima.`,
        `Resposta correta: ${question.correctAnswer}₈`,
      ],
      note: wasCorrect
        ? "Certo! A conversão para octal usa o mesmo princípio do binário, mas com divisor 8."
        : `Você respondeu "${userAnswer}". Divisões por 8, restos de 0 a 7, lidos de baixo para cima.`,
    };
  }

  // ── Genérico para pares sem explicação específica ───────────────────────
  return buildGenericExplanation(question, userAnswer, wasCorrect, fromName, toName);
}

function buildGenericExplanation(
  question: QuizQuestion,
  userAnswer: string,
  wasCorrect: boolean,
  fromName: string,
  toName: string
): AnswerExplanation {
  const isFromDecimal = question.fromBase === 10;
  const isToDecimal = question.toBase === 10;

  if (isToDecimal) {
    return {
      method: `Método da soma das potências de ${question.fromBase}`,
      steps: [
        `Cada dígito de "${question.value}" é multiplicado por ${question.fromBase}ᵖᵒˢⁱçᵃᵒ.`,
        `Comece da direita (posição 0) e vá para a esquerda.`,
        `Some todos os resultados para obter o valor decimal.`,
        `Resposta correta: ${question.correctAnswer}₁₀`,
      ],
      note: wasCorrect
        ? `Correto! A conversão de ${fromName} para decimal segue sempre o mesmo princípio de soma de potências.`
        : `Você respondeu "${userAnswer}". Multiplique cada dígito pela potência de ${question.fromBase} da sua posição e some.`,
    };
  }

  if (isFromDecimal) {
    return {
      method: `Método das divisões sucessivas por ${question.toBase}`,
      steps: [
        `Divida ${question.value} por ${question.toBase} repetidamente.`,
        `Anote os restos (0 a ${question.toBase - 1}). Restos ≥ 10 viram letras.`,
        `Leia os restos de baixo para cima.`,
        `Resposta correta: ${question.correctAnswer}`,
      ],
      note: wasCorrect
        ? `Bom! Divisões sucessivas funcionam para qualquer base.`
        : `Você respondeu "${userAnswer}". Faça divisões sucessivas por ${question.toBase} e leia os restos de baixo para cima.`,
    };
  }

  // Conversão indireta
  return {
    method: "Conversão indireta (via decimal)",
    steps: [
      `1º: Converta "${question.value}" de ${fromName} para decimal.`,
      `2º: Converta o resultado decimal para ${toName}.`,
      `Não há atalho direto entre ${fromName} e ${toName}.`,
      `Resposta correta: ${question.correctAnswer}`,
    ],
    note: wasCorrect
      ? `Acertou! A conversão indireta (${fromName} → decimal → ${toName}) é uma estratégia universal.`
      : `Você respondeu "${userAnswer}". Use a rota indireta: ${fromName} → decimal → ${toName}.`,
  };
}

// ─── Gerador de Instruções para o Quiz ──────────────────────────────────────

/**
 * Retorna o texto instrucional de boas-vindas do quiz.
 */
export function getQuizIntro(): string {
  return "Teste seus conhecimentos de conversão entre bases numéricas! Você receberá 10 desafios — converta o número apresentado para a base solicitada. Acertos consecutivos geram bônus de streak!";
}

/**
 * Retorna o rótulo acessível para a pergunta atual.
 */
export function getQuestionAriaLabel(question: QuizQuestion, index: number, total: number): string {
  return `Questão ${index + 1} de ${total}: Converta ${question.value} na base ${getBaseName(question.fromBase)} (base ${question.fromBase}) para ${getBaseName(question.toBase)} (base ${question.toBase})`;
}

/**
 * Retorna o texto do resultado final do quiz para leitores de tela.
 */
export function getCompletionAriaLabel(score: number, total: number, maxStreak: number): string {
  const pct = Math.round((score / total) * 100);
  return `Quiz concluído. Você acertou ${score} de ${total} questões (${pct}% de precisão). Sua maior sequência de acertos foi ${maxStreak}.`;
}

// ─── Dicas Rápidas para Sidebar / Durante o Quiz ─────────────────────────────

/**
 * Retorna 3 dicas gerais sobre conversão de bases (para exibição no início ou durante pausas).
 */
export function getGeneralTips(): ConversionTip[] {
  return [
    {
      short: "Potências da base",
      detailed:
        "Em qualquer base B, a posição N (da direita para esquerda, começando em 0) vale Bᴺ. Ex: em decimal, posição 2 = 10² = 100; em binário, posição 3 = 2³ = 8.",
    },
    {
      short: "Método universal",
      detailed:
        "Para converter entre duas bases quaisquer, converta primeiro para decimal (multiplicando pelas potências) e depois divida sucessivamente pela base destino.",
    },
    {
      short: "Bases potência de 2",
      detailed:
        "Binário (2), octal (8) e hexadecimal (16) são bases relacionadas. Octal agrupa 3 bits, hexadecimal agrupa 4 bits. Use atalhos de agrupamento em vez de passar pelo decimal!",
    },
  ];
}
