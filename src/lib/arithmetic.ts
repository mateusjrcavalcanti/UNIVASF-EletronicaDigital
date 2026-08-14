import type { Base, ConversionStep } from "./converter";
import {
  convertFromDecimal,
  digitToValue,
  getBaseName,
  valueToDigit,
} from "./converter";
import { fromTwosComplement, toTwosComplement } from "./twosComplement";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface ArithmeticResult {
  value: string;
  steps: ConversionStep[];
  /** true quando houve carry na última coluna da adição */
  carry?: boolean;
  /** true quando houve borrow na última coluna da subtração */
  borrow?: boolean;
  /** true quando o resultado não cabe no range esperado (overflow aritmético) */
  overflow?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Bases que são potência de 2 (2, 4, 8, 16, 32…) */
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/** Separa sinal '-' do início da string. Retorna sign=-1 para negativo. */
function parseSigned(raw: string): { sign: 1 | -1; digits: string } {
  const trimmed = raw.trim();
  if (trimmed.startsWith("-")) {
    return { sign: -1, digits: trimmed.slice(1) };
  }
  return { sign: 1, digits: trimmed };
}

/**
 * Alinha duas strings à direita, preenchendo a mais curta com '0' à esquerda.
 * Retorna [aPadded, bPadded, maxLen].
 */
function padRight(a: string, b: string): [string, string, number] {
  const max = Math.max(a.length, b.length);
  return [a.padStart(max, "0"), b.padStart(max, "0"), max];
}

// ---------------------------------------------------------------------------
// Adição coluna-por-coluna
// ---------------------------------------------------------------------------

/**
 * Soma dois operandos em qualquer base (2-36), coluna por coluna,
 * detectando carry e overflow.
 *
 * Regras de sinal:
 *  - Se ambos positivos ou ambos negativos → soma os valores absolutos.
 *    O sinal do resultado segue o sinal comum.
 *  - Se sinais opostos → delega para subtração do maior absoluto menos o menor.
 *
 * O resultado é convertido para `outBase`.
 */
export function add(
  a: string,
  baseA: Base,
  b: string,
  baseB: Base,
  outBase: Base,
): ArithmeticResult {
  const steps: ConversionStep[] = [];
  const parsedA = parseSigned(a);
  const parsedB = parseSigned(b);

  const nameA = getBaseName(baseA);
  const nameB = getBaseName(baseB);
  const nameOut = getBaseName(outBase);

  steps.push({
    description: `Adição: ${a} (${nameA}) + ${b} (${nameB})`,
  });

  // Mesma base? Faz direto. Senão, converte B para a base de A.
  let digitsA = parsedA.digits;
  let digitsB = parsedB.digits;
  let workBase = baseA;

  if (baseA !== baseB) {
    const decA = convertFromDecimal(
      parseInt(parsedA.digits || "0", baseA),
      baseA,
    );
    const decB = convertFromDecimal(
      parseInt(parsedB.digits || "0", baseB),
      baseB,
    );
    digitsA = decA.value;
    digitsB = decB.value;
    // Ambos estão agora na maior das duas bases para alinhamento
    workBase = Math.max(baseA, baseB) as Base;
    if (baseA !== workBase) {
      const rec = convertFromDecimal(parseInt(digitsA, baseA), workBase);
      digitsA = rec.value;
    }
    if (baseB !== workBase) {
      const rec = convertFromDecimal(parseInt(digitsB, baseB), workBase);
      digitsB = rec.value;
    }
    steps.push({
      description: `Alinhando bases: operandos convertidos para base ${workBase}`,
      math: `${parsedA.digits}(${baseA}) → ${digitsA}(${workBase})  |  ${parsedB.digits}(${baseB}) → ${digitsB}(${workBase})`,
    });
  }

  // Determina o sinal do resultado
  const signA = parsedA.sign;
  const signB = parsedB.sign;

  if (signA !== signB) {
    // Sinais opostos: subtrai o menor absoluto do maior
    steps.push({
      description: `Sinais opostos (${signA === 1 ? "+" : "-"} vs ${signB === 1 ? "+" : "-"}) → delegando para subtração`,
    });
    // Determina qual é maior em valor absoluto
    const absValA = parseInt(digitsA, workBase);
    const absValB = parseInt(digitsB, workBase);
    let bigger: string;
    let smaller: string;
    let resultSign: 1 | -1;

    if (absValA >= absValB) {
      bigger = digitsA;
      smaller = digitsB;
      resultSign = signA;
    } else {
      bigger = digitsB;
      smaller = digitsA;
      resultSign = signB;
    }

    const subResult = subtractRaw(
      bigger,
      smaller,
      workBase,
      isPowerOfTwo(workBase),
    );

    // Converte para a base de saída
    const outDec = parseInt(subResult.value, workBase) * resultSign;
    const final = outDec < 0
      ? `-${convertFromDecimal(Math.abs(outDec), outBase).value}`
      : convertFromDecimal(outDec, outBase).value;

    steps.push(...subResult.steps);
    steps.push({
      description: `Resultado em ${nameOut}`,
      result: `${final} (base ${outBase})`,
    });

    return {
      value: final,
      steps,
      borrow: subResult.borrow,
      overflow: false,
    };
  }

  // Sinais iguais — soma absoluta
  const isNegative = signA === -1;

  // Adição coluna-por-coluna
  const colResult = addRaw(digitsA, digitsB, workBase);
  steps.push(...colResult.steps);

  const absValue = colResult.value;

  // Converte para a base de saída
  const absDecimal = parseInt(absValue, workBase);
  const final = isNegative
    ? `-${convertFromDecimal(absDecimal, outBase).value}`
    : convertFromDecimal(absDecimal, outBase).value;

  steps.push({
    description: `Resultado final em ${nameOut}`,
    result: `${final} (base ${outBase})`,
  });

  // Overflow: quando carry é true e o bit mais significativo indica overflow
  const overflow = colResult.carry && isPowerOfTwo(workBase);

  return {
    value: final,
    steps,
    carry: colResult.carry,
    overflow,
  };
}

/**
 * Adição bruta coluna-por-coluna (ignora sinal).
 * Retorna { value, steps, carry }.
 */
function addRaw(
  a: string,
  b: string,
  base: number,
): { value: string; steps: ConversionStep[]; carry: boolean } {
  const steps: ConversionStep[] = [];
  const [ap, bp, n] = padRight(a, b);

  steps.push({
    description: `Adição coluna a coluna (base ${base})`,
    math: `  ${ap}\n+ ${bp}\n${" ".repeat(Math.max(0, n + 2))}───`,
  });

  let carry = 0;
  const resultDigits: string[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const da = digitToValue(ap[i]);
    const db = digitToValue(bp[i]);
    const sum = da + db + carry;
    const digit = sum % base;
    carry = Math.floor(sum / base);

    resultDigits.unshift(valueToDigit(digit));

    steps.push({
      description: `Coluna ${n - i} (da direita)`,
      math: `${valueToDigit(da)} + ${valueToDigit(db)}${carry > 0 || (i < n - 1 && sum >= base) ? ` + ${sum - da - db} (vai-um)` : ""} = ${sum} → dígito ${valueToDigit(digit)}${carry > 0 ? `, vai ${carry}` : ""}`,
    });
  }

  // Se sobrou carry após a última coluna
  if (carry > 0) {
    resultDigits.unshift(valueToDigit(carry));
    steps.push({
      description: "Carry final (vai-um além da última coluna)",
      math: `+ ${carry} → dígito ${valueToDigit(carry)}`,
    });
  }

  const value = resultDigits.join("");

  steps.push({
    description: "Soma coluna-por-coluna concluída",
    result: `${value} (base ${base})`,
  });

  return { value, steps, carry: carry > 0 };
}

// ---------------------------------------------------------------------------
// Subtração
// ---------------------------------------------------------------------------

/**
 * Subtrai dois operandos em qualquer base (2-36).
 *
 * Estratégia:
 *  - Bases potência de 2 (2, 8, 16): usa complemento de 2 via módulo pai.
 *  - Outras bases: usa método de empréstimo (borrow) direto, coluna por coluna.
 *
 * Detecta borrow e overflow aritmético.
 */
export function subtract(
  a: string,
  baseA: Base,
  b: string,
  baseB: Base,
  outBase: Base,
): ArithmeticResult {
  const steps: ConversionStep[] = [];
  const parsedA = parseSigned(a);
  const parsedB = parseSigned(b);

  const nameA = getBaseName(baseA);
  const nameB = getBaseName(baseB);
  const nameOut = getBaseName(outBase);

  steps.push({
    description: `Subtração: ${a} (${nameA}) − ${b} (${nameB})`,
  });

  // Sinais: A - B com sinais pode ser convertido para adição
  // (+A) - (+B) = A - B  → subtração normal
  // (+A) - (-B) = A + B  → adição
  // (-A) - (+B) = -(A + B) → adição com resultado negativo
  // (-A) - (-B) = -A + B = B - A → subtrai A de B (ou adição com sinal trocado)
  const signA = parsedA.sign;
  const signB = parsedB.sign;

  if (signA === 1 && signB === -1) {
    // A - (-B) = A + B
    steps.push({
      description: `${a} − (${b}) = ${parsedA.digits} + ${parsedB.digits} → delegando para adição`,
    });
    const addResult = add(
      parsedA.digits,
      baseA,
      parsedB.digits,
      baseB,
      outBase,
    );
    steps.push(...addResult.steps);
    return {
      value: addResult.value,
      steps,
      carry: addResult.carry,
      overflow: addResult.overflow,
    };
  }

  if (signA === -1 && signB === 1) {
    // (-A) - (+B) = -(A + B)
    steps.push({
      description: `(${a}) − (${b}) = −(${parsedA.digits} + ${parsedB.digits}) → delegando para adição`,
    });
    const addResult = add(
      parsedA.digits,
      baseA,
      parsedB.digits,
      baseB,
      outBase,
    );
    steps.push(...addResult.steps);
    const negValue = addResult.value.startsWith("-")
      ? addResult.value.slice(1)
      : `-${addResult.value}`;
    return {
      value: negValue,
      steps,
      carry: addResult.carry,
      overflow: addResult.overflow,
    };
  }

  if (signA === -1 && signB === -1) {
    // (-A) - (-B) = B - A
    steps.push({
      description: `(${a}) − (${b}) = ${parsedB.digits} − ${parsedA.digits}`,
    });
    const revResult = subtract(
      parsedB.digits,
      baseB,
      parsedA.digits,
      baseA,
      outBase,
    );
    steps.push(...revResult.steps);
    return {
      value: revResult.value,
      steps,
      carry: revResult.carry,
      borrow: revResult.borrow,
      overflow: revResult.overflow,
    };
  }

  // Ambos positivos: A - B normal
  // Alinha bases
  let digitsA = parsedA.digits;
  let digitsB = parsedB.digits;
  let workBase: number = baseA;

  if (baseA !== baseB) {
    workBase = Math.max(baseA, baseB);
    if (baseA !== workBase) {
      digitsA = convertFromDecimal(parseInt(digitsA, baseA), workBase as Base).value;
    }
    if (baseB !== workBase) {
      digitsB = convertFromDecimal(parseInt(digitsB, baseB), workBase as Base).value;
    }
    steps.push({
      description: `Alinhando bases: operandos convertidos para base ${workBase}`,
      math: `${parsedA.digits}(${baseA}) → ${digitsA}(${workBase})  |  ${parsedB.digits}(${baseB}) → ${digitsB}(${workBase})`,
    });
  }

  // Verifica se A < B → resultado negativo
  const absA = parseInt(digitsA, workBase);
  const absB = parseInt(digitsB, workBase);

  if (absA < absB) {
    steps.push({
      description: `${digitsA} < ${digitsB} → resultado será negativo. Calculando ${digitsB} − ${digitsA}`,
    });
    const rev = subtractRaw(digitsB, digitsA, workBase, isPowerOfTwo(workBase));
    steps.push(...rev.steps);

    const negAbs = rev.value;
    const final = `-${convertFromDecimal(parseInt(negAbs, workBase), outBase).value}`;

    steps.push({
      description: `Resultado final em ${nameOut} (negativo)`,
      result: `${final} (base ${outBase})`,
    });

    return {
      value: final,
      steps,
      borrow: rev.borrow,
      overflow: false,
    };
  }

  // A >= B: subtração normal
  const subResult = subtractRaw(
    digitsA,
    digitsB,
    workBase,
    isPowerOfTwo(workBase),
  );
  steps.push(...subResult.steps);

  // Converte para base de saída
  const absDecimal = parseInt(subResult.value, workBase);
  const final = convertFromDecimal(absDecimal, outBase).value;

  steps.push({
    description: `Resultado final em ${nameOut}`,
    result: `${final} (base ${outBase})`,
  });

  return {
    value: final,
    steps,
    borrow: subResult.borrow,
    overflow: false,
  };
}

/**
 * Subtração bruta (A >= B, ambos positivos, mesma base).
 * `useTwosComplement`: se true, usa complemento de 2; senão usa borrow direto.
 */
function subtractRaw(
  a: string,
  b: string,
  base: number,
  useTwosComplement: boolean,
): { value: string; steps: ConversionStep[]; borrow: boolean } {
  if (useTwosComplement) {
    return subtractViaTwosComplement(a, b, base);
  }
  return subtractViaBorrow(a, b, base);
}

// ---------------------------------------------------------------------------
// Subtração via complemento de 2 (bases potência de 2)
// ---------------------------------------------------------------------------

function subtractViaTwosComplement(
  a: string,
  b: string,
  base: number,
): { value: string; steps: ConversionStep[]; borrow: boolean } {
  const steps: ConversionStep[] = [];

  steps.push({
    description: `Subtração via complemento de 2 (base ${base} é potência de 2)`,
  });

  // 1. Converte ambos para decimal
  const decA = parseInt(a, base);
  const decB = parseInt(b, base);

  steps.push({
    description: "Convertendo operandos para decimal",
    math: `${a}(${base}) = ${decA}  |  ${b}(${base}) = ${decB}`,
  });

  // 2. Determina a largura de bits (precisa caber o maior valor + 1 bit extra)
  const maxVal = Math.max(decA, decB);
  const bitWidth = Math.max(
    Math.ceil(Math.log2(maxVal + 1)) + 1,
    4, // mínimo 4 bits para exemplos educacionais
  );

  steps.push({
    description: `Largura de bits escolhida: ${bitWidth} bits (suficiente para representar ${maxVal})`,
  });

  // 3. Representa A e -B em complemento de 2
  const twosA = toTwosComplement(String(decA), 10, bitWidth);
  // -B em complemento de 2 = 2^bitWidth - B (representação unsigned)
  const twosNegB = toTwosComplement(
    String(Math.pow(2, bitWidth) - decB),
    10,
    bitWidth,
  );

  steps.push({
    description: "Representação em complemento de 2",
    math: `A = ${a} → ${twosA.binary}\n-B = -${b} → ${twosNegB.binary}`,
  });

  // 4. Soma binária dos padrões de bits
  const binResult = addRaw(twosA.binary, twosNegB.binary, 2);
  steps.push({
    description: "Soma binária (A + (−B) em complemento de 2)",
    math: `  ${twosA.binary}\n+ ${twosNegB.binary}\n  ${" ".repeat(bitWidth)}───\n  ${binResult.value}`,
  });

  // 5. Trunca para a largura e interpreta
  const truncated = binResult.value.slice(-bitWidth).padStart(bitWidth, "0");
  const decoded = fromTwosComplement(truncated, base as Base);

  steps.push({
    description: `Resultado truncado para ${bitWidth} bits: ${truncated}`,
  });
  steps.push({
    description: `Interpretação do complemento de 2: ${decoded.decimal} decimal`,
    math: `${truncated} → ${decoded.decimal}`,
  });

  // Converte para a base alvo
  const absResult = convertFromDecimal(
    Math.abs(decoded.decimal),
    base as Base,
  );

  const finalValue = decoded.decimal < 0
    ? `-${absResult.value}`
    : absResult.value;

  steps.push({
    description: "Resultado da subtração via complemento de 2",
    result: `${finalValue} (base ${base})`,
  });

  // Borrow detection: se o resultado do complemento de 2 deu negativo,
  // significa que houve borrow (A < B, mas já tratamos isso antes chamando subtractRaw)
  const borrow = decoded.decimal < 0;

  return {
    value: finalValue,
    steps,
    borrow,
  };
}

// ---------------------------------------------------------------------------
// Subtração via empréstimo/borrow direto (bases não potência de 2)
// ---------------------------------------------------------------------------

function subtractViaBorrow(
  a: string,
  b: string,
  base: number,
): { value: string; steps: ConversionStep[]; borrow: boolean } {
  const steps: ConversionStep[] = [];
  const [ap, bp, n] = padRight(a, b);

  steps.push({
    description: `Subtração via empréstimo (borrow), coluna a coluna (base ${base})`,
    math: `  ${ap}\n− ${bp}\n${" ".repeat(Math.max(0, n + 2))}───`,
  });

  const resultDigits: string[] = [];
  let borrow = 0;
  let hadBorrow = false;

  for (let i = n - 1; i >= 0; i--) {
    let da = digitToValue(ap[i]) - borrow;
    const db = digitToValue(bp[i]);

    if (da < db) {
      // Precisa pedir emprestado da próxima coluna
      da += base;
      borrow = 1;
      hadBorrow = true;
    } else {
      borrow = 0;
    }

    const diff = da - db;
    resultDigits.unshift(valueToDigit(diff));

    const borrowNote = da >= db + (borrow === 1 ? 0 : 0) && borrow === 0
      ? ""
      : borrow === 1
        ? " (emprestou 1 da esquerda)"
        : "";

    steps.push({
      description: `Coluna ${n - i} (da direita)`,
      math: `${valueToDigit(da)} − ${valueToDigit(db)}${borrowNote} = ${diff} → dígito ${valueToDigit(diff)}`,
    });
  }

  // Remove zeros à esquerda (exceto se for o único dígito)
  let value = resultDigits.join("").replace(/^0+(?=\d)/, "");
  if (value === "") value = "0";

  steps.push({
    description: "Subtração via empréstimo concluída",
    result: `${value} (base ${base})`,
  });

  return {
    value,
    steps,
    borrow: hadBorrow,
  };
}
