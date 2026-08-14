import { Base } from "./converter";

export type BitwiseOp = "AND" | "OR" | "XOR";
export type ShiftDir = "left" | "right";

export interface BitwiseResult {
  value: string;
  base: Base;
  binaryInternal: string;
}

export interface BitwiseStep {
  description: string;
  math?: string;
  result?: string;
}

function parseToBigInt(value: string, base: Base): bigint {
  const clean = value.replace(/\./g, "");
  if (clean === "") return 0n;
  return BigInt(parseInt(clean, base));
}

function bigIntToBase(value: bigint, base: Base): string {
  if (value === 0n) return "0";
  let digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const b = BigInt(base);
  let v = value;
  while (v > 0n) {
    result = digits[Number(v % b)] + result;
    v = v / b;
  }
  return result;
}

function toBinaryString(value: bigint, bitWidth?: number): string {
  if (value === 0n) return "0";
  let bin = value.toString(2);
  if (bitWidth !== undefined && bitWidth > 0) {
    const mask = (1n << BigInt(bitWidth)) - 1n;
    value = value & mask;
    bin = value.toString(2).padStart(bitWidth, "0");
  }
  return bin;
}

function applyMask(value: bigint, bitWidth?: number): bigint {
  if (bitWidth === undefined || bitWidth <= 0) return value;
  const mask = (1n << BigInt(bitWidth)) - 1n;
  return value & mask;
}

export function bitwiseOp(
  a: string,
  baseA: Base,
  b: string,
  baseB: Base,
  op: BitwiseOp,
  outBase: Base,
  bitWidth?: number
): { result: BitwiseResult; steps: BitwiseStep[] } {
  const steps: BitwiseStep[] = [];

  steps.push({
    description: `Operação ${op}: ${a} (base ${baseA}) e ${b} (base ${baseB})`,
  });

  const bigA = parseToBigInt(a, baseA);
  const bigB = parseToBigInt(b, baseB);

  steps.push({
    description: "Primeiro operando em decimal e binário",
    math: `${a} base ${baseA} = ${bigA.toString()} decimal (0b${bigA.toString(2)})`,
  });
  steps.push({
    description: "Segundo operando em decimal e binário",
    math: `${b} base ${baseB} = ${bigB.toString()} decimal (0b${bigB.toString(2)})`,
  });

  const maskedA = applyMask(bigA, bitWidth);
  const maskedB = applyMask(bigB, bitWidth);

  if (bitWidth !== undefined && bitWidth > 0) {
    steps.push({
      description: `Máscara de ${bitWidth} bits aplicada`,
      math: `A = ${maskedA.toString()} (0b${maskedA.toString(2).padStart(bitWidth, "0")}), B = ${maskedB.toString()} (0b${maskedB.toString(2).padStart(bitWidth, "0")})`,
    });
  }

  let resultBig: bigint;
  switch (op) {
    case "AND":
      resultBig = maskedA & maskedB;
      break;
    case "OR":
      resultBig = maskedA | maskedB;
      break;
    case "XOR":
      resultBig = maskedA ^ maskedB;
      break;
  }

  steps.push({
    description: "Operação bit a bit em binário",
    math: `0b${maskedA.toString(2)} ${op} 0b${maskedB.toString(2)} = 0b${resultBig.toString(2)}`,
  });

  const finalResult = applyMask(resultBig, bitWidth);
  const binInternal = toBinaryString(finalResult, bitWidth);

  steps.push({
    description: "Resultado em decimal",
    math: `Resultado decimal: ${finalResult.toString()}`,
  });

  const outValue = bigIntToBase(finalResult, outBase);

  steps.push({
    description: `Convertendo ${finalResult.toString()} decimal para base ${outBase}`,
    result: `${outValue} (base ${outBase})`,
  });

  return {
    result: {
      value: outValue,
      base: outBase,
      binaryInternal: binInternal,
    },
    steps,
  };
}

export function shiftOp(
  value: string,
  inBase: Base,
  dir: ShiftDir,
  amount: number,
  outBase: Base,
  bitWidth?: number
): { result: BitwiseResult; steps: BitwiseStep[] } {
  const steps: BitwiseStep[] = [];
  const arrow = dir === "left" ? "<<" : ">>";

  steps.push({
    description: `Shift ${dir}: ${value} (base ${inBase}) ${arrow} ${amount}`,
  });

  const bigVal = parseToBigInt(value, inBase);
  steps.push({
    description: "Valor em decimal e binário",
    math: `${value} base ${inBase} = ${bigVal.toString()} decimal (0b${bigVal.toString(2)})`,
  });

  let resultBig: bigint;

  if (inBase === 2 || outBase === 2) {
    if (dir === "left") {
      resultBig = bigVal << BigInt(amount);
    } else {
      resultBig = bigVal >> BigInt(amount);
    }
    steps.push({
      description: "Operação de shift em binário",
      math: `0b${bigVal.toString(2)} ${arrow} ${amount} = 0b${resultBig.toString(2)}`,
    });

    if (bitWidth !== undefined && bitWidth > 0) {
      resultBig = applyMask(resultBig, bitWidth);
      steps.push({
        description: `Máscara de ${bitWidth} bits aplicada no resultado`,
        math: `Resultado truncado: 0b${resultBig.toString(2).padStart(bitWidth, "0")}`,
      });
    }
  } else {
    const factor = BigInt(inBase) ** BigInt(amount);
    if (dir === "left") {
      resultBig = bigVal * factor;
      steps.push({
        description: "Multiplicação pela potência da base",
        math: `${bigVal.toString()} × ${inBase}^${amount} (${factor.toString()}) = ${resultBig.toString()}`,
      });
    } else {
      resultBig = bigVal / factor;
      const remainder = bigVal % factor;
      steps.push({
        description: "Divisão pela potência da base",
        math: `${bigVal.toString()} ÷ ${inBase}^${amount} (${factor.toString()}) = ${resultBig.toString()}, resto ${remainder.toString()}`,
      });
    }
  }

  const outValue = bigIntToBase(resultBig, outBase);
  const binInternal = toBinaryString(resultBig, bitWidth);

  steps.push({
    description: `Convertendo ${resultBig.toString()} decimal para base ${outBase}`,
    result: `${outValue} (base ${outBase})`,
  });

  return {
    result: {
      value: outValue,
      base: outBase,
      binaryInternal: binInternal,
    },
    steps,
  };
}
