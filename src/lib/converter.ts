export type Base = 2 | 3 | 5 | 7 | 8 | 10 | 12 | 16 | 20 | 36;

export interface ConversionStep {
  description?: string;
  math?: string;
  result?: string;
}

export interface ConversionResult {
  value: string;
  steps: ConversionStep[];
}

export interface ConversionRecord {
  id: string;
  inputValue: string;
  inputBase: Base;
  outputValue: string;
  outputBase: Base;
  steps: ConversionStep[];
  timestamp: number;
}

const BASE_NAMES: Record<Base, string> = {
  2: "Binário",
  3: "Ternário",
  5: "Quinário",
  7: "Setenário",
  8: "Octal",
  10: "Decimal",
  12: "Duodecimal",
  16: "Hexadecimal",
  20: "Vigesimal",
  36: "Hexatrigesimal",
};

const HEX_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function getBaseName(base: Base): string {
  return BASE_NAMES[base];
}

export function digitToValue(digit: string): number {
  if (!digit) return NaN;
  const upper = digit.toUpperCase();
  const index = HEX_DIGITS.indexOf(upper);
  return index >= 0 ? index : NaN;
}

export function valueToDigit(value: number): string {
  if (value < 0 || value > 35) return "?";
  return HEX_DIGITS[value];
}

export function isValidForBase(digit: string, base: Base): boolean {
  const val = digitToValue(digit);
  return !isNaN(val) && val < base;
}

export function filterInput(input: string, base: Base): string {
  const chars = input.split("");
  let dotCount = 0;
  const filtered = chars.map((char) => {
    if (char === ".") {
      dotCount++;
      if (dotCount > 1) return "";
      return char;
    }
    if (isValidForBase(char, base)) return char;
    return "";
  });
  let result = filtered.join("").toUpperCase();
  if (result === ".") result = "0";
  if (result.startsWith(".")) result = "0" + result;
  if (result.endsWith(".")) result = result.slice(0, -1);
  return result;
}

export function convertToDecimal(value: string, base: Base): ConversionResult {
  const steps: ConversionStep[] = [];
  const isNegative = value.trimStart().startsWith("-");
  const absValue = isNegative ? value.trimStart().slice(1) : value.trimStart();
  const [intPart, fracPart] = absValue.split(".");
  let total = 0;

  steps.push({
    description: `Conversão de ${BASE_NAMES[base]} para Decimal${isNegative ? " (valor negativo)" : ""}`,
  });
  steps.push({ description: `Parte inteira: ${isNegative ? "-" : ""}${intPart || "0"}` });

  const digits = (intPart || "0").split("");
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    const val = digitToValue(digit);
    const power = digits.length - 1 - i;
    const term = val * Math.pow(base, power);
    steps.push({
      math: `${digit} × ${base}^${power} = ${val} × ${Math.pow(base, power)} = ${term}`,
    });
    total += term;
  }

  if (isNegative) total = -total;
  steps.push({ description: `Soma da parte inteira: ${total}`, result: String(total) });

  if (fracPart) {
    steps.push({ description: `Parte fracionária: ${fracPart}` });
    for (let i = 0; i < fracPart.length; i++) {
      const digit = fracPart[i];
      const val = digitToValue(digit);
      const power = -(i + 1);
      const term = val * Math.pow(base, power);
      steps.push({
        math: `${digit} × ${base}^(${power}) = ${val} × ${Math.pow(base, power).toFixed(6)} = ${term.toFixed(6)}`,
      });
      total += term;
    }
  }

  return { value: String(total), steps };
}

export function convertFromDecimal(value: number, targetBase: Base): ConversionResult {
  const steps: ConversionStep[] = [];
  steps.push({ description: `Conversão de Decimal para ${BASE_NAMES[targetBase]}` });

  const intPart = Math.floor(value);
  const fracPart = value - intPart;

  let dividend = intPart;
  const remainders: number[] = [];

  steps.push({ description: `Parte inteira: ${intPart}` });

  if (dividend === 0) {
    remainders.push(0);
    steps.push({ math: `0 ÷ ${targetBase} = 0, resto 0` });
  }

  while (dividend > 0) {
    const quotient = Math.floor(dividend / targetBase);
    const remainder = dividend % targetBase;
    remainders.push(remainder);
    steps.push({
      math: `${dividend} ÷ ${targetBase} = ${quotient}, resto ${valueToDigit(remainder)}`,
    });
    dividend = quotient;
  }

  let intResult = remainders.reverse().map(valueToDigit).join("");
  steps.push({
    description: `Lendo os restos de baixo para cima: ${intResult}`,
    result: intResult,
  });

  let fracResult = "";
  if (fracPart > 0) {
    steps.push({ description: `Parte fracionária: ${fracPart.toFixed(6)}` });
    let currentFrac = fracPart;
    let iterations = 0;
    const maxIterations = 10;

    while (currentFrac > 0 && iterations < maxIterations) {
      currentFrac *= targetBase;
      const digit = Math.floor(currentFrac);
      fracResult += valueToDigit(digit);
      steps.push({
        math: `${(currentFrac / targetBase).toFixed(6)} × ${targetBase} = ${currentFrac.toFixed(6)} → dígito ${valueToDigit(digit)}`,
      });
      currentFrac -= digit;
      iterations++;
    }
  }

  const finalValue = fracResult ? `${intResult}.${fracResult}` : intResult;
  return { value: finalValue, steps };
}

export function convert(value: string, fromBase: Base, toBase: Base): ConversionResult {
  if (fromBase === toBase) {
    return {
      value,
      steps: [{ description: `Mesma base (${BASE_NAMES[fromBase]}), valor permanece ${value}` }],
    };
  }
  if (fromBase === 10) {
    return convertFromDecimal(parseFloat(value), toBase);
  }
  if (toBase === 10) {
    return convertToDecimal(value, fromBase);
  }
  const decimal = convertToDecimal(value, fromBase);
  const result = convertFromDecimal(parseFloat(decimal.value), toBase);
  return {
    value: result.value,
    steps: [
      { description: `Conversão indireta: ${BASE_NAMES[fromBase]} → Decimal → ${BASE_NAMES[toBase]}` },
      ...decimal.steps,
      ...result.steps,
    ],
  };
}
